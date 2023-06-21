require('dotenv').config();
const express = require('express');
const app = express()
const port = 3000
const hbs = require('hbs');
const Register = require('./models/register')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth")

require('./db/conn')
const path = require('path')
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")
const static_path = path.join(__dirname, "../public")

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path)
hbs.registerPartials(partials_path)


app.get("/", (req, res) => {
    res.render("index")
})
app.get("/about", (req, res) => {
    res.render("about")
})
app.get("/contact", (req, res) => {
    res.render("contact")
})
app.get("/progress",auth, (req, res) => {
    console.log(`The cookie are ${req.cookies.jwt}`);
    res.render("progress")
})
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/logout",auth,async (req, res) => {
    try {
        // req.user.tokens = req.user.tokens.filter((currentElement)=>{
        //     return currentElement.token != user.token
        // })
        req.user.tokens=[];
        res.clearCookie("jwt");
        console.log("Logout Successfull....");
        await req.user.save();
        res.render("index");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
})
app.post("/register", async (req, res) => {
    // const jsonData = JSON.stringify(req.body.password);
    // console.log(jsonData);
    const password = req.body.password;
    // console.log(password)
    const confirmPassword = req.body.confirmPassword;
    try {
        if (password == confirmPassword) {
            const gymRegistration = new Register({
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                contact: req.body.contact,
                email: req.body.email,
                password: password
            })

            console.log(gymRegistration)

            // creating tokens before saving data into the database
            const token = await gymRegistration.generateAuthToken();

            const registered = await gymRegistration.save() // This has some error
            // const result = Register.insertMany(gymRegistration)
            res.cookie("jwt", token,{
                expires:new Date(Date.now() + 500000),
                httpOnly: true
            });

            console.log(`The cookie are ${req.cookies.jwt}`);

            res.render('index');
        } else {
            res.send("Password Doesn't match")
        }
        await console.log("Successfully runed")
    } catch (error) {
        console.log("Error has been occured")
        console.log(error)
        res.send(error);
    }
})
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user_email = await Register.findOne({ email: email });

        // creating tokens before saving data into the database
        const token = await user_email.generateAuthToken();
        console.log(token)

        const isMatch = await bcrypt.compare(password, user_email.password);
        if (isMatch == true) {
            res.status(201).render('index')
            console.log(process.env.SECRET_KEY)
            console.log(`Successfully Login as ${email}`)
        } else {
            res.send("Invalid details")
        }
        res.cookie("jwt", token,{
            expires:new Date(Date.now() + 500000),
            httpOnly: true
        });

    } catch (error) {
        console.log(error)
        res.status(400).render(error);
    }
})

app.listen(port, () => {
    console.log(`Serving at the web http://localhost:${port}`);
})