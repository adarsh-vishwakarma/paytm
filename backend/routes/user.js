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
    const { success } = signupBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser._id) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        }) 
    }
    const dbUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET)

    res.json({
        message: "User created successfully",
        token: token
    })

})
module.export = router