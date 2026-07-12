import nodemailer from "nodemailer";

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"CollegeKart" <${process.env.SMTP_USER}>`,
      to,
      subject: "CollegeKart Verification Code",
      html: `
        <h2>Your OTP is</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    console.log("✅ OTP Email Sent");
  } catch (err) {
    console.error(err);
    throw err;
  }
};