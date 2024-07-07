const express=require('express');
const {Users}=require("../model/user");
const crypto=require("crypto");
const jwt =require('jsonwebtoken');
const {sanitizeUser, sendMail}=require('../services/common'); 
require('dotenv').config();

const SECRET_KEY=process.env.SECRET_KEY;


exports.createUser=async(req,res)=>{
    
     
    try {
        // Check if user with email already exists
        if (await Users.findOne({ email: req.body.email })) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate salt
        const salt = crypto.randomBytes(16);

        // Hash password using PBKDF2
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error hashing password' });
            }

            try {
                // Create new user instance
                const user = new Users({ ...req.body, password: hashedPassword, salt });

                // Save user to database
                const response = await user.save();

                // Login user and set JWT token
                req.login(sanitizeUser(response), (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(400).json(err);
                    } else {
                        const token = jwt.sign(sanitizeUser(response), SECRET_KEY);
                        res.cookie('jwt', token, { expires: new Date(Date.now() + 3600000), httpOnly: true });

                        // Respond with user data
                        return res.status(201).json({ id: response.id, role: response.role });
                    }
                });
            } catch (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error saving user' });
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}

exports.checkLogin=async(req,res)=>{
    const user=req.user;
    try{
    res.cookie('jwt',user.token,{
    expires:new Date(Date.now()+3600000),
    httpOnly:true,
   })
    .status(201)
    .json({id:user.id,role:user.role});
}catch(err){
    res.status(400).json(err);
}
}
exports.checkAuth=async(req,res)=>{
    
    if(req.user){
        res.json(req.user);
    }
    else{
        res.sendStatus(401);
    }
}

exports.logout=async(req,res)=>{
    res.cookie('jwt',null,{
        expires:new Date(Date.now()),
        httpOnly:true,

    })
    .sendStatus(200);
}

exports.resetPasswordRequest = async (req, res) => {
    
    const email=req.body.email;
    const user = await Users.findOne({ email:email });
    const token=crypto.randomBytes(48).toString('hex');
    console.log("email in reset-backend-api:", email);
    try {

        if (!email) {
            return res.status(400).json({ message: "Email is required" }); 
        }
        // Check if user exists
        if (user.length === 0) {
            console.log("error is null user");
            return res.status(400).json({ message: "Email not registered" }); 
        }
        
         const resetPass = "http://localhost:8080/resetpassword?token="+token+"&email="+email;
         const subject = "Reset password for e-commerce";
         const html = `<p>Click <a href='${resetPass}'>here</a> to Reset Password</p>`;
         const text = "Reset Password of your account on E-Mart";
         user.resetPasswordToken=token;
         await user.save();
        // Check if email is provided
       

        // Send reset password email
        const response = await sendMail({ to: req.body.email, subject, text, html });
        return res.status(200).json(response); 
    } catch (error) {
        console.error("Error processing reset password request:", error);
        return res.status(500).json({ error: "Failed to process reset password request" }); 
    }
};

exports.resetPassword=async(req,res)=>{

    const {password,email,token}=req.body;

    const user =await Users.findOne({ email: email,resetPasswordToken:token});
     console.log("new -password: ",password);
    try{
             if(user){
                 // Generate salt
        const salt = crypto.randomBytes(16);

        // Hash password using PBKDF2
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error hashing password' });
            }

            try {
                // set user new password
                const subject = "Reset password for e-commerce";
                const html = `<p>Your password has been successfully reset.</p>`;
                const text = "Password of your account on E-Mart is successfully reset ";
                user.password =hashedPassword;
                user.resetPasswordToken = null;
                user.salt=salt;
                // Save user to database
                await user.save();
                const response = await sendMail({ to:email, subject, text, html });
                return res.status(200).json(response); 
                   
             }
             catch(err){
                console.log(err);
                return res.status(400).json({ message: 'Internal server Error'});
             }
            })}
             else{
                return res.status(400).json({message:'Invalid Request'});
             }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({error:"Failed to reset the Password"})
    }
}


