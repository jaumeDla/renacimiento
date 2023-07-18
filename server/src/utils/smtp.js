const nodemailer = require('nodemailer');

class SMTP {
    static async sendEmail(email, subject, message, callback) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailContent = {
                from: process.env.SMTP_USER,
                to: email,
                subject: subject,
                html: message
            };

            await transporter.sendMail(mailContent);
            console.log(`📧 ${callback} email sent to ${email}`);
        } catch (error) {
            console.error(`⛔ Error sending ${callback} to ${email}`);
        }
    }

    static async sendReceipt(email, receipt) {
        const subject = 'Receipt of payment';
        const message = `<a href=${receipt}>Click here to see the receipt of your payment</a>`
        await SMTP.sendEmail(email, subject, message, 'Receipt');
    }

    static async sendVerify(email, tokenVerify) {
        const subject = 'Verify your account';
        const message = `<a href=http://localhost:5000/auth/verify?tokenVerify=${tokenVerify}>Click here to verify your account</a>`
        await SMTP.sendEmail(email, subject, message, 'Verify');
    }

    static async sendRecovery(email, tokenRecovery) {
        const subject = "Recover your account";
        const message = `<a href=http://localhost:5000/auth/pass-recovery?tokenRecovery=${tokenRecovery}>Click here to change your password</a>`;
        console.log(`http://localhost:5000/auth/pass-recovery?tokenRecovery=${tokenRecovery}`)
        await SMTP.sendEmail(email, subject, message, 'Recovery')
    }
}

module.exports = SMTP;