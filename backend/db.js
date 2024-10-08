const mongoose = require("mongoose");
require('dotenv').config();

const CONN_URL = process.env.CONN_URL

// Connecting to mongoDB
mongoose.connect(CONN_URL)
.then(()=>{
    console.log("Connected to MongoDB successfully")
})
.catch((e)=>{
    console.log("Error connecting to MongoDB", e)
})

// User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
})

const User = mongoose.model('user', userSchema);

module.exports = {
    User
}