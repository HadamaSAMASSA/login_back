const express = require ("express");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
const mongoose = require ("mongoose");
const cors = require ("cors");
const jwt = require("jsonwebtoken");
const config = require("./config");
const signUpModel = require ("./models/Signup");

const app = express();


app.use(bodyParser.json());
app.use(cors());

app.listen(config.port, () => {
    console.log("server connected on port " + config.port);
})
 
mongoose.connect(config.mongoDB, {useNewUrlParser: true, useUnifiedTopology: true},
() => {
    console.log("DB connected");
});


app.post("/signup", async (req, res, next) => {
    try{
        const emailAddress = await signUpModel.findOne({
            email: req.body.email
        });

        if(emailAddress) {
            res.status(400).send(`Email ${req.body.email} already exists`);
            return;
        }

        if(req.body.password.length < 8) {
            res.status(400).send("Password too short");
            return;
        }

        if(!bcryptjs.compareSync(req.body.password, bcryptjs.hashSync(req.body.confirmPassword))){
            res.status(401).send("Password and confirm password have to be sames");
            return;
        }else {
            res.send("Sign-up created");
        }

//      await signUpModel.create(req.body);
        await signUpModel.create({
            email: req.body.email,
            password: bcryptjs.hashSync(req.body.password),
            firstName: req.body.firstName,
            surname: req.body.surname,
            dateOfBirth: req.body.dateOfBirth
        });
    }catch (err){
        console.log(err);
        res.status(500).send("Something went wrong");
    }
});

app.post("/login", async (req, res, next) => {
    try{
        const emailAddress = await signUpModel.findOne({
        email: req.body.email
        }).exec();

        if(!emailAddress){
            res.status(404).send("Please enter your registred email")
            return;
        };

        if(!bcryptjs.compareSync(req.body.password, emailAddress.password)) {

        res.status(401).send("Invalid password");
        console.log("Invalid password");
        return;
//    console.log(emailAddress.password, bcryptjs.hashSync(req.body.password));
//    console.log(bcryptjs.compareSync(req.body.password, emailAddress.password));
        }else{
            const token = jwt.sign({
                id: emailAddress._id
                },
                config.secret,
                {
                expiresIn: 3600
                }
            );
            res.status(200).json({
                message: "Connexion OK",
                token: token
            });
            console.log("Connexion OK");
        }
    }catch(err){
        console.log(err);
        res.status(500).send("Something went wrong");
    }
})

app.get("/", (req, res, next) => {
    res.send("Everybody can see this");
})

app.get("/topsecret", async (req, res, next) => {
    try{
    const token = req.headers.authorization;
//    console.log(token);
    const result = jwt.verify(token.split(" ")[1], config.secret);
    const user = await signUpModel.findOne({
        _id: result.id
    }).exec()

//    console.log(result);
    const connectedUsers = 
    res.send([user.firstName, user.surname, user.dateOfBirth]);

    }catch(err){
        res.status(401).send("Unauthorized !");
    };
});
