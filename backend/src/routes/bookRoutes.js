import express from "express";
import cloudinary from "../lib/cloudinary.js"; // Import cloudinary configuration
import Book from "../models/Book.js"; // Import Book model
import protectRoute from "../middleware/auth.middleware.js"; // Import protectRoute middleware

const router = express.Router();

// protectRoute middleware ensures that only authenticated users can create a book
// This middleware checks for a valid JWT token in the request headers
// and attaches the user information to the request object if the token is valid.
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id
    })

    await newBook.save();

    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    res.status(500).json({ message: "Error creating book", error: error.message });
  }
})

export default router;