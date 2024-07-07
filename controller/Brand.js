const {Brands} =require("../model/brands");
exports.fetchAllBrands=async(req,res)=>{
    try{
    const brands=await Brands.find({}).exec();
    res.status(200).json(brands);
}
  catch(err){
      res.status(400).json(err);
  }
}
exports.addBrands=async(req,res)=>{

    const Brand=new Brands(req.body);
    try{
         const response=await Brand.save();
         res.status(201).json(response);

    }
    catch(err){
        console.log(err);
    }
}
