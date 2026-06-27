require("dotenv").config();
const { sendOtpEmail } = require("./mailer.js");

const to = process.argv[2] || process.env.SMTP_EMAIL;

if (!to) {
    console.log("Usage: node utils/testMail.js your@email.com");
    process.exit(1);
}

(async () => {
    console.log(`Sending a test OTP to ${to} ...`);
    try {
        await sendOtpEmail(to, "123456");
        console.log("Done. Check the inbox (and spam folder).");
    } catch (e) {
        console.error("Send failed:", e.message);
    }
    process.exit(0);
})();
