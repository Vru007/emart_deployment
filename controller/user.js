const { request } = require("express");
const { Users } = require("../model/user");

exports.updateUser=async(req,res)=>{
    const {id}=req.user;
    console.log("id inside backend: ",id);

    try{
        // const newAddress=await req
        console.log("req.body: ",req.body);
        // console.log("newAddress: ",newAddress);
        const updatedUser=await Users.findByIdAndUpdate(id,req.body,{new:true});
        console.log("updatedUser: ",updatedUser);
        return res.status(200).json(updatedUser);
         
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
}
exports.fetchUser=async(req,res)=>{

    console.log("req.user in backend:",req.user)
    const {id}=req.user;

    try{
        const user= await Users.findById(id);
        
        return res.status(200).json(user);

    }
    catch(err){
        return res.status(400).json(err);
    }
}