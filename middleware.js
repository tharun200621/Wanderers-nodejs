const Listing=require("./MODELS/list");
const Review=require("./MODELS/review");
const User=require("./MODELS/user.js");
const ExpressError=require("./utils/expressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const {hashValue}=require("./utils/tokens.js");

module.exports.rememberMe=async (req,res,next)=>{
    if(req.isAuthenticated() || !req.cookies || !req.cookies.remember_me){
        return next();
    }
    const [userId, token]=req.cookies.remember_me.split(":");
    if(!userId || !token){
        res.clearCookie("remember_me");
        return next();
    }
    try{
        const user=await User.findById(userId);
        if(!user || !user.rememberTokenHash || !user.rememberTokenExpires
            || user.rememberTokenExpires < new Date()
            || user.rememberTokenHash !== hashValue(token)){
            res.clearCookie("remember_me");
            return next();
        }
        req.login(user,(err)=>{
            if(err){ return next(err); }
            next();
        });
    }catch(e){
        next();
    }
}

module.exports.isLoggedIn=(req,res,next)=>{
   if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
        req.flash("error", "you must be logged in to add listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectedUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
}
next();
}

module.exports.isOwner= async (req,res,next)=>{
      let { id } = req.params;
    let listing =await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.curUser._id)){
        req.flash("error","you are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();

}

module.exports.isReviewAuthor= async (req,res,next)=>{
      let {id, reviewId } = req.params;
    let review =await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.curUser._id)){
        req.flash("error","you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();

}
module.exports.validateListing= validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}