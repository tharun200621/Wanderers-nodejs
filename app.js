if(process.env.NODE_ENV!= "production"){
   require('dotenv').config();
}

process.on("unhandledRejection",(reason)=>{
   console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException",(err)=>{
   console.error("UNCAUGHT EXCEPTION:", err);
});

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/expressError.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")
const session=require("express-session");
const MongoStore = require('connect-mongo').default;
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const User=require("./MODELS/user.js");
const cookieParser=require("cookie-parser");
const {rememberMe}=require("./middleware.js");
const localDbUrl="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.NODE_ENV==="production"
    ? process.env.ATLASDB_URL
    : (process.env.ATLASDB_URL || localDbUrl);

main().then(()=>{
   console.log("connected to db");
})
.catch((err)=>{
    console.log("DB CONNECTION ERROR:", err.message);
    console.log("Falling back to local MongoDB...");
    mongoose.connect(localDbUrl)
        .then(()=>console.log("connected to local db"))
        .catch((e)=>console.log("Local DB also failed:", e.message));
});
async function main(){
    await mongoose.connect(dbUrl);
}
app.engine("ejs", ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "fallbackSecret",
  },
  touchAfter: 24 * 3600,
});
store.on("error",(err)=>{
    console.log("ERROR IN MONGOSTORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET || "fallbackSecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
          expires: Date.now()+ 7*24*60*60*1000,
          maxAge:7*24*60*60*1000,
          httpOnly:true
    }
};
app.get("/",(req,res)=>{
   res.redirect("/listings");
});

app.get("/health",(req,res)=>{
   const dbState=mongoose.connection.readyState;
   const dbUp=dbState===1;
   res.status(dbUp?200:503).json({
       status: dbUp ? "ok" : "degraded",
       db: dbUp ? "connected" : "disconnected",
       uptime: process.uptime()
   });
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(rememberMe);

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curUser=req.user;
    next();
});


app.use("/listings",listingRouter);

app.use("/listings/:id/reviews",reviewRouter);

app.use("/", userRouter);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});
app.use((err,req,res,next)=> {
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err});
});
const PORT=process.env.PORT || 8080;
app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
});