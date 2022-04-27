const mongoose = require('mongoose');
const User = require('./User');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
})
const Post = mongoose.model('Post', postSchema);
module.exports = Post;