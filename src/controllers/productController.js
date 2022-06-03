const validator = require("../validators/validation");
const config = require("../utils/awsConfig");
const productModel = require("../models/productModel");
const currencySymbol = require("currency-symbol-map");
const { default: mongoose } = require("mongoose");

//creating product by validating all details.
const productCreation = async function (req, res) {
  try {
    let files = req.files;
    let requestBody = req.body;
    let productImage;

    //validating empty req body.
    if (!validator.isRequestBodyEmpty(requestBody)) {
      return res.status(400).send({ status: false, message: "Please provide valid request body" });
    }

    //extract params for request body.
    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = requestBody;

    //validation for the params starts.
    if (!validator.isValid(title)) {
      return res.status(400).send({ status: false, message: "Title is required" });
    }
    title = title.trim();
    // use regex in title
    if (/^[a-zA-Z0-9]+$/.test(title)) {
    }

    //searching title in DB to maintain their uniqueness.
    const istitleAleadyUsed = await productModel.findOne({ title, isDeleted: false });

    // title is already used
    if (istitleAleadyUsed) {
      return res.status(400).send({ status: false, message: `${title} is alraedy in use. Please use another title.` });
    }

    //uploading product image to AWS.
    if (files) {
      if (!(files && files.length > 0)) {
        return res.status(400).send({ status: false, message: "Please provide product image" });
      }

      //   use regex for Image only jpeg, png
      if (!/\.(jpe?g|png)$/i.test(files[0].originalname)) {
        return res.status(400).send({ status: false, message: "product image extention should be .jpg/.png/.jpeg" });
      }
      productImage = await config.uploadFile(files[0]);
    }

    // check description
    if (!validator.isValid(description)) {
      return res.status(400).send({ status: false, message: "Description is required" });
    }

    // check price
    if (!validator.isValid(price)) {
      return res.status(400).send({ status: false, message: "Price is required" });
    }

    if (isNaN(price)) {
      return res.status(400).send({ status: false, message: "Price has to be Number only" });
    }

    // check currencyId
    if (!validator.isValid(currencyId)) {
      return res.status(400).send({ status: false, message: "currencyId is required" });
    }

    // currencyId toUpperCase
    currencyId = currencyId.toUpperCase();
    if (currencyId != "INR") {
      return res.status(400).send({ status: false, message: "currencyId should be INR" });
    }

    // check currencyFormat only INR
    if (!validator.isValid(currencyFormat)) {
      return res.status(400).send({ status: false, message: "currency Format not availeble" });
      // currencyFormat = currencySymbol('INR')
    }
    currencyFormat = currencySymbol("INR"); //used currency symbol package to store INR symbol.

    // check availableSizes
    if (!availableSizes) {
      return res.status(400).send({ status: false, message: "available size field is mandatory" });
    }

    availableSizes = availableSizes.split(",").map((x) => x.trim());
    for (let i = 0; i < availableSizes.length; i++) {
      if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) {
        return res.status(400).send({ status: false, message: "It's required field choose at least one of these ['S','XS','M','X','L','XXL','XL']" });
      }
    }

    if (style) {
      // validate the style
      if (!validator.validString(style)) {
        return res.status(400).send({ status: false, message: "style has to be string." });
      }
    }

    // check installments
    if (installments) {
      if (installments < 0) {
        return res.status(400).send({ status: false, message: "installments can't be a negative number" });
      }

      //   installments only be Number
      if (installments % 1 != 0) {
        return res.status(400).send({ status: false, message: "installments can only be a whole number" });
      }
    }

    // check isFreeShipping
    if (isFreeShipping) {
      isFreeShipping = isFreeShipping.toLowerCase();
      if (!(isFreeShipping != true)) {
        return res.status(400).send({ status: false, message: "isFreeShipping must be a boolean value" });
      }
    }

    productImage = await config.uploadFile(files[0]);

    //object destructuring for response body.
    const newProductData = {
      title,
      description,
      price,
      currencyId,
      currencyFormat: currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
      productImage: productImage,
    };

    console.log(availableSizes.length);
    //validating sizes to take multiple sizes at a single attempt.
    // if (availableSizes) {
    //     // availableSizes = JSON.parse(JSON.stringify(availableSizes));
    //     // console.log(availableSizes)
    //   if (availableSizes.length == 0) {
    //     return res.status(400).send({status: false,message: "AvailableSizes should be required"});
    //   }
    // //   let sizesArray = availableSizes.split(",").map((x) => x.trim());
    //   // let sizesArray = JSON.parse(sizesArray)

    //   for (let i = 0; i < sizesArray.length; i++) {
    //     if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizesArray[i])) {
    //       return res.status(400).send({status: false,message:"AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']"});
    //     }
    //   }

    //   //using array.isArray function to check the value is array or not.
    //   if (Array.isArray(sizesArray)) {
    //     newProductData["availableSizes"] = [...new Set(sizesArray)];
    //   }
    // }

    const saveProductDetails = await productModel.create(newProductData);
    res.status(201).send({ status: true, message: "Successfully saved product details", data: saveProductDetails });

  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, message: err.message });
  }
};
//fetch all products.
const getAllProducts = async function (req, res) {
  try {
    const filterQuery = { isDeleted: false }; //complete object details.
    const queryParams = req.query; //request from query

    // validate the queryParams
    if (Object.keys(queryParams).length === 0) {
      data = await productModel.find({ isDeleted: false }); // data=await productModel.find(filterQuery)
      res.status(200).send({ status: true, msg: "success", data: data });
    }

    if (Object.keys(queryParams).length > 0) {
      // if (validator.isRequestBodyEmpty(queryParams)) {
      //   let { size, name, priceGreaterThan, priceLessThan, priceSort } =queryParams;

      if (validator.isRequestBodyEmpty(queryParams)) {
        const { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams;

        // filterQuery["price"] = {};

        //validation starts.
        if (validator.isValid(size)) {
          filterQuery["availableSizes"] = size;
        }

        //using $regex to match the subString of the names of products & "i" for case insensitive.
        if (validator.isValid(name)) {
          console.log(name);
          filterQuery["title"] = name;
          console.log("hii");
          // filterQuery['title']['$regex'] = name
          // filterQuery['title']['$regex: $options'] = 'i'
        }

        //setting price for ranging the product's price to fetch them.
        // if (priceGreaterThan) {
          //using $regex to match the subString of the names of products & "i" for case insensitive.
          if (validator.isValid(name)) {
            console.log(name);
            filterQuery["title"] = { $regex: name };

            // filterQuery['title']['$regex'] = name
            // filterQuery['title']['$options'] = 'i'
          }
          // console.log("hiiiiiii chal ")

          if (priceGreaterThan || priceLessThan) {
            filterQuery["price"] = {};
          }
          //setting price for ranging the product's price to fetch them.
          if (priceGreaterThan) {
            if (isNaN(Number(priceGreaterThan))) {
              return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` });
            }
            if (priceGreaterThan <= 0) {
              return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` });
            }

            // filterQuery['price'] = {}
            filterQuery["price"]["$gte"] = Number(priceGreaterThan);
          }

          //setting price for ranging the product's price to fetch them.
          if (priceLessThan) {
            if (!!isNaN(Number(priceLessThan))) {
              return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` });
            }
            if (priceLessThan <= 0) {
              return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` });
            }

            filterQuery["price"]["$lte"] = Number(priceLessThan);

            //    if (!filterQuery.hasOwnProperty('price'))
            //         filterQuery['price'] = {}
            //     filterQuery['price']['$lte'] = Number(priceLessThan)
            //         console.log(typeof Number(priceLessThan))
          }

          //sorting the products acc. to prices => 1 for ascending & -1 for descending.
          if (priceSort) {
            if (!(priceSort == 1 || priceSort == -1)) {
              return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` });
            }

            const products = await productModel.find(filterQuery).sort({ price: priceSort });
            console.log(products);

            if (Array.isArray(products) && products.length === 0) {
              return res.status(404).send({ productStatus: false, message: "No Product found" });
            }

            return res.status(200).send({ status: true, message: "Product list", data: products });
          }

          console.log(filterQuery);
          const products = await productModel.find(filterQuery);

          //verifying is it an array and having some data in that array.
          if (Array.isArray(products) && products.length === 0) {
            return res.status(404).send({ productStatus: false, message: "No Product found" });
          }

          res.status(200).send({ status: true, message: "Product list", data3: products });
        // }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
};

//fetch products by Id.
const getProductsById = async function (req, res) {
  try {
    const productId = req.params.productId;

    //validation starts.
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: `${productId} is not a valid product id` });
    }
    //validation ends.

    // find product by id in productModel
    const product = await productModel.findOne({ _id: productId, isDeleted: false });

    // check product
    if (!product) {
      return res.status(404).send({ status: false, message: `product does not exists` });
    }

    res.status(200).send({ status: true, message: "Product found successfully", data: product });

  } catch (err) {
    res.status(500).send({ status: false, message: "Error is : " + err });
  }
};

//Update product details.
const updateProduct = async function (req, res) {
  try {
    const requestBody = req.body;
    const params = req.params;
    const productId = params.productId;

    // Validation stats
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: `${productId} is not a valid product id`, });
    }

    // find product by id in productModel
    const product = await productModel.findOne({ _id: productId, isDeleted: false });

    // check product
    if (!product) {
      return res.status(404).send({ status: false, message: `product not found` });
    }

    // validate the requestBody
    if (!(validator.isRequestBodyEmpty(requestBody) || req.files)) {
      return res.status(400).send({ status: false, message: "No paramateres passed. product unmodified", data: product });
    }

    // Extract params
    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = requestBody;

    //Declaring an empty object then using hasOwnProperty to match the keys and setting the appropriate values.
    const updatedProductDetails = {};
    if(currencyFormat){
      if(currencyFormat !="₹"){
        return res.status(400).send({ status: false, message: `${currencyFormat} is not valid specific indian rupees` });

      }
      updatedProductDetails.currencyFormat=currencyFormat
    }


    if (title) {
      // validate the title
      if (validator.isValid(title)) {

        // find title form productModel
        const isTitleAlreadyUsed = await productModel.findOne({ title: title, isDeleted: false });


        if (!updatedProductDetails.hasOwnProperty("title")) //hasOwnProperty return Boolean value
          updatedProductDetails["title"] = title;
        if (isTitleAlreadyUsed) {
          return res.status(400).send({ status: false, message: `${title} title is already used` });
        }
      }}

      if (description) {
        if (validator.isValid(description)) {
          if (!updatedProductDetails.hasOwnProperty("description"))
            updatedProductDetails["description"] = description;
        }
        console.log("hii449")
      }

      //verifying price is number & must be greater than 0.
      if (price) {
        if (validator.isValid(price)) {
          if (!!isNaN(Number(price))) {
            return res.status(400).send({ status: false, message: `Price should be a valid number` });
          }

          if (price <= 0) {
            return res.status(400).send({ status: false, message: `Price should be a valid number` });
          }

          if (!updatedProductDetails.hasOwnProperty("price"))
            updatedProductDetails["price"] = price;
        }
      }
      //verifying currency Id must be INR.
      if (currencyId) {
        if (validator.isValid(currencyId)) {
          currencyId = currencyId.toUpperCase();
          if (!(currencyId == "INR")) {
            return res.status(400).send({ status: false, message: "currencyId should be a INR" });
          }

          if (!updatedProductDetails.hasOwnProperty("currencyId"))
            updatedProductDetails["currencyId"] = currencyId;

          currencyFormat = currencySymbol("INR");
        }
      }
     
      //shipping must be true/false.
      if (isFreeShipping) {
        if (validator.isValid(isFreeShipping)) {
          isFreeShipping = isFreeShipping.toLowerCase();
          if (!(isFreeShipping === "true" || isFreeShipping === "false")) {
            return res.status(400).send({ status: false, message: "isFreeShipping should be a boolean value" });
          }

          if (!updatedProductDetails.hasOwnProperty("isFreeShipping"))
            updatedProductDetails["isFreeShipping"] = isFreeShipping;
        }
      }

      //uploading images to AWS.
      let productImage = req.files;
      if (productImage && productImage.length > 0) {
        let updatedproductImage = await config.uploadFile(productImage[0]);

        if (!updatedProductDetails.hasOwnProperty("productImage"))
          updatedProductDetails["productImage"] = updatedproductImage;
      }

      if (style) {
        if (validator.isValid(style)) {
          if (!updatedProductDetails.hasOwnProperty("style"))
            updatedProductDetails["style"] = style;
        }
      }

      //validating sizes to take multiple sizes at a single attempt.
      if (availableSizes) {
        let sizesArray = availableSizes.split(",").map((x) => x.trim());

        for (let i = 0; i < sizesArray.length; i++) {
          if (
            !["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizesArray[i])
          ) {
            return res.status(400).send({ status: false, message: "AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']" });
          }
        }
        if (!updatedProductDetails.hasOwnProperty("availableSizes"))
          updatedProductDetails["availableSizes"] = sizesArray;
        // if (!updatedProductDetails.hasOwnProperty(updatedProductDetails, '$addToSet'))
        //     updatedProductDetails['$addToSet'] = {}
        // updatedProductDetails['$addToSet']['availableSizes'] = { $each: sizesArray }
      }

      //verifying must be a valid no. & must be greater than 0.
      if (validator.isValid(installments)) {
        if (!!isNaN(Number(installments))) {
          return res.status(400).send({ status: false, message: `installments should be a valid number` });
        }

        if(installments<0){
          return res.status(400).send({status:false, msg:"installments can only be a whole number"})
        }
        if (installments % 1 != 0) {
          return res.status(400).send({ status: false, message: "installments can only be a whole number" });
        }

        if (!updatedProductDetails.hasOwnProperty("installments"))
          updatedProductDetails["installments"] = installments;
      }
      console.log(updatedProductDetails);

      const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updatedProductDetails, { new: true }).select({ updatedProductDetails: 0, __v: 0 });

      res.status(200).send({status: true,message: "Successfully updated product details.",data: updatedProduct });
    
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, message: "Error is : " + err });
  }
};

//deleting product by the seller side.
const deleteProduct = async function (req, res) {
  try {
    const params = req.params;
    const productId = params.productId;

    //validation starts
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: `${productId} is not a valid product id` });
    }
    //vaidation ends.

    const product = await productModel.findOne({ _id: productId });

    if (!product) {
      return res.status(400).send({ status: false, message: `Product doesn't exists by ${productId}` });
    }
    if (product.isDeleted == false) {
      await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } });

      return res.status(200).send({ status: true, message: `Product deleted successfully.` });
    }
    return res.status(400).send({ status: true, message: `Product has been already deleted.` });
  } catch (err) {
    return res.status(500).send({ status: false, message: "Error is : " + err });
  }
};

module.exports = { productCreation, getAllProducts, getProductsById, updateProduct, deleteProduct };
