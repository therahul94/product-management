const userModel = require("../models/userModel");
const validator = require("../validators/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const config= require("../utils/awsConfig")

const aws = require("aws-sdk");
const { default: mongoose } = require("mongoose");
const { compare } = require("bcrypt");
const { request } = require("express");


aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket", //HERE
      Key: "abc/" + file.originalname, //HERE
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      console.log(data);
      console.log("file uploaded succesfully");
      return resolve(data.Location);
    });
  });
};

const createUser = async function (req, res) {
  try {
    const reqBody = req.body;
    const files = req.files;

    //Check valid request body
    if (!validator.isRequestBodyEmpty(reqBody)) {
      return res.status(400).send({ status: false, message: "Please provide the details" });
    }

    let { fname, lname, email, phone, password, address } = reqBody;
    
//validate first name
    if (!validator.isValid(fname)) {
      return res.status(400).send({ status: false, message: "fname is missing." });
    }

    //check last name
    if (!validator.isValid(lname)) {
      return res.status(400).send({ status: false, message: "lname is missing." });
    }

    if (!validator.isValid(email)) {
      return res.status(400).send({ status: false, message: "email is missing." });
    }
    
    email = email.toLowerCase()
    if (validator.validEmail(email)) {
      return res.status(400).send({ status: false, message: "EMAIL is invalid" });
    }

    if (!validator.isValid(phone)) {
      return res.status(400).send({ status: false, message: "phone is missing." });
    }
    if (!validator.validMobileNum(phone)) {
      return res.status(400).send({ status: false, message: "Phone no. is invalid" });
    }

    if (!validator.isValid(password)) {
      return res.status(400).send({ status: false, message: "password is missing." });

    }
    if (!validator.validPwd(password)) {
      console.log(password);
      return res.status(400).send({status: false,message:"password Should contain atleast one upperCase, lowerCase, special character and also the length of password should atleast 8 and atmost 15 character."});
    }
    if (!validator.isValid(address)) {
      return res.status(400).send({ status: false, message: "Address is missing" });
    }

    // valid address is Object
    if (!validator.isValidObjectType(address)) {
      console.log(address);
      return res.status(400).send({ status: false, message: "Please, Enter valid Address" });
    }


    // check fname/lname is string or not
    if (!validator.validString(fname)) {
      return res.status(400).send({ status: false, message: "fname should be string." });
    }
    if (!validator.validString(lname)) {
      return res.status(400).send({ status: false, message: "lname should be string." });
    }


    // JSON parse 
    let addressParse = JSON.parse(address);
    let { shipping, billing } = addressParse;

    if (shipping) {
      if (!shipping.street)
        return res.status(400).send({ status: false, message: "shipping street is missing." });
      
        // if(!(.test(shipping.street))) return res.status(400).send({Status: false , message:"Please enter the valid shipping street address"})

      if (!shipping.city)
        return res.status(400).send({ status: false, message: "shipping city is missing." });
     
        if (!/^[a-zA-Z]+$/.test(shipping.city))
        return res.status(400).send({status: false,message: "Please enter the valid shipping city address"});

      if (!shipping.pincode)
        return res.status(400).send({ status: false, message: "shipping pincode is missing." });
     
        if (!/^[1-9][0-9]{5}$/.test(shipping.pincode))// ([1-9]{1}[0-9]{5}|[1-9]{1}[0-9]{3}\\s[0-9]{3})
        return res.status(400).send({status: false,message: "Please enter the valid shipping pincode "});
    } else
      return res.status(400).send({ status: false, message: "Shipping field is not given" });

    if (billing) {
      if (!billing.street)
        return res.status(400).send({ status: false, message: "billing street is missing." });

      // if(!(.test(shipping.street))) return res.status(400).send({Status: false , message:"Please enter the valid billing street address"})

      if (!billing.city)
        return res.status(400).send({ status: false, message: "billing city is missing." });

      if (!/^[a-zA-Z]+$/.test(shipping.city))
        return res.status(400).send({status: false,message: "Please enter the valid billing city address"});

      if (!billing.pincode)
        return res.status(400).send({ status: false, message: "billing pincode is missing." });
      if (!/^[1-9][0-9]{5}$/.test(shipping.pincode))
        return res.status(400).send({status: false,message: "Please enter the valid billing pincode "});
    } 
    else
      return res.status(400).send({ status: false, message: "billing field is not given" });

    // if Email and phone is already exist in DB then show msg: you have to use diiferent email and phone no.
    const isSameEmail = await userModel.findOne({ email: email });
    if (isSameEmail)
      return res.status(400).send({status: false,message: "Already registered Email, try different emailId"});

    const isSamePhone = await userModel.findOne({ phone: phone });
    if (isSamePhone)
      return res.status(400).send({status: false,message: "Already registered, try different Phone no."});

    // password encryption...
    password = await bcrypt.hash(password, 10);

    if (!(files && files.length)) {
      return res.status(400).send({ status: false, message: "Image file is missing." });
    }

    if (!/\.(jpe?g|png)$/i.test(files[0].originalname)) {
      return res.status(400).send({status: false, message: "product image extention should be .jpg/.png/.jpeg"});
    }
    const uploadedProfileImage = await uploadFile(files[0]);
    const tempObj = {
      fname,
      lname,
      email,
      phone,
      password,
      address: addressParse,
      profileImage: uploadedProfileImage,
    };

    console.log(tempObj);
    const data = await userModel.create(tempObj);
    return res.status(201).send({ status: true, message: "User created successfully", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const login = async function (req, res) {
  try {
    let data = req.body;

    if (!validator.isRequestBodyEmpty(data)) {
      return res.status(400).send({ status: false, msg: "Please provide details" });
    }

    

    if (!validator.isValid(data.email)) {
      return res.status(400).send({ status: false, msg: "Enter valid email id" });
    }

    if (!validator.isValid(data.password)) {
      return res.status(400).send({ status: false, msg: "Enter a valid password" });
    }

    const checkValidUser = await userModel.findOne({ email: data.email });
    if (!checkValidUser) {
      return res.status(400).send({ status: false, msg: "User does not exist" });
    }

// compare the password if match 
    let checkPassword = await bcrypt.compare(data.password,checkValidUser.password);

    if (!checkPassword) {
      return res.status(400).send({ status: false, message: "Password is not correct" });
    }

    let token = jwt.sign({ userId: checkValidUser._id }, "Product-Management", {expiresIn: "1d"});

    const userId = await userModel.findOne({ email: data.email }).select({ _id: 1 });
    res.status(200).send({status: true,msg: "User login successfull",data: { userId: userId._id, token: token }});
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

const getUserDetails = async function (req, res) {
  const userId = req.params.userId;
  if (!validator.isValid(userId)) {
    return res.status(400).send({ status: false, message: "userId is not given" });
  }
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: "userId is Invalid" });
  }

  const findUserId = await userModel.findById(userId);
  if (!findUserId)
    return res.status(403).send({ status: false, message: "NO DATA FOUND" });

  return res.status(200).send({ status: true, message: "user profile details", data: findUserId });
};



const updatedUserProfile = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    let files = req.files;

    console.log("hello")

    // let userProfile=await userModel.findById(userId)
    if (!validator.isValid(userId)) {
      return res.status(400).send({ status: false, message: "userId is not given" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "userId is Invalid" });
    }

    const findUserId = await userModel.findById(userId);
    if (!findUserId)
      return res.status(403).send({ status: false, message: "NO DATA FOUND" });

      // check request body is valid
    if (!validator.isRequestBodyEmpty(data)) {
      return res.status(400).send({ status: false, msg: "Enter a valid details" });
    }

    let { fname, lname, email, password, phone, address } =data;
    let updateData = {};

    if (fname) {
      if (!validator.isValid(fname)) {
        return res.status(400).send({ status: false, message: "fname is missing." });
      }
      if (!validator.validString(fname)) {
        return res.status(400).send({ status: false, msg: "fname should be string" });
      }
      updateData.fname = fname;
    }
    
    if (lname) {
      if (!validator.isValid(lname)) {
        return res.status(400).send({ status: false, message: "lname is missing." });
      }
      if (!validator.validString(lname)) {
        return res.status(400).send({ status: false, msg: "lname should be string" });
      }

      updateData.lname = lname;
    }
    if (email) {
      if (!validator.isValid(email)) {
        return res.status(400).send({ status: false, msg: "Enter a valid email id" });
      }
      email = email.toLowerCase()
      if (validator.validEmail(email)) {
        return res.status(400).send({ status: false, message: "EMAIL is invalid" });
      }

      let checkEmail = await userModel.findOne({ email: data.email });
      if (checkEmail)
        return res.status(400).send({ status: false, message: "Email already exist" });

      updateData.email = email;
    }
    if (phone) {
      if (!validator.validMobileNum(phone)) {
        return res.status(400).send({ status: false, msg: "Enter a valid phone number" });
      }
      if (!validator.validMobileNum(phone)) {
        return res.status(400).send({ status: false, message: "Moblie num is invalid" });
      }
      let checkPhone = await userModel.findOne({ phone: data.phone });
      if (checkPhone)
        return res.status(400).send({ status: false, message: "Phone number already exist" });

      updateData.phone = phone;
    }
    if (password) {
      if (!validator.isValid(password))
        return res.status(400).send({ status: false, msg: "invalid password" });
      if (!validator.validPwd(password)) {
        return res.status(400).send({status: false, msg: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters"});
      }

      data.password = await bcrypt.hash(data.password, 10);
    }


    if (data.profileImage) {
        if (typeof data.profileImage === "string") {
            return res.status(400).send({ Status: false, message: "Please upload the image" })
        }
    }
    if (files && files.length > 0) {

        let uploadedFileURL = await uploadFile(files[0])
        data.profileImage = uploadedFileURL
        updateData.profileImage = data.profileImage
    }
    
    
    if (address) {
    
      data.address = JSON.parse(data.address);

      if (typeof data.address != "object") {
        return res.status(400).send({ status: false, message: "Address must be in object" });
      }
      let { shipping, billing } = data.address;
      updateData.address = data.address
     
      if (shipping) {
        //   console.log("123")
        if (typeof shipping != "object") {
          return res.status(400).send({ status: false, message: "Shipping must be in object" });
        }

        if (Object.keys(shipping).length == 0) {
          return res.status(400).send({ status: false, message: "No keys are given in shipping" });
        }

        
        let { street, city, pincode } = shipping;

        if (street) {
          if (!validator.isValid(street)) {
            return res.status(400).send({ status: false, message: "shipping street is required" });
          }

          updateData.address.shipping.street = shipping.street;
        
        //   data.address.shipping.street = street;
        //   updateData.address = data.address
        

        }

        if (city) {
          if (!validator.isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "shipping city is required" });
          }

          if (!/^[a-zA-Z]+$/.test(shipping.city)) {
            return res.status(400).send({status: false,message: "city field have to fill by alpha characters" });
          }
          updateData.address.shipping.city = shipping.city;
        //   data.address.shipping.city = city;
        //   updateData.address = data.address
        //   updateData.address.shipping.city = shipping.city;
        //   console.log("aaaa:",updateData.address.shipping.city)

        }

        if (pincode) {
          if (!validator.isValid(pincode)) {
            return res.status(400).send({ status: false, message: "Shipping pincode is required" });
          }

          //applicable only for numeric values and extend to be 6 characters only--
          if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).send({status: false,message: "plz enter valid  shipping pincode"});
          }

          updateData.address.shipping.pincode = shipping.pincode;
        }



      }

      if (billing) {
        if (typeof billing != "object") {
          return res.status(400).send({ status: false, message: "Billing must be in object" });
        }

        if (Object.keys(billing).length == 0) {
          return res.status(400).send({ status: false, message: "No keys are given in billing" });
        }

        
        let { street, city, pincode } = billing;

        if (street) {
          if (!validator.isValid(street)) {
            return res.status(400).send({ status: false, message: "billing street is required" });
          }

          updateData.address.billing.street = billing.street;

        }

        if (city) {
          if (!validator.isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "billing city is required" });
          }
          
          if (!/^[a-zA-Z]+$/.test(billing.city)) {
            return res.status(400).send({status: false,message: "city field have to fill by alpha characters"});
          }

          updateData.address.billing.city = billing.city;
        }

        if (pincode) {
          if (!validator.isValid(pincode)) {
            return res.status(400).send({ status: false, message: "billing pincode is required" });
          }

          //applicable only for numeric values and extend to be 6 characters only--
          if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).send({status: false,message: "plz enter valid  billing pincode"});
          }

          updateData.address.billing.pincode = billing.pincode;
        }
    }
  }
    
    const updateUser=await userModel.findByIdAndUpdate(userId,updateData,{new:true})
    res.status(200).send({status:true,msg:"User profile updated",data:updateUser})

    
  } catch (err) {
      console.log(err)
      res.status(500).send({msg:err.message})
  }
};

module.exports = { createUser, login, getUserDetails,updatedUserProfile };
