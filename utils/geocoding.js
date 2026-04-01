const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../MODELS/list");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const geocodeListings = async () => {
  const listings = await Listing.find({});

  for (let listing of listings) {
    try {
      if (listing.geometry && listing.geometry.coordinates.length > 0) {
        continue;
      }

      console.log("Processing:", listing.location);

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: listing.location,
            format: "json"
          },
          headers: {
            "User-Agent": "wanderlust-app"
          }
        }
      );

      if (!response.data.length) {
        console.log("Skipped:", listing.location);
        continue;
      }

      const lat = response.data[0].lat;
      const lng = response.data[0].lon;

      listing.geometry = {
        type: "Point",
        coordinates: [lng, lat]
      };

      await listing.save();

      console.log("Updated:", listing.title);

      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log("Done");
  mongoose.connection.close();
};

geocodeListings();