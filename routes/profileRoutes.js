const router = require("express").Router();
const authorize = require("./verifyRoute");
const User = require("../models/User");
const bcrypt = require("bcryptjs")
const Joi = require("@hapi/joi");

//PUT ROUTES
router.put("/profile/edit/", authorize, async (req, res) => {
    let newValue = req.body.value;
    const edit = req.body.toEdit;
    const id = req.userData.id;
    const {
        error
    } = validate(edit, {
        newValue,
    });

    if (error) return res.status(400).send(error);
    if (edit === "password") {
        const salt = await bcrypt.genSalt(10);
        newValue = await bcrypt.hash(newValue, salt);
    }

    await User.findByIdAndUpdate(
        id, {
            $set: {
                [edit]: newValue,
            },
        },
        (err) => {
            if (err) console.log(err);
        }
    );

    res.send("FINISHED");
});

//VALIDATE

function validate(edit, val) {
    let schema = null;
    switch (edit) {
        case "name":
            schema = Joi.object({
                newValue: Joi.string().min(4).max(40).required(),
            });
            return schema.validate(val);
        case "username":
            schema = Joi.object({
                newValue: Joi.string().min(6).max(20).required(),
            });
            return schema.validate(val);
        case "email":
            schema = Joi.object({
                newValue: Joi.string().min(6).max(255).required().email(),
            });
            return schema.validate(val);
        case "birthdate":
            try {
                schema = Joi.object({
                    newValue: Joi.number().integer().min(1900).max(2003),
                });
            } catch (ex) {
                return {
                    Error: "Birth date is not a number",
                };
            }
            return schema.validate(val);
        case "photo":
            schema = Joi.object({
                newValue: Joi.string().uri().required(),
            });
            return schema.validate({
                val
            });
        case "password":
            schema = Joi.object({
                newValue: Joi.string().min(7).max(25).required()
            });
            return schema.validate(val);
    }
}

module.exports = router;