const express = require("express");
const router = express.Router();
const { User } = require("../db")
const zod = require("zod");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET

const signupBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})


router.post("/signup", async(req, res) => {
    const { username, password, firstName, lastName } = req.body;
    const { success } = signupBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({ username });

    if(existingUser) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        }) 
    }
    const dbUser = await User.create({
        username,
        password,
        firstName,
        lastName
    })

    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET)

    res.json({
        message: "User created successfully",
        token: token
    })

})
module.exports = router