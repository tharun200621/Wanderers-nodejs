const mongoose = require("mongoose");
const initData = require("./data.js");
const Listings = require("../MODELS/list.js");

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const init = async () => {
  await Listings.deleteMany({});

  const modifiedData = initData.data.map((obj) => ({
    ...obj,
    owner: "69c45478ecdb07f7e720c34f",
  }));

  await Listings.insertMany(modifiedData);

  console.log("data was initialised");
};

init();