const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const getRegisterController = (req, res) => {
    res.render('register');
};

const postRegisterController = async (req, res) => {
    // Handle user registration
    const { username, email, password } = req.body;
    const isUserExist = await userModel.findOne({
        $or: [{ username }, { email }]
    });
    if (isUserExist) {
        return res.status(400).send("User already exists");
    }
    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const user = await userModel.create({ username, email, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie("token", token);
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Internal Server Error", error);
    }
};

const postLoginController = async (req, res) => {
    // Handle user login
    const { identifier, password } = req.body; // 'identifier' can be either username or email
    const user = await userModel.findOne({
        $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) {
        return res.status(400).send("Invalid username/email or password");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).send("Invalid username/email or password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.redirect('/');
};

const getLoginController = (req, res) => {
    res.render('login');
};

const logOutController = (req, res) => {
    res.clearCookie("token");
    res.redirect('/auth/login');
};

module.exports = {
    getRegisterController,
    postRegisterController,
    getLoginController,
    postLoginController,
    logOutController
};