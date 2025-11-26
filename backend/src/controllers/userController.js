// controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  try {
    return res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage || null,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // supports JSON body fields OR multipart (multer attaches req.file)
    const { name, email, currentPassword, newPassword } = req.body || {};

    if (name) user.name = name;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be >= 6 chars" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // multer file -> req.file
    if (req.file) {
      // save a relative path for frontend to load: /uploads/profile/<filename>
      user.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
      },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
