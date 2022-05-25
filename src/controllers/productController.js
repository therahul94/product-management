const req = require("express/lib/request")
const res = require("express/lib/response")
const productModel=require("../models/productModel")
const validation=require("../validators/validation")

const addProduct=async (req,res)=>{
    try {
        let data=req.body
        let files=req.files

        const{title,description,price,currencyId,currencyFormat,productImage,isFreeShipping,style,
            availableSizes,installments}=data

        if(!validation.isValid(data)){
            return res.status(400).send({status:false,msg:"Enter Valid product details"})
        }

        if(!validation.isValid(title)) return res.status(400).send({status:false,msg:"title is requried"})

        let checkTitle=await productModel.findOne({title:data.title})
        if(checkTitle){
            return res.status(400).send({status:false,msg:"Title is already Exist"})
        }

        if(!validation.isValid(description))
        return res.status(400).send({status:false,msg:"description is requried"})

        if(!validation.validString(description))
        return res.status(400).send({status:false,msg:"Description should be string"})

        if(!validation)
    
    } catch (err) {
        
    }
}
