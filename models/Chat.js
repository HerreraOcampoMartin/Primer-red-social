const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const chat = new Schema({
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("chat", chat);