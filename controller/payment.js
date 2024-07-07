const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const {instance, sendMail} =require('../services/common');
const { deleteOrder } = require('./order');
const {Order}=require('../model/order');
const {Users}=require('../model/user');
const {Product}=require('../model/product');
const { invoiceTemplate } = require('../services/common');
require('dotenv').config();
exports.checkOut =async (req,res)=>{
    
    try {
        const amount = req.body.totalAmount;
        // const temporder= new Order( 
        //     {products: req.body.products,
        //     user:id,
        //     PaymentMethod: req.body.PaymentMethod,
        //     selectedAddress: req.body.selectedAddress,
        //     totalAmount: req.body.totalAmount,
        //     totalItems: req.body.totalItems});
        console.log("amount", amount);
        const options = {
            amount: Number(amount*100), // amount is in paisa 
            currency: "INR"
        };

        const order = await instance.orders.create(options);
        
        res.status(200).json({
            success: "true",
            order: order,
            // temporder:temporder
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: "false",
            message: "An error occurred while creating the order",
            error: error.message
        });
    }
};

exports.paymentVerification=async(req,res)=>{
    // const id=req.query.orderid;
    console.log(req.body);
    const {id}=req.user;
    // const fid=id;
    console.log("id:",id);
    // console.log("fid:",fid);
  const {razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body;
    try{
        const secret=process.env.RAZOR_PAY_KEY_SECRET
        const isValid= await validatePaymentVerification(
          {order_id:razorpay_order_id,payment_id:razorpay_payment_id},
          razorpay_signature,
          secret
        );
        if(isValid){
            // Retrieve order data from query parameters
            const orderData = req.query.order;
            const order = JSON.parse(decodeURIComponent(orderData));
                console.log("order in paymentVerification: ",order);
                const finalorder= new Order( 
                    {products: order.products,
                    user:id,
                    PaymentMethod: order.PaymentMethod,
                    selectedAddress: order.selectedAddress,
                    totalAmount: order.totalAmount,
                    totalItems: order.totalItems});
/// completion of final order//////////////////////////////////////
                    for(let item of finalorder.products){
                        let product = await Product.findById(item.product.id);
                        product.$inc('stock',-1*item.quantity);
                        await product.save();
                        // console.log("updated product in create order:",product);
                    }

                    const temp=await finalorder.save();
               // Send JSON response with redirect URL
               if(temp){
                // console.log("temp: ",temp);
                const user=await Users.findById(id);
        sendMail({to:user.email,html:invoiceTemplate(finalorder),subject:"Order-Summary",text:"Your resent order on E-mart"});
                res.redirect('http://localhost:8080/temporder/'+temp.id);
               }
        }
        else{
    
            // const response=await deleteOrder(id);
            // if(response){
            //     alert("Payment Failed");
            // }
            // else{
            //     alert("order not deleted");
            // }
            
            res.status(400).json({ success: false, message: 'Payment validation failed' });
        }
        
     }
     catch (error) {
        console.log(error);
     }
 
 
}

exports.getKey=async(req,res)=>{
    try{
         const key =process.env.RAZOR_PAY_KEY_ID;
         res.status(200).json({key:key});

    } 
    catch(error){
        res.status(400).json(error);
        console.log(error.message);
    }
}