const express=require('express');
const { checkOut, paymentVerification ,getKey} = require('../controller/payment');
const router=express.Router();

router.post('/checkout',checkOut)
      .post('/verification',paymentVerification)
      .get('/getkey',getKey);
exports.router=router;