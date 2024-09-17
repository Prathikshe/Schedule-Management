import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FaTooth } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          "http://localhost:4000/api/v1/user/login",
          { email, password, confirmPassword, role: "Admin" },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          navigateTo("/");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <section className="form-component flex-row">
        <div className="flex-column">
          <h1 className="one-dentist">
            <FaTooth className="one-dentist" />
            One Dentist
          </h1>
          <img src="/Shourya.png" alt="logo" className="logo" />
          <p>Only Admins Are Allowed To Access These Resources!</p>
        </div>
        <div className="form-component">
          <h1>LOGIN</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div style={{ justifyContent: "center", alignItems: "center" }}>
              <button type="submit">Login</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Login;