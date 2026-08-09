import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTPEmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CollegeKart <noreply@collegekart.shop>',
      to,
      subject: 'CollegeKart Verification Code',
      html: `
        <h2>Your OTP is</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message || 'Failed to send OTP email');
    }

    console.log('✅ OTP Email Sent via Resend:', data?.id);
  } catch (err) {
    console.error(err);
    throw err;
  }
};