const { Router } = require("express");
const router = Router();
const Photo = require("../models/Photo");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require("fs-extra");

router.get("/", async (req, res) => {
  const photos = await Photo.find().lean();
  res.render("images", { photos });
});

router.get("/image/add", async (req, res) => {
  const photos = await Photo.find().lean();
  res.render("image_form", { photos });
});

router.post("/image/add", async (req, res) => {
  const { title, description } = req.body;
  const result = await cloudinary.v2.uploader.upload(req.file.path);

  const newPhoto = new Photo({
    title: title,
    description: description,
    imageURL: result.url,
    public_id: result.public_id,
  });
  await newPhoto.save();

  await fs.unlink(req.file.path);

  res.redirect("/");
});

router.get("/image/delete/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const photoDeleted = await Photo.findByIdAndDelete(photo_id);
  const result = await cloudinary.v2.uploader.destroy(photoDeleted.public_id);
  console.log(result);
  res.redirect("/image/add");
});

module.exports = router;
