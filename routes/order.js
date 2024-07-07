const express=require('express');
const { createOrder,fetchOrderByUserId,fetchAllOrders,updateStatus,fetchOrderByItsId} = require('../controller/order');
const router=express.Router();

router.post('/',createOrder)
      .get('/orderbyid',fetchOrderByUserId)
      .get('/allorders',fetchAllOrders)
      .get('/orderbyitsid/:id',fetchOrderByItsId)
      .patch('/update/:id',updateStatus);

exports.router=router;