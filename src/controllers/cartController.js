const userModel=require("../models/userModel")
const productModel=require("../models/productModel")
const cartModel=require("../models/cartModel")
const validation=require("../validators/validation")
const { default: mongoose } = require("mongoose")
 


const createCart = async (req, res) => {
    try {
      // getting the decode token userId from request
      // validation of Objectid in params
      if (!mongoose.isValidObjectId(req.params.userId))
        return res.status(400).send({ status: false, msg: "enter a valid objectId in params" });
  
      // check authorisation of the user
      // if (req.userId != req.params.userId)
      //   return res
      //     .status(403)
      //     .send({ status: false, msg: "you are not authorized" });
  
      let user = await userModel.findById(req.params.userId);
      if (!user)
        return res.status(404).send({ status: false, msg: "no user found" });
  
  
      // validation of product
      let productId = req.body.productId;
  
      if (!mongoose.isValidObjectId(productId))
        return res.status(400).send({ status: false, msg: "enter a valid productId in body" });

  
      let product = await productModel.findOne({_id: productId,isDeleted: false}); // product Object
      if (!product)
        return res.status(404).send({ status: false, msg: "no product found" });
  
      // check if cart is present
      // Now fiding the cart
    
  
      let cart = await cartModel.findOne({ userId: req.params.userId });
  
      if (cart) {
        // if cart is already there
        let index = cart.items.findIndex((el) => el.productId == productId); // -1 or index
        if (index > -1) {

          // if the product is already in the cart
         let quantity=req.body.quantity
          if(quantity){

            if (quantity < 0) {
                return res.status(400).send({status: false,message: "Quantity can't be a negative number"});
              }
        

              if(quantity % 1 != 0){
                  return res.status(400).send({status:false,msg:"qunatity can be only whole number"})
              }
              
              cart.items[index].quantity=cart.items[index].quantity+quantity
              let increment=product.price *quantity

              let updatedCart = await cartModel.findOneAndUpdate({ userId: req.params.userId },{ items: cart.items, $inc: { totalPrice: increment } }, { new: true });
              return res.status(200).send({status: true,msg: "product quantity is updated",data: updatedCart });
          }
          cart.items[index].quantity += 1; //increase the quantity of product by 1
          let updatedCart = await cartModel.findOneAndUpdate(
            { userId: req.params.userId },
            { items: cart.items, $inc: { totalPrice: product.price } },
            { new: true }
          );
          return res.status(200).send({status: true,msg: "product quantity is increased by 1",data: updatedCart});
        }
        // total itmes => number of product objects in item array
        //if product  is not present in the cart.items
        // $addToSet => add a element in the array
        let products = { productId: productId, quantity: 1 }; // $addToSet or $push
        let updatedCart = await cartModel.findOneAndUpdate({ userId: req.params.userId },{$addToSet: { items: products },$inc: { totalItems: 1, totalPrice: product.price }},{ new: true });
        return res.status(200).send({ status: true, msg: "product is added", data: updatedCart });
      }
      // if cart is not created yet
      let cartDetails = {
        userId: req.params.userId,
        items: [{ productId: productId, quantity: 1 }],
        totalItems: 1,
        totalPrice: product.price,
      };
      let newCart = await cartModel.create(cartDetails);
  
      return res.status(201).send({ status: true, msg: "cart created successfully", data: newCart });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  };


// PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)

 const updateCart=async (req, res)=>{
     try {
         let data=req.body
         let userId=req.params.userId

         if(!validation.isRequestBodyEmpty(data)){
             return res.status(400).send({status:false, msg:"Product details must need to update"})
         }
         if(!mongoose.isValidObjectId(userId)){
             return res.status(400).send({status:false, msg:"need userId"})
         }
         const isPresentUser= await userModel.findById({_id:userId})

         if(!isPresentUser){
             return res.status(404).send({status:false, msg:"User not found"})
         }

         const {cartId, productId, removeProduct}=data

         if(!validation.isValid(cartId)){
             return res.status(400).send({status:false, msg:"CardId is required"})
         }

         if(!validation.isValid(productId)){
             return res.status(400).send({status:false, msg:"Product Id is requried"})
         }

         if(!validation.isValid(removeProduct)){
             return res.status(400).send({status:false, msg:"Remove product is requried"})
         }

         if(!mongoose.isValidObjectId(productId)){
             return res.status(400).send({status:false, msg:"Product Id is invalid"})
         }
         const isPresentProductId= await productModel.findById(productId)
         if(!isPresentProductId){
             return res.status(404).send({status:false, msg:"Product Id does not exist"})
         }

         if(!mongoose.isValidObjectId(cartId)){
             return res.status(400).send({status:false, msg:"Cart Id is invalid"})
         }

         const isPresentCartId=await cartModel.findOne({_id:cartId, userId:userId})
         if(!isPresentCartId){
             return res.status(404).send({status:false, msg:"No such cart exist"})
         }

         if (!(removeProduct == 0 || removeProduct == 1)) {
            return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
          }

        

          const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
          if (!productDetails) {
            return res.status(404).send({ status: false, msg: "product not exist or deleted" })
          }
         

         const cart=isPresentCartId.items
         

         for(let i=0;i<cart.length;i++){
             if(cart[i].productId==productId){
                 let changePrice=cart[i].quantity * isPresentProductId.price

                 if(removeProduct==0){
                     const productRemove= await cartModel.findOneAndUpdate({_id:cartId}, {$pull:{items:{productId:productId}}, totalPrice: isPresentCartId.totalPrice - changePrice, totalItems:isPresentCartId.totalItems-1},{new:true})
                   return  res.status(200).send({status:true, msg:"Remove product Successfully",data:productRemove}).select({__v:0})
                 }

                 if(removeProduct==1){
                     if(cart[i].quantity==1 && removeProduct==1 ){
                         const priceUpdate=await cartModel.findOneAndUpdate({_id:cartId},{$pull:{items:{productId}},totalPrice:isPresentCartId.totalPrice-changePrice, totalItems:isPresentCartId.totalItems-1},{new:true})
                     return res.status(200).send({status:true,msg:"Remove product and price update successfully",data:priceUpdate}).select({__v:0})
                     }
                     cart[i].quantity=cart[i].quantity-1;
                     const cartUpdated= await cartModel.findByIdAndUpdate({_id:cartId},{items:cart,totalPrice:isPresentCartId.totalPrice -isPresentProductId.price},{new:true})
                   return  res.status(200).send({status:true,msg:"One item remove successfully",data:cartUpdated}).select({__v:0}) 
                 }
             }
         }

     } catch (err) {
         console.log(err)
         res.status(500).send({ status: false, message: err.message });
     }
 }

 const getCart = async (req, res) =>{
    try {
      let userId = req.params.userId;
  
      //checking if the cart exist with this userId or not
      if(!mongoose.isValidObjectId(userId)){
          return res.status(400).send({status:false,msg:"please provide valid userId"})
      }
      let findCart = await cartModel.findOne({ userId:userId }).populate('items.productId').select({__v:0});
      if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });
  
      res.status(200).send({ status: true, message: "Cart Details", data: findCart })
    } catch (err) {
      res.status(500).send({ status: false, error: err.message })
    }
  }
  
  const deleteCart= async (req,res)=>{
    try {
        let userId=req.params.userId

        if(!mongoose.isValidObjectId(userId)){
            return res.status(400).send({status:false, msg:"Enter valid userId"})
        }

          console.log(userId)

        const findCartById= await cartModel.findOne({userId:userId})
        if(!findCartById){
            return res.status(404).send({status:false, msg:`No found cart with this ${userId}`})
        }

        console.log("yeh", findCartById)

      
       let k1=findCartById.items
       console.log(k1)
        if(k1.length==0 && findCartById.totalItems==0 && findCartById.totalPrice == 0 ){
            return res.status(400).send({status:false, msg:"Cart is alreday deleted"})
        }
       
    
       let deleteCart= await cartModel.findOneAndUpdate({userId:userId},{items:[],totalItems:0,totalPrice:0},{new:true})
           return res.status(200).send({status:true, msg:"Delete Cart Successfully",data:deleteCart})
        


    } catch (err) {
        console.log(err)
        res.status(500).send({status:false,msg:err.message})
        
    }
}



module.exports={createCart,updateCart,getCart,deleteCart}