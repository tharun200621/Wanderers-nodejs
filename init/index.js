const mongoose=require("mongoose");
const initData=require("./data.js");
const Listings=require("../MODELS/list.js");

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);  
});

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
const init=async()=>{
    await Listings.deleteMany({});
    await Listings.insertMany(initData.data);
   console.log("data was initialised")

};
init();