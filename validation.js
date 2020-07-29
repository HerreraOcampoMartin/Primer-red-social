const Joi = require("@hapi/joi");

function validateSignUp(data) {
    const schema = Joi.object({
        name: Joi.string().min(4).max(40).required(),
        username: Joi.string().min(6).max(20).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(7).max(25).required(),
        birthdate: Joi.number().integer().min(1900).max(2003),
    });

    return schema.validate(data);
}

function validateSignIn(data) {
    const schema = new Joi.object({
        username: Joi.string().min(6).max(20).required(),
        password: Joi.string().min(7).max(25).required(),
    });

    return schema.validate(data);
}

function validatePost(data) {
    const schema = new Joi.object({
        content: Joi.string().min(1).max(144).required()
    });

    return schema.validate(data);
}

function validateMediaExtension(data) {
    let valid = false;
    const ext = data.name.split(".").pop().toLowerCase();
    if (ext === 'jpg' ||
        ext === 'png' ||
        ext === 'jpeg' ||
        ext === 'gif' ||
        ext === 'mp4' ||
        ext === 'mp3') valid = true;

    return valid;
}

function validateDocExtension(data) {
    let valid = false;
    const ext = data.name.split(".").pop().toLowerCase();
    if (ext === 'doc' ||
        ext === 'docx' ||
        ext === 'xls' ||
        ext === 'xlsx' ||
        ext === 'ppt' ||
        ext === 'pptx' ||
        ext === 'pdf') valid = true;

    return valid;
}

function validateMessage(data) {
    const schema = new Joi.object({
        text: Joi.string().min(1).required(),
        to: Joi.string().min(6).max(50).required()
    });

    return schema.validate(data);
}

module.exports = {
    validateSignIn,
    validateSignUp,
    validatePost,
    validateDocExtension,
    validateMediaExtension,
    validateMessage
};