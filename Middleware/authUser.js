import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";


export const authUser = async (req, res, next) => {
  try {

    // Get token from header
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }


    // Extract token
    const token = authHeader.split(" ")[1];


    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // Find user
    const user = await User.findById(decoded.userId);


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }


    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    };


    next();


  } catch (error) {

    console.error("Auth middleware error:", error);


    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });

  }
};


// export default protect;