// models/otpModel.js
import mongoose from"mongoose";
import mailSender from "../utils/mailSender.js";
import User from "./userSchema.js";

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});



// Define a function to send emails
async function sendVerificationEmail(email, otp) {
  console.log(email, otp);

  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <h1 style="font-size: 24px; font-weight: bold; color: #4f46e5;">Welcome to Mobilify!</h1>
          <p style="font-size: 16px; color: #6b7280;">Your trusted app for seamless communication.</p>
        </div>
        <div style="padding: 20px; text-align: center;">
          <h2 style="font-size: 20px; font-weight: bold; color: #4f46e5;">Verify Your Email Address</h2>
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Please use the OTP code below to verify your email address:</p>
          <p style="font-size: 24px; font-weight: bold; color: #4f46e5; background-color: #e0e7ff; padding: 10px 20px; border-radius: 8px; display: inline-block;">${otp}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            This OTP is valid for the next 10 minutes. If you didn’t request this email, please ignore it.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            &copy; ${new Date().getFullYear()} Mobilify. All rights reserved.
          </p>
        </div>
      </div>
      `
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}


otpSchema.pre("save", async function (next) {
  console.log("New document saved to the database");

  if (this.isNew) {
    try {
      if (this.email) {
        await sendVerificationEmail(this.email, this.otp);
      } else {
        console.log("User not found, cannot send OTP email");
      }
    } catch (error) {
      console.log("Error occurred while fetching user email: ", error);
      throw error;
    }
  }
  next();
});

export const OTP = mongoose.model("OTP", otpSchema);
