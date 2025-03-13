const nodemailer = require("nodemailer");
const crypto = require("crypto");

const otpStorage = new Map(); // Temporary storage for OTPs

// ✅ Configure Nodemailer Correctly
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, // Fixes some TLS-related errors
  },
});

// ✅ Generate a 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ✅ Send OTP to Farmingdale Email
const sendOTP = async (email) => {
  if (!email.endsWith("@farmingdale.edu")) {
    throw new Error("Only Farmingdale.edu emails are allowed for signup.");
  }

  const otp = generateOTP();
  otpStorage.set(email, { otp, timestamp: Date.now() });

  const mailOptions = {
    from: `"Swift Campus Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code for Swift Campus",
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    return otp;
  } catch (error) {
    console.error("❌ OTP Sending Error:", error);
    throw new Error("Failed to send OTP. Please check email settings.");
  }
};

// ✅ Verify OTP (expires after 10 minutes)
const verifyOTP = (email, otp) => {
  const storedOtp = otpStorage.get(email);
  if (!storedOtp) return false;

  const currentTime = Date.now();
  const otpExpiration = 10 * 60 * 1000; // 10 minutes expiration

  if (currentTime - storedOtp.timestamp > otpExpiration) {
    otpStorage.delete(email);
    return false; // OTP Expired
  }

  if (storedOtp.otp === otp) {
    otpStorage.delete(email);
    return true;
  }

  return false;
};

module.exports = { sendOTP, verifyOTP };
