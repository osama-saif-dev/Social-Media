import nodemailer  from 'nodemailer';

export const sendEmail = async ({ to, subject, text }) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transport.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    })
}