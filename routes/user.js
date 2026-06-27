const express=require("express");
const router=express.Router();
const User=require("../MODELS/user.js");
const wrapAsync=require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectedUrl}=require("../middleware.js");
const userController=require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post( wrapAsync(userController.signup));

router.route("/verify-otp")
.get(userController.renderVerifyForm)
.post(wrapAsync(userController.verifyOtp));

router.post("/resend-otp", wrapAsync(userController.resendOtp));

router.route("/login")
.get( userController.renderLoginForm)
.post(saveRedirectedUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
   wrapAsync(userController.login)
);


router.get("/logout",wrapAsync(userController.logout));

module.exports=router;