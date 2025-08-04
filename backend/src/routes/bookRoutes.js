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

// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1; // Get the page number from query parameters, default to 1
    const limit = req.query.limit || 5; // Get the limit from query parameters, default to 5
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const books = await Book.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip) // Skip docs for pagination
      .limit(limit) // Limit the number of docs returned
      .populate("user", "username profileImage"); // Note we store user as an object ID in the Book model, so we populate it to get user details to display to UI (username and profileImage)
      
    const totalBooks = await Book.countDocuments(); // Get the total number of books

    // Default of 200 status code is sent if not specified
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit) // Calculate total pages based on total books and limit
    }); 
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
})

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); // id comes from URL param (/:id)
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user is creator of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized to delete this book" });
    }

    // Delete the image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0]; // Extract public ID from the image URL
        await cloudinary.uploader.destroy(publicId); // Delete the image from cloudinary
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
        return res.status(500).json({ message: "Error deleting image from cloudinary" });
      }
    }

    await book.deleteOne(); // Delete the book from the database

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
})

export default router;