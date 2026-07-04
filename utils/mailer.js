const nodemailer = require("nodemailer");

const hasSmtpConfig = process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD;

let transporter = null;
if (hasSmtpConfig) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_APP_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });
    transporter.verify((err) => {
        if (err) {
            console.error("[MAILER] SMTP connection failed:", err.message);
        } else {
            console.log(`[MAILER] SMTP ready — sending real emails from ${process.env.SMTP_EMAIL}`);
        }
    });
}

function otpEmailHtml(otp) {
    return `
    <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);font-family:'Segoe UI',sans-serif;">
      <div style="background:#0d9488;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Verify Your Email</h1>
      </div>
      <div style="padding:36px 40px;color:#374151;line-height:1.6;">
        <p>Welcome to Wanderlust! Use the code below to verify your email address:</p>
        <div style="background:#f0fdfa;border:2px dashed #99f6e4;border-radius:8px;text-align:center;padding:24px;margin:24px 0;">
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0d9488;">${otp}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:8px;">Valid for 10 minutes &middot; Do not share this code</div>
        </div>
        <p>If you did not create an account, you can safely ignore this email.</p>
      </div>
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">Automated message &mdash; please do not reply.</p>
      </div>
    </div>`;
}

module.exports.sendOtpEmail = async (toEmail, otp) => {
    if (!transporter) {
        console.log("=========================================");
        console.log(`[DEV MAILER] No SMTP configured. OTP for ${toEmail}: ${otp}`);
        console.log("=========================================");
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL,
            to: toEmail,
            subject: "Verify your email address",
            html: otpEmailHtml(otp)
        });
        console.log(`[MAILER] OTP email sent to ${toEmail}`);
    } catch (err) {
        console.error(`[MAILER] Failed to send to ${toEmail}:`, err.message);
        throw err;
    }
};
