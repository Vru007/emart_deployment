const {Product} =require("../model/product");
exports.createProduct=async(req,res)=>{
    const product=new Product(req.body);
    console.log("product in backend: ",product);
    try{
    const response=await product.save();
    res.status(200).json(response);
    console.log(response);
    }
    catch(err){
        res.status(400).json(err);
        console.log(err);
                                               
    }
}

exports.fetchAllProducts=async(req,res)=>{
    let str=Product.find({});
    let totalCount=Product.find({});
    // console.log("query category:",req.query.category);
    if(req.query.category){
        str=str.find({category:{$in:req.query.category.split(',')}});
        totalCount=totalCount.find({category:{$in:req.query.category.split(',')}});
    }
    if(req.query.brand){
        str=str.find({brand:{$in:req.query.brand.split(',')}});
        totalCount=totalCount.find({brand:{$in:req.query.brand.split(',')}});
    }
    if(req.query._sort && req.query._order){
        str=str.sort({[req.query._sort]:req.query._order});

    }

    const totalDocs=await totalCount.count().exec();
    if(req.query._page && req.query._limit){
        const pageSize=req.query._limit;
        const page=req.query._page;
        str=str.skip(pageSize*(page-1)).limit(pageSize);
    }

    try{
        
        const docs=await str.exec();
        res.set('X-Total-Count',totalDocs);
        res.status(200).json(docs);
        
    }
    catch(err){
        res.status(400).json(err);
    }
}

exports.fetchProductById=async(req,res)=>{
    
    const {id}=req.params;
    try{
    const product=await Product.findById(id);
    res.status(200).json(product);
}
catch(err){
    console.log(err);
    res.status(400).json(err);
}
}

exports.updateProduct=async(req,res)=>{
    const {id}=req.params;
    try{
          
        const updatedProduct=await Product.findByIdAndUpdate(id,req.body,{new:true});
        res.status(200).json(updatedProduct);
    }
    catch(err){
        console.log(err);
        res.status(400).json(err);
    }
}