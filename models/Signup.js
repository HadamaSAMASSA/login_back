const mongoose = require("mongoose");

const signUpSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String,minLength: 8, required: true},
    firstName: {type: String, required: true},
    surname: {type: String, required: true},
    dateOfBirth: {type: Date, required: true}
});

const signUpModel = mongoose.model("signup", signUpSchema);
module.exports = signUpModel;