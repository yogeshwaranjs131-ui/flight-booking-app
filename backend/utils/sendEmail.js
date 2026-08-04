import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter using your email service credentials
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // For production, it's highly recommended to use a transactional email service
    // like SendGrid, Mailgun, or AWS SES instead of a personal Gmail account.
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Flight Booking <noreply@flightbooking.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;