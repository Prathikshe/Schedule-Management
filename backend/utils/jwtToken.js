export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  // Determine the cookie name based on the user's role
  const cookieName = user.role;

  function getUserType(cookieName){
    switch(cookieName){
      case "Admin":
        return "adminToken"
        break;
      case "Doctor":
        return "doctorToken"
        break;
      case "User":
        return "userToken"
        break;
    }
  }

  res
    .status(statusCode)
    .cookie(getUserType(cookieName), token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
      cookieName
    });
};