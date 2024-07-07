const express = require('express');
const { updateUser, fetchUser } = require('../controller/user');
const router=express.Router();

router.patch('/update/',updateUser)
      .get('/own',fetchUser);
exports.router=router;