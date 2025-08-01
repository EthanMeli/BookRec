import express from "express";
import User from "../models/User.js"; // Import our User model
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation

const router = express.Router();

const generateToken = (userId) => {
  jwt.sign({userId})
}

router.post("/login", async (req, res) => {
  res.send("login");
});

router.post("/register", async (req, res) => {
  try {
    const {email,username,password} = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters long" });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // get random avatar
    const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`;

    // Create a new user
    const user = new User({
      email,
      username,
      password,
      profileImage
    })

    await user.save();

    const token = generateToken(user._id);
   
  } catch (error) {

  }
});

export default router;