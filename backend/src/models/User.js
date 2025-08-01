import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true,
    minlength: 6
  },
  profileImage:{
    type: String,
    default: ""
  }
});

// hash password before saving to database
userSchema.pre("save", async function(next) {
  // Don't hash the password if it hasn't been modified
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
})

// Creates users in mongoDB using the defined schema
const User = mongoose.model("User", userSchema);

// Exports the User model for use in other parts of the application
export default User;