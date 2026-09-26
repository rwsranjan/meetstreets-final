import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.meetstreet.in',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465
    auth: {
      user: process.env.EMAIL_USER || 'support@meetstreet.in',
      pass: process.env.EMAIL_PASS || '',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER || '"MeetStreet" <support@meetstreet.in>',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
