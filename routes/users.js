import { Router } from "express";
const router = Router();
import multer, { diskStorage } from "multer";
import { extname, join } from "path";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { unlinkSync } from "fs";
import lodash from "lodash";

import User from "../models/users.js";
import auth from "../middleware/auth.js";

// LoggedIN user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Setting up multer
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/profiles");
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    const filename = file.fieldname + "-" + Date.now() + ext;
    cb(null, filename);
    req.filename = filename; // save filename in request object
  },
});
const upload = multer({ storage });

// Create user and return JWT token
router.post("/signup", upload.single("profilePic"), async (req, res) => {
  const { name, email, password, deliveryAddress } = req.body;

  try {
    // Check if the email is already registered
    let user = await User.findOne({ email });
    if (user) {
      // Delete the uploaded file since the API was not successful
      if (req.file) {
        const filePath = join("upload", "profiles", req.filename);
        unlinkSync(filePath);
      }

      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create the new user
    user = new User({
      name,
      email,
      password,
      deliveryAddress,
      profilePic: req.file ? req.filename : "default.jpg",
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    // Create and return JWT token
    let newUser = lodash.pick(user, [
      "_id",
      "name",
      "email",
      "profilePic",
      "isAdmin",
    ]);

    jsonwebtoken.sign(
      newUser,
      process.env.JWTSECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        return res.status(201).json({ token });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email is registered
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and return JWT token
    let newUser = lodash.pick(user, [
      "_id",
      "name",
      "email",
      "profilePic",
      "isAdmin",
    ]);

    jsonwebtoken.sign(
      newUser,
      process.env.JWTSECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        return res.json({ token });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
