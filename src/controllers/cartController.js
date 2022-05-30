const userModel=require("../models/userModel")
const productModel=require("../models/productModel")
const cartModel=require("../models/cartModel")
const validation=require("../validators/validation")
const { default: mongoose } = require("mongoose")


const createCart=async (req, res)=>{
    
    let requestBody=req.body
    let userId=req.params.userId
    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).send({status:false, msg:"user Id is not valid"})
    }

    const validUser=await userModel.findById(userId)
    if(validUser==null){
        return res.status(400).send({status:false,msg:"No such user exist"})
    }
    
    let {cartId,items}=requestBody

    if(cartId){
        try {
            
       
        if(!mongoose.isValidObjectId(cartId)){
            return res.status(400).send({status:false,msg:"Cart id is invalid"})
        }

        const checkCart=await cartModel.findOne({_id:cartId, isDeleted:false})
        if(checkCart===null){
            return res.status(404).send({status:false,msg:"Cart not found"})
        }

        if(items.length==0){
            return res.status(400).send({status:false,msg:"No items provided"})
        }
        let totalPrice=0
        
       
        items=JSON.parse(items)

        // let matchfound = 0
        for(let i=0;i<items.length;i++){


         console.log("itaeration number bole toh" , i)


            if(! (items[i].hasOwnProperty('productId'))){

                console.log("yeh to problem hai")
            }

            if(!(items[i].hasOwnProperty('quantity'))){

                console.log("yeh to problem hai bisssadhcheufu3nwnci")
            }

            if( !(/^[1-9]\d*$/.test(items[i].quantity))){

                console.log("eh  galat aur rahaa hai chaacha")
            }



        if(!items[i].productId) return res.status(400).send({status:false, msg:"please provide product Id"})
        
        
        if(!mongoose.isValidObjectId(items[i].productId)){
            return res.status(400).send({status:false,msg:"product Id is invalid"})
        }
        let matchtest= await productModel.findOne({_id:items[i].productId, isDeleted:false})
        let checkProductId=await productModel.findOne({_id:items[i].productId, isDeleted:false}).select({price:1, _id:0})
        if(checkProductId===null){
            return res.status(400).send({status:false,msg:"product Id is not found"})
        }

         length= checkCart.items.length

        for(let a=0; a<length; a++){

            var  matchfound1 = { }
                 matchfound1.test = false
           
             var list= length;
            list= list-1
       

        if(matchtest.id == checkCart.items[a].productId){
            
            console.log( "aarey ramesh suresh")

            checkCart.items[a].quantity = checkCart.items[a].quantity+items[i].quantity

            
            
            let updatedcart2= await cartModel.findOneAndUpdate( {_id:checkCart.id}, checkCart)
            
            let k= checkProductId.price
            let M= items[i].quantity
             let price=Number(k)*Number(M)
             totalPrice=totalPrice+price

             checkCart.totalPrice=checkCart.totalPrice+totalPrice

             let checkCartFinal=await cartModel.findOneAndUpdate({_id:cartId},checkCart)

          
           
             matchfound1.test = true
            console.log(a)
            
        }
        if(a==list){


        
          
            if(matchfound1.test==false){

      
            if(matchtest.id != checkCart.items[items.length-1].productId){
              
                console.log("unique hai wahaa", matchtest.id)
                let pushelem=checkCart.items

                 let pushunique= checkCart.totalItems

                 console.log("pehele itne items thai ", pushunique)
                 pushunique= pushunique+1

                
                pushelem.push({productId:matchtest.id,quantity:items[i].quantity })
                // console.log("nayaaitem:", pushelem)
                let updatedcart = await cartModel.findOneAndUpdate( {_id:checkCart.id}, {pushelem})
                    console.log("line one executed")
                let updatedcart2= await cartModel.findOneAndUpdate( {_id:checkCart.id}, {pushunique})

                console.log("finaluu yeh dikhta hia", updatedcart2)

               

                // console.log("naayaupdate", updatedcart)
                // checkCart.totalItems=checkCart.totalItems+Number(items.length) 


            }}}

                // console.log(matchfound1)
        
        }

    //    let k= checkProductId.price
    //    let M= items[i].quantity
    //     let price=Number(k)*Number(M)
    //     totalPrice=totalPrice+price

    }
    // checkCart.totalItems=checkCart.totalItems+Number(items.length) -matchfound
    // checkCart.totalPrice=checkCart.totalPrice+totalPrice
    // totalItems=totalItems+items.length
    // finalPrice=finalPrice+totalPrice
    // const checkCartFinal=await cartModel.findOneAndUpdate({_id:cartId},checkCart,{new:true})
    // console.log(checkCartFinal)
    // res.status(200).send({status:true,msg:"ahdj",data:checkCartFinal})
    
       res.status(200).send(checkCart)
    }
 catch (err) {
     console.log(err)
         res.status(500).send(err)   
}
 } else{
        try {
            let totalPrice=0;
            let {items}=requestBody
            let data={}
            data.userId=userId
          //  if(!mongoose.isValidObjectId(productId)){
           //     return res.status(400).send({status:false,msg:"product Id is invalid"})
           // }
    
           items=JSON.parse(items)
            for(let i=0;i<items.length;i++){
    
                console.log(items)
                // let cart=JSON.parse(items)
                // console.log(cart)
                
                if(!(items[i].productId)) return res.status(400).send({status:false, msg:"please provide product Id1"})
                
                
                if(!mongoose.isValidObjectId(items[i].productId)){
                    return res.status(400).send({status:false,msg:"product Id is invalid"})
                }
        console.log("hiii")
                const checkProductId=await productModel.findOne({_id:items[i].productId, isDeleted:false}).select({price:1, _id:0})
                if(checkProductId===null){
                    return res.status(400).send({status:false,msg:"product Id is not found"})
                }
        console.log(checkProductId)
                let k= checkProductId.price
                let M= items[i].quantity
                 price=Number(k)*Number(M)
                 totalPrice=totalPrice+price
    
            // let  checkProductId=await findOne({_id:productId, isDeleted:false}).select({price:1, _id:0, __v:0})
            // if(checkProductId===null){
            //     return res.status(400).send({status:false,msg:"product Id is not found"})
            // }
        }
        data.totalItems=items.length
        data.totalPrice=totalPrice
        data.items=items
    
        const finalData= await cartModel.create(data)
        res.status(201).send({status:true, msg:"Cart Successfully Created", data:finalData})
    
    }
            
        catch (error) {
            console.log(error)
            res.status(500).send(error)
        }


}}
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

         if(validation.isValid(productId)){
             return res.status(400).send({status:false, msg:"Product Id is requried"})
         }

        //  if(!validation.isValid(removeProduct)){
        //      return res.status(400).send({status:false, msg:"Remove product is requried"})
        //  }

         if(mongoose.isValidObjectId(productId)){
             return res.status(400).send({status:false, msg:"Product Id is invalid"})
         }
         const isPresentProductId= await productModel.findById(productId)
         if(!isPresentProductId){
             return res.status(404).send({status:false, msg:"Product Id does not exist"})
         }

         if(!mongoose.isValidObjectId(cartId)){
             return res.status(400).send({status:false, msg:"Cart Id is invalid"})
         }

         const isPresentCartId=await cartModel.findById(cartId)
         if(!isPresentCartId){
             return res.status(404).send({status:false, msg:"Cart Id does not exist"})
         }

         const cart=isPresentCartId.items

         for(let i=0;i<cart.length;i++){
             if(cart[i].productId==productId){
                 let changePrice=cart[i].quantity * isPresentProductId.price

                 if(removeProduct==0){
                     const productRemove= await cartModel.findOneAndUpdate({cartId}, {$pull:{items:{productId:productId}}, totalPrice: isPresentCartId.totalPrice - changePrice, totalItems:isPresentCartId.totalItems-1},{new:true})
                     res.status(200).send({status:true, msg:"Remove product Successfully",data:productRemove})
                 }

                 if(removeProduct==1){
                     if(cart[i].quantity==1 && removeProduct==1 ){
                         const priceUpdate=await cartModel.findOneAndUpdate({cartId},{$pull:{items:{productId}},totalPrice:isPresentCartId.totalPrice-changePrice, totalItems:isPresentCartId.totalItems-1},{new:true})
                         res.status(200).send({status:true,msg:"Remove product and price update successfully",data:priceUpdate})
                     }
                     cart[i].quantity=cart[i].quantity-1;
                     const cartUpdated= await cartModel.findByIdAndUpdate({cartId},{items:cart,totalPrice:isPresentCartId.totalPrice -isPresentProductId.price},{new:true})
                     res.status(200).send({status:true,msg:"One item remove successfully",data:cartUpdated})  
                 }
             }
         }

     } catch (err) {
         console.log(err)
         res.status(500).send({ status: false, message: err.message });
     }
 }




module.exports={createCart,updateCart}