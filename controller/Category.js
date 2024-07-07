const {Category}=require("../model/category");
exports.fecthAllCategory=async(req,res)=>{

    try{
         const category=await Category.find({}).exec();
         res.status(200).json(category);

    }
    catch(err){
        res.status(400).json(err);
    }
}

exports.addCategory=async(req,res)=>{

    const category=new Category(req.body);
        try{
             
            const response=await category.save();
            res.status(200).json(response);
        }
        catch(err){
            res.status(400).json(err);
        console.log(err);
        }
    
}