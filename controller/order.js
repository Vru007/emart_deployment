const {Order}=require('../model/order');
const {Product} =require("../model/product");
const { Users } = require('../model/user');
const { sendMail, invoiceTemplate } = require('../services/common');

exports.createOrder=async(req,res)=>{
    const {id}=req.user;
    const order= new Order( 
        {products: req.body.products,
        user:id,
        PaymentMethod: req.body.PaymentMethod,
        selectedAddress: req.body.selectedAddress,
        totalAmount: req.body.totalAmount,
        totalItems: req.body.totalItems});
    
        // console.log("order in createorder:",order);
    try{
        // console.log("new order backend: ",order);
        for(let item of order.products){
            let product = await Product.findById(item.product.id);
            product.$inc('stock',-1*item.quantity);
            await product.save();
            console.log("updated product in create order:",product);
        }
        const response=await order.save();
        const user=await Users.findById(id);
        sendMail({to:user.email,html:invoiceTemplate(order),subject:"Order-Summary",text:"Your resent order on E-mart"});
        res.status(200).json(response);
        
    }
    catch(err){
        res.status(400).json(err);
        console.log(err);
    }
};
exports.deleteOrder=async(id)=>{
    
    try{
    const response= await Order.findByIdAndDelete(id);
     
    res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        return res.status(400).json(err);
        
    }

}
exports.fetchOrderByUserId=async(req,res)=>{
    const {id}=req.user;
    console.log("id in order:",id);
    try{
         const orderItems=await Order.find({user:id});
         console.log("orders : ",orderItems);
         return res.status(200).json(orderItems);
    }
    catch(err){
        console.log("error: ",err);
         return res.status(400).json(err);
    }
}
exports.fetchAllOrders=async(req,res)=>{
    let str=Order.find({});
    let totalCount=Order.find({});
    if(req.query.category){
        str=str.find({category:req.query.category});
        totalCount=totalCount.find({category:req.query.category});
    }
    if(req.query.brand){
        str=str.find({brand:req.query.brand});
        totalCount=totalCount.find({brand:req.query.brand});
    }
    if(req.query._sort && req.query._order){
        str=str.sort({[req.query._sort]:req.query._order});

    }

    const totalDocs=await totalCount.count().exec();
    if(req.query._page && req.query._limit){
        const pageSize=req.query._limit;
        const page=req.query._page;
        str=str.skip(pageSize*(page-1)).limit(pageSize);
    }

    try{
        // console.log("str: ",str);
        const docs=await str.exec();
        res.set('Total-Order-Count',totalDocs);
        res.status(200).json(docs);
        
    }
    catch(err){
        res.status(400).json(err);
    }
}

exports.updateStatus=async(req,res)=>{
         
    const update=req.body;
    const {id}=req.params;
    try{
            const updatedOrder=await Order.findByIdAndUpdate(id,update,{new:true});
            return res.status(200).json(updatedOrder);
    } 
    catch(err){
            console.log(err);
            return res.status(400).json(err);

    }
    }

exports.fetchOrderByItsId=async(req,res)=>{
    const {id}=req.params;

    try{
          const order=await Order.findById(id);
          return res.status(200).json(order);
    }
    catch(err){
        return res.status(400).json(err);
    }
}