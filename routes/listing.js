const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../MODELS/list.js");
const ExpressError=require("../utils/expressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

router.get("/",wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({});
        res.render("listings/index.ejs",{allListings});
}));

router.get("/new",(req,res)=>{
      res.render("listings/new.ejs")
});

router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

router.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
    let result=listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

router.get("/:id/edit",wrapAsync(async(req,res)=>{
     let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

router.put("/:id",validateListing,wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}));

router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports=router;