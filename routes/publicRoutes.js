const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const {
    validateSignUp,
    validateSignIn
} = require("../validation");

//ROUTES

router.post('/users/login', async (req, res) => {
    try {
        //VERIFY DATA
        const {
            error
        } = validateSignIn(req.body);
        if (error) return res.status(400).send(error);

        //CHECK IF USERS EXISTS
        const userLoggedIn = await User.findOne({
            username: req.body.username
        });
        if (!userLoggedIn) return res.status(400).send('El usuario o la contraseña están mal.');

        //CHECK IF THE PASSWORD IS VALID
        const valid = await bcrypt.compare(req.body.password, userLoggedIn.password);
        if (!valid) return res.status(400).send('El usuario o la contraseña están mal.');

        //CREATE AND SAVE TOKEN
        const token = jwt.sign({
            username: userLoggedIn.username,
            id: userLoggedIn._id
        }, process.env.JWT_KEY);

        res.cookie("auth-token", token, {
            expires: new Date(Date.now() + 24 * 60 * 60000)
        });

        res.send('LOGGED IN');

    } catch (ex) {
        res.send('ERROR: ' + ex);
    }
})

router.post("/users/signup", async (req, res) => {
    try {
        //VERIFY DATA
        const {
            error
        } = validateSignUp(req.body);
        if (error) return res.status().send(error);

        //CHECK IF USERSNAME IS USED
        let exists = await User.findOne({
            username: req.body.username,
        });
        if (exists) return res.send("El usuario ya existe.");

        //CHECK IF E-MAIL EXISTS
        exists = await User.findOne({
            email: req.body.email,
        });
        if (exists) return res.send("Ya existe un usuario con ese e-mail.");

        //HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        //SAVE USER IN DB
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            name: req.body.name,
            birthdate: req.body.birthdate,
            password: hashedPass,
        });

        newUser.save();
        res.send("USUARIO CREADO");
    } catch (ex) {
        res.send("ERROR: " + ex);
    }
});

module.exports = router;