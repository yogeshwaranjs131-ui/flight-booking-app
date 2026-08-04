import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Email Sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Email Error:",
      error.message
    );
    throw error;
  }
};

/**
 * Booking Confirmation Email
 */
export const sendBookingConfirmation =
  async (userEmail, booking) => {
    const html = `
      <h2>Flight Booking Confirmed</h2>
      <p>Your booking has been confirmed.</p>

      <p><strong>PNR:</strong> ${booking.pnr}</p>
      <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>

      <p>Thank you for choosing us.</p>
    `;

    return await sendEmail({
      to: userEmail,
      subject: "Flight Booking Confirmation",
      html,
    });
  };
