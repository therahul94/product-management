const express = require("express");
const router = express.Router();
const mid=require("../middleware/auth")
const { createUser, login ,getUserDetails,updatedUserProfile} = require("../controllers/userController");
const {productCreation,getAllProducts,getProductsById,updateProduct,deleteProduct}= require("../controllers/productController");
const { route } = require("express/lib/application");
const {createCart,updateCart}=require("../controllers/cartController")

//User Api's
router.post("/register", createUser);
router.post("/login", login);
router.get("/user/:userId/profile",mid.authentication,mid.authorization,getUserDetails)
router.put("/user/:userId/profile",mid.authentication,mid.authorization,updatedUserProfile)

//Product Api's
router.post("/products",productCreation)
router.get("/products",getAllProducts)
router.get("/products/:productId",getProductsById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProduct)

// Cart API's
router.post("/users/:userId/cart",createCart)
router.put("/users/:userId/cart",updateCart)


module.exports = router;
