const User = require("../MODELS/user.js");
const { sendOtpEmail } = require("../utils/mailer.js");
const {
    generateOtp,
    generateRememberToken,
    hashValue,
    OTP_MAX_ATTEMPTS,
    REMEMBER_EXPIRE_DAYS
} = require("../utils/tokens.js");

const REMEMBER_COOKIE = "remember_me";

function issueRememberCookie(res, user) {
    const { token, tokenHash, tokenExpires } = generateRememberToken();
    user.rememberTokenHash = tokenHash;
    user.rememberTokenExpires = tokenExpires;
    res.cookie(REMEMBER_COOKIE, `${user._id}:${token}`, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: REMEMBER_EXPIRE_DAYS * 24 * 60 * 60 * 1000
    });
}

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const { otp, otpHash, otpExpires } = generateOtp();
        newUser.otpHash = otpHash;
        newUser.otpExpires = otpExpires;
        newUser.otpAttempts = 0;
        newUser.isVerified = false;
        await User.register(newUser, password);
        await sendOtpEmail(email, otp);
        req.session.pendingUserId = newUser._id;
        req.flash("success", "We sent a verification code to your email.");
        res.redirect("/verify-otp");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderVerifyForm = (req, res) => {
    if (!req.session.pendingUserId) {
        req.flash("error", "No pending verification. Please sign up or log in.");
        return res.redirect("/signup");
    }
    res.render("users/verify.ejs");
};

module.exports.verifyOtp = async (req, res, next) => {
    const userId = req.session.pendingUserId;
    if (!userId) {
        req.flash("error", "No pending verification. Please sign up again.");
        return res.redirect("/signup");
    }
    const otp = (req.body.otp || "").trim();
    const user = await User.findById(userId);
    if (!user) {
        req.flash("error", "User not found. Please sign up again.");
        return res.redirect("/signup");
    }
    if (!user.otpExpires || user.otpExpires < new Date()) {
        req.flash("error", "Code expired. Please request a new one.");
        return res.redirect("/verify-otp");
    }
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
        req.flash("error", "Too many attempts. Please request a new code.");
        return res.redirect("/verify-otp");
    }
    if (user.otpHash !== hashValue(otp)) {
        user.otpAttempts += 1;
        await user.save();
        req.flash("error", "Invalid code. Please try again.");
        return res.redirect("/verify-otp");
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();
    delete req.session.pendingUserId;

    req.login(user, (err) => {
        if (err) return next(err);
        req.flash("success", "Email verified! Welcome to Wanderlust.");
        res.redirect("/listings");
    });
};

module.exports.resendOtp = async (req, res) => {
    const userId = req.session.pendingUserId;
    if (!userId) {
        req.flash("error", "No pending verification. Please sign up again.");
        return res.redirect("/signup");
    }
    const user = await User.findById(userId);
    if (!user) {
        req.flash("error", "User not found. Please sign up again.");
        return res.redirect("/signup");
    }
    const { otp, otpHash, otpExpires } = generateOtp();
    user.otpHash = otpHash;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();
    await sendOtpEmail(user.email, otp);
    req.flash("success", "A new code has been sent to your email.");
    res.redirect("/verify-otp");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    if (req.body.remember) {
        const user = await User.findById(req.user._id);
        issueRememberCookie(res, user);
        await user.save();
    }
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = async (req, res, next) => {
    const raw = req.cookies && req.cookies[REMEMBER_COOKIE];
    if (raw) {
        const [userId] = raw.split(":");
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $unset: { rememberTokenHash: "", rememberTokenExpires: "" }
            });
        }
        res.clearCookie(REMEMBER_COOKIE);
    }
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out");
        res.redirect("/listings");
    });
};
