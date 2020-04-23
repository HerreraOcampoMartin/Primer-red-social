const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const post = new Schema({
    user: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    },
    media: {
        type: String,
        required: false
    },
    doc: {
        type: String,
        required: false
    },
    likes: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("Post", post);