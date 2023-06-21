const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
    // name: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // age: {
    //     type: Number,
    //     required: true,
    // },
    // gender: {
    //     type: String,
    //     required: true
    // },
    // contact: {
    //     type: Number,
    //     required: true,
    //     minlength: 10
    // },
    // email:{
    //     type:String,
    //     required: true,
    //     unique: true
    // },
    // password:{
    //     type: Number,
    //     required: true
    // },
    // confirmPassword:{
    //     type: Number,
    //     required: true
    // }
    name: String,
    age: Number,
    gender: String,
    contact: Number,
    email: String,
    password: String,
    confirmPassword: String,
    tokens:[{
        token1:{
            type:String,
            required: true
        }
    }]
});

// Definning the token generation
employeeSchema.methods.generateAuthToken = async function(){
    try{
        const token2 = await jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token1:token2});
        await this.save();
        return token2
    }catch(error) {
        res.send("Error in token generation")
        console.log(error);
    }
}

employeeSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        console.log(`Before Ecryption : ${this.password}`)
        // const salt =await bcrypt.genSalt(10);
        this.password =await bcrypt.hash(this.password, 10);
        console.log(`After Ecryption : ${this.password}`)
    }
    // // const salt = bcrypt.genSalt(10);
    // console.log(`Before Ecryption : ${this.password}`)
    // // this.password =await bcrypt.hash(this.password, salt);
    // console.log(`After Ecryption : ${this.password}`)
    // next();
})

const Register = new mongoose.model("new_register", employeeSchema);

module.exports = Register;