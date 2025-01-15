import nodemailer, { SendMailOptions } from "nodemailer";
import BadRequestError from "../errors/BadRequestError";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

const sendEmail = async (
  recipientEmail: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  const mailDetails: SendMailOptions = {
    from: process.env.NODEMAILER_USER,
    to: recipientEmail,
    subject,
    text: "",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailDetails);
  } catch (error) {
    throw new BadRequestError("Error, unable to send email");
  }
};

export default sendEmail;
