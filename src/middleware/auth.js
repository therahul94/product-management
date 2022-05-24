const jwt=require("jsonwebtoken")
// const userModel=require("../models/userModel")

const authentication=function(req,res,next){
    try {
        
        let token= req.headers["x-Api-key"] || req.headers["x-api-key"]
        
        if(!token){
            return res.status(400).send({status:false,msg:"Token is missing"})
        }
        let decodedToken=jwt.verify(token,"Product-Management")
        if(!decodedToken)
            return res.status(401).send({status:false,msg:"Token is not valid"})
            req.userId=decodedToken.userId
            next()
    } catch (err) {
        res.status(500).send({status:false,msg:err.message})
    }
}
module.exports={authentication}