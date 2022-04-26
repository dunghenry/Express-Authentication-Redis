const bcrypt = require('bcrypt');
const User = require('../models/User');
const logEvents = require('../helpers/logEvents');

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
    login: async (req, res) => {
        if (!req.body.password || !req.body.password) return res.status(400).json("Missing username or password!");
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) return res.status(404).json('Username is incorrect!');
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) return res.status(404).json('Username is incorrect!');
            const { password, ...infoUser } = user._doc;
            if (user && validPassword) return res.status(200).json({ ...infoUser});
        } catch (error) {
            await logEvents(error.message, module.filename);
            return res.status(500).json(error.message);
        }
    }
}
module.exports = authController;