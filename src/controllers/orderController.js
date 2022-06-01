const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const { default: mongoose } = require('mongoose');

const createOrder = async function(req, res){
    try{
        let {status,cancellable }=req.body
        if(status){
           const start= ["pending", "completed", "cancaled"].indexOf(status)
           if(start==-1){
               return res.status(400).send({status:false, message: "Status can only be pending/completed/cancaled "})
           }
        }

        //Data coming from  form_data only , Condition Apply
        if(cancellable){
            cancellable=cancellable.toLowerCase()
            const cancle= ["true","false"].indexOf(cancellable)
            if(cancle==-1){
                return res.status(400).send({status:false, message: "Status can only be true/false "})
            }}
        if(!mongoose.isValidObjectId(req.params.userId)){
            return res.status(400).send({status:false, message:" Please Provide Valid UserId"})

        }
        if(!mongoose.isValidObjectId(req.body.cartId)){
            return res.status(400).send({status:false, message:" Please Provide Valid cartId"})
        }

        const user = await userModel.findById(req.params.userId);
        // if(!mongoose.isValidObjectId(req.params.userId))
        if(!user) return res.status(400).send({status: false, message: "User doesnot exist."});
        console.log(user._id)

        const getCart = await cartModel.findOne({userId: user._id,_id:req.body.cartId, isDeleted: false});
        if(!getCart) return res.status(400).send({status: false, message: "Cart doesnot exist."});

        let totalQuantity = 0;
        for(let i=0;i<(getCart["items"]).length;i++){
            totalQuantity += getCart.items[i].quantity;
        }

        let order = getCart.toJSON();
        order['totalQuantity'] = totalQuantity;

        const orderDetails = await orderModel.create(order);
        return res.status(201).send({status: true, message: 'Success', Data: orderDetails});
    }
    catch(error){
        if(error.code===11000){
            return res.status(400).send({status:false, message:" This cart does not belong to the correct user"})
        }
        console.log(error);
        return res.status(500).send({status: false, message: error.message})
    }

}

module.exports = {createOrder};