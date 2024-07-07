const express= require('express');
const { fetchAllBrands, addBrands } = require('../controller/Brand');
const router=express.Router();


router.get('/',fetchAllBrands)
      .post('/',addBrands);
exports.router = router;