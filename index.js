const express=require('express');
const app = express();
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const { createProduct } = require('./controller/Product');
const productRouter=require('./routes/Product');
const categoryRouter=require('./routes/Category');
const brandRouter=require('./routes/Brand');
const authRouter=require('./routes/auth');
const userRouter=require('./routes/user');
const cartRouter=require("./routes/cart");
const orderRouter=require("./routes/order");
const paymentRouter=require("./routes/payment");
const path=require('path');
const jwt =require('jsonwebtoken');
const cors=require('cors');
const session = require('express-session');
const cookieParser=require('cookie-parser');
const passport = require('passport');
const { Users } = require('./model/user');
const LocalStrategy = require('passport-local').Strategy;
const crypto=require("crypto");
const bodyParser = require('body-parser');
const {isAuth,sanitizeUser,cookieExtractor}=require('./services/common');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Razorpay=require('razorpay');
const nodemailer=require('nodemailer');
require('dotenv').config();


const SECRET_KEY = process.env.SECRET_KEY;
const token=jwt.sign({foo:'bar'},SECRET_KEY);

//razorpay integration

const opts={}
opts.jwtFromRequest=cookieExtractor;
opts.secretOrKey=SECRET_KEY;

// app.use(cors());



// Setup email data



//middlewares
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });
app.use(cors({
   origin: 'http://localhost:5173', 
   methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
   credentials: true,
   allowedHeaders: ['Content-Type', 'Authorization'],
   exposedHeaders:['X-Total-Count','Total-Order-Count','Authorization']
}));
app.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
  }));
app.use(cookieParser());
app.use(passport.authenticate('session'));
passport.use('local',new LocalStrategy(
  {usernameField:'email', passwordField:'password'},
   async function(email, password, done) {
     try{
            const user=await Users.findOne({email}).exec();
            
             console.log("user in index: ",{user});
             if(!user){
              return done(null,false,{message:'Invalid Credentials'});
           }

             crypto.pbkdf2(
              password,
              user.salt,
              310000,
              32,
              'sha256',
              async function(err,hashedPassword){
                if(err){
                  return done(err);
                }
               if(!crypto.timingSafeEqual(user.password,hashedPassword)){
                return done(null,false,{message:'Invalid Credentials'});
               }
               const token=jwt.sign(sanitizeUser(user),SECRET_KEY);
               return done(null,{id:user.id,role:user.role,token});
             
              }
            );
             
     }
     catch(err){
       return done(err);
     }
       
    
    }));

passport.use('jwt',new JwtStrategy(opts,async function(jwt_payload,done){
   
  try{
    const user =await Users.findById(jwt_payload.id);
    if(user){
      return done(null,sanitizeUser(user));
    }
    else{
      return done(null,false);
    }
  }
  catch(err){
    return done(err,false);
  }

}))    
passport.serializeUser(function(user, cb) {
    console.log('serialize',user);
    process.nextTick(()=>{
      return cb(null, {
        id: user.id,
        role:user.role
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(()=>{
      return cb(null, user);
    });
  });


app.use('/products',productRouter.router);
app.use('/category',categoryRouter.router);
app.use('/brand',brandRouter.router);
app.use('/auth',authRouter.router);
app.use('/user',isAuth(),userRouter.router);
app.use('/cart',isAuth(),cartRouter.router);
app.use('/orders',isAuth(),orderRouter.router);
app.use('/payment',isAuth(),paymentRouter.router);

// Use CORS middleware with specified options
app.get('*', (req, res,next) => {

  if(req.path.includes('.')){
    next();
  }
  else{
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } 
});
const MONGO_URI=process.env.MONGO_URI;

try{
 mongoose.connect(MONGO_URI)
.then(()=>{
    console.log("connected");
    app.listen(8081,()=>{
        console.log("server started at 8081");
    })
})
}catch(e){
    console.log(e);
}



app.get('/',(req,res)=>{
    res.json({status:'success'});
});


