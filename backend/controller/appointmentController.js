import { Appointment } from '../models/appointment.js';
import { Patient } from '../models/patient.js';
import { Whatsapp } from '../models/whatsapp.js';

// Import WhatsApp integration
import { bookAppointment } from "../whatsappClient.js";

const doTimesOverlap = (start1, end1, start2, end2) => {
  return (start1 < end2 && end1 > start2);
};

const doctorName = "Dr. Shourya Hegde";

export const createAppointment = async (req , res) => {

  const { patientId , patientName , date , startTime , endTime , treatmentType , clinicName} = req.body;

  try{

    const appointmentDate = new Date(date);

    const overlappingAppointments = await Appointment.find({
      // dentistId: dentistId,
      date: date
    });

    const patientAppointmentOnSameDay = await Appointment.findOne({
      patientId: patientId,
      date: date,
      status : "scheduled"
    });

    const isOverlapping = overlappingAppointments.some(appointment => 
      doTimesOverlap(startTime, endTime, appointment.startTime, appointment.endTime)
    );

    if (isOverlapping) {
      return res.status(409).json({ 
        error: `There is an overlapping appointment. Please choose another time slot.`
      });
    }

    if (patientAppointmentOnSameDay) {
      return res.status(409).json({ 
        error: `The patient already has an appointment scheduled on ${date}. Please choose another date.`
      });
    }

    const appointment = new Appointment({
      patientId,
      patientName,
      date: appointmentDate,
      startTime : `${date}T${startTime}:00.000`,
      endTime: `${date}T${endTime}:00.000`,
      status: 'scheduled',
      clinicName : clinicName,
      treatmentType
    });

    await appointment.save();

    const patientDetails = await Patient.findOne({patientId : patientId})

    if(patientDetails){
      // Simulate booking an appointment and sending a WhatsApp message
      bookAppointment(doctorName, patientName, "91" + patientDetails.mobile, `${date} ${startTime}`);
    }

    const whatsappMessageSaver = new Whatsapp({
      patientName : patientName,
      patientId : patientId,
      clinicName : clinicName,
      appointmentAt : `${date}T${startTime}:00.000`
    })

    await whatsappMessageSaver.save();

    res.status(201).json(appointment);

  }catch(error){

    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'An error occurred while creating the appointment' });
  
  }
}

export const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Get the next day

    // Query to find appointments with today's date
    const appointments = await Appointment.find({
        date: {
            $gte: today,
            $lt: tomorrow
        }
    })

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTodayAppointmentByClinic = async (req , res) => {

  const {clinic} = req.params;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Get the next day

    // Query to find appointments with today's date
    const appointments = await Appointment.find({
        date: {
            $gte: today,
            $lt: tomorrow
        },
        clinicName : clinic
    })

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

}

export const getTodaysAppointmentStatus = async (req , res) => {

  const {clinic} = req.params;

  try{

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Get the next day

    const totalScheduledAppointments = await Appointment.find({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      clinicName : clinic,
      status : "scheduled"
    })

    const totalCompletedAppointments = await Appointment.find({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      clinicName : clinic,
      status : "completed"
    })

    res.send(`${totalCompletedAppointments.length}/${Number(totalCompletedAppointments.length) + Number(totalScheduledAppointments.length)}`)

  }catch(error){
      res.status(400).json({ error: error.message });
  }
}

export const getAllAppointments = async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      date: { $gte: today }, 
      status: 'scheduled'   
    }).sort({ date: 1, startTime: 1 }); 

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllAppointmentByClinic = async (req , res) => {

  const {clinic} = req.params;

  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      date: { $gte: today }, 
      status: 'scheduled',
      clinicName : clinic   
    }).sort({ date: 1, startTime: 1 }); 

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export const updateAppointment = async (req, res) => {
  const {patientId} = req.params;
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: patientId},
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({message : "Appointment updated successfully" , appointment});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  const {patientId} = req.params;
  try {
    const appointment = await Appointment.findOneAndDelete({ _id: patientId });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled successfully' , appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

