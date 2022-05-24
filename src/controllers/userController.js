const userModel = require('../models/userModel')
const validator = require('../validators/validation')
const bcrypt = require('bcrypt')
// const awsModule = require('../aws/upload')

const aws = require('aws-sdk')

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

module.exports = {createUser}