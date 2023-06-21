const jwt = require('jsonwebtoken');
const Register = require("../models/register");

const auth = async (req, res, next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyAuth = jwt.verify(token, process.env.SECRET_KEY);
        const user = await Register.findOne({_id:verifyAuth._id});
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

module.exports = auth;