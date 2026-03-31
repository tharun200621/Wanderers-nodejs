const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/expressError.js");
const Review=require("../MODELS/review.js");
const Listing=require("../MODELS/list.js");
const {validateReview}=require("../middleware.js");
const { isLoggedIn,isReviewAuthor} = require("../middleware.js");
const reviewController=require("../controllers/reviews.js");



router.post("/",isLoggedIn, validateReview,reviewController.createReview);
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports=router;