import User from "../Models/UserModel.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../Utils/generateOTP.js";
import jwt from "jsonwebtoken" 
import {sendEmail} from "../Utils/sendEmail.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;


    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }


    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });


    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 12);


    const otp = generateOTP();


    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });



    try {

      await sendEmail({
        to: user.email,
        subject: "Verify your Hyphen Sales AI account 🔐",
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">

            <table width="100%" cellpadding="0" cellspacing="0" 
              style="background:#f5f5f5;padding:40px 0;">
              <tr>
                <td align="center">

                  <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:12px;padding:40px;">

                    <tr>
                      <td>

                        <h1 style="color:#111;font-size:30px;">
                          Verify your Hyphen Sales AI account 🚀
                        </h1>


                        <p style="font-size:16px;color:#444;line-height:28px;">
                          Hi ${user.fullName},
                        </p>


                        <p style="font-size:16px;color:#444;line-height:28px;">
                          Thank you for creating your Hyphen Sales AI account.
                          Please use the verification code below to complete your registration.
                        </p>


                        <div style="
                          background:#f3f3f3;
                          padding:25px;
                          border-radius:10px;
                          text-align:center;
                          margin:30px 0;
                        ">

                          <p style="color:#666;font-size:14px;">
                            Your OTP Code
                          </p>


                          <h2 style="
                            font-size:36px;
                            letter-spacing:8px;
                            color:#111;
                            margin:0;
                          ">
                            ${otp}
                          </h2>

                        </div>


                        <p style="font-size:16px;color:#444;line-height:28px;">
                          This verification code expires in 10 minutes.
                          If you did not create this account, you can ignore this email.
                        </p>


                        <hr style="
                          border:none;
                          border-top:1px solid #e5e5e5;
                          margin:30px 0;
                        "/>


                        <p style="font-size:15px;color:#666;">
                          Welcome aboard,
                        </p>


                        <p style="
                          font-size:17px;
                          font-weight:bold;
                          color:#111;
                        ">
                          The Hyphen Team
                        </p>


                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

          </body>
          </html>
        `,
      });


    } catch (emailError) {

      console.error(
        "OTP email sending failed:",
        emailError
      );

      // Remove created user if email fails
      await User.findByIdAndDelete(user._id);


      return res.status(500).json({
        success:false,
        message:"Account creation failed. Could not send verification email.",
      });

    }



    return res.status(201).json({
      success:true,
      message:"Account created. Check your email for the OTP.",
      email:user.email,
    });


  } catch(error){

    console.error("Signup error:", error);


    return res.status(500).json({
      success:false,
      message:"Internal server error.",
    });

  }
};





export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
       user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};




export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};