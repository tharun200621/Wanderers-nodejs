const Listing = require("../MODELS/list.js");
module.exports.index=async (req, res) => {
    const { q, category } = req.query;
    const filter = {};
    if (category) {
        filter.category = category;
    }
    if (q) {
        const regex = new RegExp(q.trim(), "i");
        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
        ];
    }
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings, q: q || "", category: category || "" });
}

module.exports.renderNewForm= (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "requested listing doesn't exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}

const axios = require("axios");

module.exports.createListing = async (req, res) => {
    if (!req.file) {
        req.flash("error", "Please upload an image for your listing.");
        return res.redirect("/listings/new");
    }

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: req.file.path, filename: req.file.filename };

    let response;
    try {
        response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: newListing.location,
                    format: "json"
                },
                headers: {
                    "User-Agent": "wanderlust-app"
                },
                timeout: 8000
            }
        );
    } catch (err) {
        req.flash("error", "Could not look up that location right now. Please try again.");
        return res.redirect("/listings/new");
    }

    if (!response.data.length) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    const lat = response.data[0].lat;
    const lng = response.data[0].lon;

    newListing.geometry = {
        type: "Point",
        coordinates: [lng, lat]
    };

    await newListing.save();

    req.flash("success", "new listing was created");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "requested listing doesn't exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

    res.render("listings/edit.ejs", { listing,originalImageUrl });
}

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    req.flash("success", "listing was updated");

    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing was deleted");

    res.redirect("/listings");
}