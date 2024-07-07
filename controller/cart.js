const { Cart } = require("../model/cart")


exports.fetchCartByUserId=async(req,res)=>{
    const {id}=req.user;
    try{ 
          const cartItems=await Cart.find({user:id}).populate('user').populate('product');   
          res.status(200).json(cartItems);
    }
    catch(err){
        console.log(err);
    }
}
exports.addtoCart=async(req,res)=>{
    const {id}=req.user;

    const cart=new Cart({...req.body,user:id});
    console.log("cart added",cart);
    try{
        const doc=await cart.save();
        const result=await doc.populate('product');

        return res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
}

exports.deleteItemFromCart=async(req,res)=>{
    const {id}=req.params

    try{
        const response=await Cart.findByIdAndDelete(id);
        return res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
    }
}

exports.updateItemFromCart=async(req,res)=>{
    const {id}=req.params;
    try{
        console.log("id in backend",id);
        console.log('req.body:' ,req.body);
        const quantity=req.body.quantity;
        const response= await Cart.findByIdAndUpdate(id,{quantity:quantity},{new:true});
        console.log(response);
        return res.status(200).json(response);
    }
    catch(err){
        console.log(err);
    }
}