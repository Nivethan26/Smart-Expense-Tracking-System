// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name required"] },
    email: { type: String, required: [true, "Email required"], unique: true },
    password: { type: String, required: [true, "Password required"] },
    profileImage: { type: String, default: null } // <-- new optional field
  },
  { timestamps: true }
);

// Hide password everywhere
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
