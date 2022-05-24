const express=require('express')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const route= require('./routes/route')
const multer = require('multer')
const app=express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(multer().any())

mongoose.connect("mongodb+srv://Avi9984:edmXH1jaB63lQyo8@cluster0.qfc4n.mongodb.net/group25",{
    useNewUrlParser:true
})
.then(()=>console.log("Connected to MongoDB.."))
.catch((err)=>console.log(err.message))

app.use("/",route)

app.listen(process.env.PORT || 3000,function(){
    console.log('Express app running on the port ' +(process.env.PORT || 3000))
})