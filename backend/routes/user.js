const express = require("express");
const router = express.Router();
const { User, Account } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');

const signupBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  const { success, error } = signupBody.safeParse(req.body);

  // If inputs don't pass validation
  if (!success) {
    return res.status(400).json({
      message: "Invalid input",
      error: error?.issues || "Email already taken / Incorrect inputs",
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({
      message: "Email already taken",
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await User.create({
    username,
    password: hashedPassword,
    firstName,
    lastName,
  });
  const userId = user._id;

  // Create associated account with random balance
  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  // Generate JWT token
  const token = jwt.sign({ userId }, JWT_SECRET);

  res.json({
    message: "User created successfully",
    token,
  });
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  console.log("hii")
  const { username, password } = req.body;
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.findOne({
    username,
    password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
    return;
  }
  res.status(411).json({
    message: "Error while logging in",
  });
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }
  const updates = parsed.data; // Extract validated data
  await User.updateOne({ _id: req.userId }, { $set: updates });

  res.json({
    message: "Updated successfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";
  
  // Sanitize the input to avoid regex injection
  const sanitizedFilter = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Use case-insensitive regex
  const users = await User.find({
    $or: [
      { firstName: { $regex: sanitizedFilter, $options: "i" } },
      { lastName: { $regex: sanitizedFilter, $options: "i" } }
    ]
  });

  res.json({
    users: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});


module.exports = router;
