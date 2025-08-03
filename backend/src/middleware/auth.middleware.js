import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Import User model

// const response = await fetch("https://localhost:3000/api/books", {
//   method: "POST",
//   body: JSON.stringify({
//     title,
//     caption
//   }),
//   headers: { Authorization: `Bearer ${token}` }
// });

const protectRoute = async (req, res, next) => {
  try {
    // get token
    const token = req.headers("Authorization").replace("Bearer ", ""); // View above commented example of response

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user (select everything except password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found, authorization denied" });
    }

    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler (book route)

  } catch (error) {
    return res.status(401).json({ message: "Invalid token, authorization denied" });
  }
}

export default protectRoute;