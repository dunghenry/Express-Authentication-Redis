const bcrypt = require('bcrypt');
const User = require('../models/User');
const Post = require('../models/Post');
const logEvents = require('../helpers/logEvents');
const jwt = require('jsonwebtoken');
const client = require('../configs/connectRedis');
const authController = {
    register: async (req, res) => {
        if (!req.body.password || !req.body.password) return res.status(400).json("Missing username or password!");
        try {
            const user = await User.findOne({ username: req.body.username });
            if (user) return res.status(400).json('Username already taken!');
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            const newUser = new User({
                username: req.body.username,
                password: hashed
            })
            await newUser.save();
            return res.status(200).json(newUser);
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    generateAccessToken: (userId) => {
        return jwt.sign({ userId: userId }, process.env.MY_ACESSTOKEN_SECRET, {
            expiresIn: '10m'
        })
    },
    generateRefreshToken: (userId) => {
        return jwt.sign({ userId: userId }, process.env.MY_REFESHTOKEN_SECRET, {
            expiresIn: '365d'
        })
    },
    login: async (req, res) => {
        if (!req.body.password || !req.body.password) return res.status(400).json("Missing username or password!");
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) return res.status(404).json('Username is incorrect!');
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) return res.status(404).json('Username is incorrect!');
            const { password, ...infoUser } = user._doc;
            const accessToken = authController.generateAccessToken(user._id);
            const refreshToken = authController.generateRefreshToken(user._id);
            client.set(user._id.toString(), refreshToken, 'EX', 365 * 24 * 60 * 60);
            // console.log(refreshToken);
            if (user && validPassword) return res.status(200).json({ ...infoUser, accessToken });
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    refreshToken: async (req, res) => {
        try {
            client.get(req.userId, async (err, refreshToken) => {
                if (err) {
                    await logEvents(err.message, module.filename);
                    return res.status(400).json(err.message);
                }
                jwt.verify(refreshToken, process.env.MY_REFESHTOKEN_SECRET, async(err, decoded) => {
                    if (err) {
                       await logEvents(err.message, module.filename);
                    }
                    const newAccessToken = authController.generateAccessToken(decoded.userId);
                    const newRefreshToken = authController.generateRefreshToken(decoded.userId);
                     client.set(decoded.userId, newRefreshToken, 'EX', 365 * 24 * 60 * 60);
                    return res.status(200).json({newAccessToken, newRefreshToken});
                })
            })
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    logout: async (req, res) => {
        client.del(req.userId)
        return res.status(200).json("Logged out successfully!");
    },
    updateInfo: async (req, res) => {
        const id = req.params.id;
        try {
            const user = await User.findByIdAndUpdate({ _id: id, _id: req.userId }, req.body, { new: true });
            if (!user) {
                return res.status(401).json('User not found!');
            }
            return res.status(200).json(user);
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    },
    deleteUser: async (req, res) => {
        try {
            const id = req.params.id;
            const check = await User.findOne({ _id: id });
            if(!check) return res.status(404).json('User is not found!');
            await Post.deleteMany({user: id});
            await User.findByIdAndDelete(id);
            return res.status(200).json("Deleted user successfully!!!");
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    }
}
module.exports = authController;