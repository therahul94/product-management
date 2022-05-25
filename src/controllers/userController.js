const userModel = require('../models/userModel')
const validator = require('../validators/validation')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')
// const awsModule = require('../aws/upload')

const aws = require('aws-sdk')
const { default: mongoose } = require('mongoose')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file ) =>{
    return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    })
}

const createUser = async function(req, res){
    try{
        const reqBody = req.body
        const files = req.files

        if(!validator.isRequestBodyEmpty(reqBody)){
            return res.status(400).send({status: false, message: "Please provide the details"})
        }

        let {fname, lname, email, phone, password, address} = reqBody
        // let addressToString = JSON.stringify(address)
       


        if(!validator.isValid(fname)){
            return res.status(400).send({status: false, message: "fname is missing."})
        }
        if(!validator.isValid(lname)){
            return res.status(400).send({status: false, message: "lname is missing."})
        }
        if(!validator.isValid(email)){
            return res.status(400).send({status: false, message: "email is missing."})
        }
        if(validator.validEmail(email)){
            return res.status(400).send({status: false, message: "EMAIL is invalid"})
        }

        if(!validator.isValid(phone)){
            return res.status(400).send({status: false, message: "phone is missing."})
        }
        if(!validator.validMobileNum(phone)){
            return res.status(400).send({status: false, message: "Phone no. is invalid"})
        }

        if(!validator.isValid(password)){
            return res.status(400).send({status: false, message: "password is missing."})
        }   
        if(!validator.validPwd(password)){
            console.log(password)
            return res.status(400).send({status: false, message: "password Should contain atleast one upperCase, lowerCase, special character and also the length of password should atleast 8 and atmost 15 character. "})
        }

        if(!validator.isValidObjectType(address))
        {console.log(address)
            return res.status(400).send({status: false, message: "address is missing."})
            
        }
        let addressParse = JSON.parse(address)

        let {shipping, billing} = addressParse
        if(shipping){
            if(!shipping.street) return res.status(400).send({status: false, message: "shipping street is missing."})
            // if(!(.test(shipping.street))) return res.status(400).send({Status: false , message:"Please enter the valid shipping street address"}) 

            if(!shipping.city) return res.status(400).send({status: false, message: "shipping city is missing."})
            if(!(/^[a-zA-Z]+$/.test(shipping.city))) return res.status(400).send({Status: false , message:"Please enter the valid shipping city address"}) 

            if(!shipping.pincode) return res.status(400).send({status: false, message: "shipping pincode is missing."})
            if(!(/^[1-9][0-9]{5}$/.test(shipping.pincode))) return res.status(400).send({Status: false , message:"Please enter the valid shipping pincode "}) 
        }
        else return res.status(400).send({status: false, message: "Shipping field is not given"})

        if(billing){
            if(!billing.street) return res.status(400).send({status: false, message: "billing street is missing."})
            // if(!(.test(shipping.street))) return res.status(400).send({Status: false , message:"Please enter the valid billing street address"}) 

            if(!billing.city) return res.status(400).send({status: false, message: "billing city is missing."})
            if(!(/^[a-zA-Z]+$/.test(shipping.city))) return res.status(400).send({Status: false , message:"Please enter the valid billing city address"}) 

            if(!billing.pincode) return res.status(400).send({status: false, message: "billing pincode is missing."})
            if(!(/^[1-9][0-9]{5}$/.test(shipping.pincode))) return res.status(400).send({Status: false , message:"Please enter the valid billing pincode "}) 
        }
        else return res.status(400).send({status: false, message: "billing field is not given"})

        // if Email and phone is already exist in DB then show msg: you have to use diiferent email and phone no.
        const isSameEmail = await userModel.findOne({email: email})
        if(isSameEmail) return res.status(400).send({status: false, message: "Already registered Email, try different emailId"})
        
        const isSamePhone = await userModel.findOne({phone: phone})
        if(isSamePhone) return res.status(400).send({status: false, message: "Already registered, try different Phone no."})

        // password encryption...
        password = await bcrypt.hash(password, 10)


        if(!(files && files.length)){
            return res.status(400).send({status: false, message: "Image file is missing."})
        }

        const uploadedProfileImage = await uploadFile( files[0] )
        const tempObj = {
            fname,lname,email, phone,password, address: addressParse,
            profileImage: uploadedProfileImage
        }
        console.log(tempObj)
        const data = await userModel.create(tempObj)
        return res.status(201).send({status: true, message: "User created successfully", data: data})
    }
    catch(error){
        console.log(error)
        return res.status(500).send({status: false, message: error.message})
    }

}   


const login=async function(req,res){
    try {
        let data=req.body

        if(!validator.isRequestBodyEmpty(data)){
            return res.status(400).send({status:false,msg:"Please provide details"})
        }

        // if(!data.email){
        //     return res.status(400).send({status:false, msg:"Email id is requried"})
        // }

        // if(!data.password){
        //     return res.status(400).send({status:false, msg:"Password is requried"})
        // }

        if(!validator.isValid(data.email)){
            return res.status(400).send({status:false, msg:"Enter valid email id"})
        }

        if(!validator.isValid(data.password)){
            return res.status(400).send({status:false, msg:"Enter a valid password"})
        }

        const checkValidUser= await userModel.findOne({email:data.email})
        if(!checkValidUser){
            return res.status(400).send({status:false,msg:"Email Id is not correct "})
        }

        let checkPassword = await bcrypt.compare(
            data.password,
            checkValidUser.password
          );
      
          if (!checkPassword) {
            return res.status(400).send({ status: false, message: "Password is not correct" });
          }

          let token = jwt.sign({ userId: checkValidUser._id }, "Product-Management", {
            expiresIn: "1d",
          });

          const userId= await userModel.findOne({email:data.email}).select({_id:1})
          res.status(200).send({status:true,msg:"User login successfull",data:{userId: userId._id, token: token}})
      
    } catch (err) {
        res.status(500).send({msg:err.message})
    }
}


const getUserDetails = async function(req, res){

    const userId = req.params.userId
    if(!validator.isValid(userId)){
        return res.status(400).send({status: false, message: "userId is not given"})
    }
    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).send({status: false, message: "userId is Invalid"})
    }

    const findUserId = await userModel.findById(userId)
    if(!findUserId) return res.status(403).send({status: false, message: "NO DATA FOUND"})

    return res.status(200).send({status: true, message: "user profile details", data: findUserId})

}

module.exports = {createUser, login, getUserDetails}