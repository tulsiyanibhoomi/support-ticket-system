const User = require("../models/User");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: "7d"
    });
};

exports.loginUser=async(req,res,next)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: "Invalid Email"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: "Email and Password don't match"});
        }
        return res.status(200).json({token: generateToken(user.id)});
    }
    catch(err){
        next(err);
    }    
}