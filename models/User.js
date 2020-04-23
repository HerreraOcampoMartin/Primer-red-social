const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
    Schema
} = mongoose;

const user = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    birthdate: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/512px-User_font_awesome.svg.png",
    },
    likedPosts: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("User", user);