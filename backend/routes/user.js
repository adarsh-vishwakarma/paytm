const express = require("express");
const router = express.Router();
const { User } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const signupBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const dbUser = await User.create({
    username,
    password,
    firstName,
    lastName,
  });

  const token = jwt.sign(
    {
      userId: dbUser._id,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token: token,
  });
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
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
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async(req, res) => {
    const parsed = updateBody.safeParse(req.body);
    if(!parsed.success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    const updates = parsed.data; // Extract validated data
    await User.updateOne({ _id: req.userId }, { $set: updates });
  

    res.json({
        message: "Updated successfully"
    })
})

module.exports = router;
