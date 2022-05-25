const jwt=require("jsonwebtoken")
const userModel = require("../models/userModel")
// const userModel=require("../models/userModel")

const authentication=function(req,res,next){
    try {
        
        let token= req.header('Authorization')
        console.log(token)

        
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

const authorization = async (req, res, next) => {
    try {
      let loggedInUser = req.decodedToken.userId;
      let userLogging;
  
      if (req.body.hasOwnProperty("userId")) {
        if (!isValidObjectId(req.body.userId))
          return res
            .status(400)
            .send({ status: false, message: "Enter a valid user id" });
        let userData = await userModel.findById(req.body.userId);
        if (!userData)
          return res
            .status(404)
            .send({
              status: false,
              message: "Error! Please check user id and try again",
            });
        userLogging = userData._id.toString()
      }
  
      if (!userLogging)
        return res
          .status(400)
          .send({ status: false, message: "User Id is required" });
  
      if (loggedInUser !== userLogging)
        return res
          .status(403)
          .send({ status: false, message: "Error, authorization failed" });
      next();
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  };
module.exports={authentication,authorization}