const mongoose=require('mongoose'); 
const {Schema}=mongoose; 

const orderSchema= new Schema({
       
   products:{type:[Schema.Types.Mixed],required:true},
   user:{type:Schema.Types.ObjectId,ref:'Users',required:true},
   PaymentMethod:{type:String,require:true},
   selectedAddress:{type:[Schema.Types.Mixed],required:true},
   totalAmount:{type:Number},
   totalItems:{type:Number},
   })

const virtual =orderSchema.virtual('id');
virtual.get(function(){
    return this._id;
})

orderSchema.set('toJSON',{
    virtuals:true,
    versionKey:false,
    transform:function(doc,ret){delete ret._id}
})

exports.Order=mongoose.model('Order',orderSchema);