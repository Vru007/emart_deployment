const express=require('express');
const router=express.Router();
const {fecthAllCategory, addCategory}=require('../controller/Category');



router.get('/',fecthAllCategory)
      .post('/',addCategory);
      
exports.router=router;