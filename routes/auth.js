const express=require('express');
const { createUser, checkLogin, checkAuth, logout,resetPasswordRequest,resetPassword } = require('../controller/auth');
const passport = require('passport');
const router=express.Router();

router.post('/signup',createUser)
      .post('/login',passport.authenticate('local'),checkLogin)
      .get('/check',passport.authenticate('jwt'),checkAuth)
      .get('/logout',logout)
      .post('/resetpasswordrequest',resetPasswordRequest)
      .post('/resetpassword',resetPassword)
exports.router=router;  