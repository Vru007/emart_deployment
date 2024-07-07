const express = require('express');
const { addtoCart, fetchCartByUserId,deleteItemFromCart, updateItemFromCart } = require('../controller/cart');
const router=express.Router();

router.post("/",addtoCart)
      .get("/",fetchCartByUserId)
      .delete("/:id",deleteItemFromCart)
      .patch('/:id',updateItemFromCart);
exports.router=router;