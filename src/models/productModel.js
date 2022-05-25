// const mongoose = require("mongoose")

// const productSchema = new mongoose.Schema({ 
//     title: {type: String, required: true, unique: true},
//     description: {type: String, required: true},
//     price: {type: Number, required: true },  //valid number/decimal
//     currencyId: {type: String, required: true}, //, INR
//     currencyFormat: {type: String, required: true},  // Rupee symbol
//     isFreeShipping: {type: Boolean, default: false},
//     productImage: {type: String, required: true},  // s3 link
//     style: {type: String},
//     availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
//     installments: {number},
//     deletedAt: {Date, when the document is deleted}, 
//     isDeleted: {boolean, default: false},
//     createdAt: {timestamp},
//     updatedAt: {timestamp},
//   }, {timestamp: true});

// module.exports = new mongoose.model('Product', productSchema)