require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listings = require("../MODELS/list.js");
const User = require("../MODELS/user.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const CATEGORIES = [
  "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles",
  "Amazing pools", "Camping", "Farms", "Arctic",
];

const COPIES = 3; // how many times to duplicate the base set

main()
  .then(() => {
    console.log("connected to db:", dbUrl.includes("mongodb+srv") ? "Atlas" : "local");
    return init();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const init = async () => {
  await Listings.deleteMany({});

  // Use a real user as owner if one exists, so show pages populate correctly.
  const someUser = await User.findOne({});
  const ownerId = someUser ? someUser._id : "69c45478ecdb07f7e720c34f";

  const base = initData.data;
  const seeded = [];

  for (let copy = 0; copy < COPIES; copy++) {
    base.forEach((obj, i) => {
      const suffix = copy === 0 ? "" : ` (${copy + 1})`;
      const priceJitter = 1 + (copy * 0.1) + (i % 5) * 0.05;
      seeded.push({
        ...obj,
        title: obj.title + suffix,
        price: Math.round(obj.price * priceJitter),
        category: CATEGORIES[(i + copy) % CATEGORIES.length],
        owner: ownerId,
      });
    });
  }

  await Listings.insertMany(seeded);
  console.log(`data was initialised — ${seeded.length} listings across ${CATEGORIES.length} categories`);
};