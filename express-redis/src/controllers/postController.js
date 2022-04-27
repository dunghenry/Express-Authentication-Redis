const Post = require('../models/Post');
const logEvents = require('../helpers/logEvents');
const postController = {
    createPost: async (req, res) => {
        if (!req.body.title || !req.body.description || !req.userId) {
            return res.status(400).json("Missing title or description or token!!")
        }
        try {
            const post = new Post({
                title: req.body.title,
                description: req.body.description,
                user: req.userId
            })
            await post.save();
            return res.status(200).json(post);
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    getPosts: async (req, res) => {
        try {
            const posts = await Post.find({ user: req.userId }).populate('user', ['username']);
            return res.status(200).json(posts);
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    updatePost: async (req, res) => {
         if (!req.body.title || !req.body.description) {
            return res.status(400).json("Missing title or description or token!!")
        }
        try {
            const id = req.params.id;
            const newPost = await Post.findByIdAndUpdate({ _id: id, user: req.userId}, req.body, { new: true });
            console.log(newPost);
            if (!newPost) {
                return res.status(401).json('Post not found or user not authorised!');
            }
            return res.status(200).json(newPost);
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    deletePost: async (req, res) => {
        try {
            const id = req.params.id;
            const newPost = await Post.findByIdAndDelete({ _id: id, user: req.userId });
            if (!newPost) {
                return res.status(401).json('Post not found or user not authorised!');
            }
            return res.status(200).json("Deleted post successfully!");
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    getPost: async (req, res) => {
        try { 
            const id = req.params.id;
            const singlePost = await Post.findOne({ _id: id, user: req.userId }).populate('user', ['username']);
            if (!singlePost) {
                return res.status(401).json('Post not found or user not authorised!');
            }
            return res.status(200).json(singlePost);
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    }
}

module.exports = postController