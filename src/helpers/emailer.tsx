'use server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_SERVER_USERNAME,
    pass: process.env.SMTP_SERVER_PASSWORD,
  },
});

export async function sendMail({
  email,
  sendTo,
  subject,
  name,
  text,
  phone,
  zipcode,
  html,
}: {
  email: string;
  sendTo?: string;
  subject: string;
  name: string;
  text: string;
  phone: string;
  zipcode: string;
  html?: string;
}) {
  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return;
  }

  const messageText = `name: ${name}\nphone: ${phone}\nzipcode: ${zipcode}\nMessage: ${text}`;

  const info = await transporter.sendMail({
    from: email,
    to: sendTo || process.env.SITE_MAIL_RECIEVER,
    subject,
    text: messageText,
    html: html ?? '',
  });

  console.log('Message sent:', info.messageId);
  return info;
}
