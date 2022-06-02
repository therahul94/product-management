const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const { default: mongoose } = require('mongoose');
const validator = require('../validators/validation')

const createOrder = async function (req, res) {
    try {
        let { status, cancellable } = req.body
        if (status) {
            const start = ["pending", "completed", "cancaled"].indexOf(status)
            if (start == -1) {
                return res.status(400).send({ status: false, message: "Status can only be pending/completed/cancaled " })
            }
        }

        //Data coming from  form_data only , Condition Apply
        if (cancellable) {
            cancellable = cancellable.toLowerCase()
            const cancle = ["true", "false"].indexOf(cancellable)
            if (cancle == -1) {
                return res.status(400).send({ status: false, message: "Status can only be true/false " })
            }
        }
        if (!mongoose.isValidObjectId(req.params.userId)) {
            return res.status(400).send({ status: false, message: " Please Provide Valid UserId" })

        }
        if (!mongoose.isValidObjectId(req.body.cartId)) {
            return res.status(400).send({ status: false, message: " Please Provide Valid cartId" })
        }

        const user = await userModel.findById(req.params.userId);
        // if(!mongoose.isValidObjectId(req.params.userId))
        if (!user) return res.status(400).send({ status: false, message: "User doesnot exist." });
        console.log(user._id)

        const getCart = await cartModel.findOne({ userId: user._id, _id: req.body.cartId, isDeleted: false });
        if (!getCart) return res.status(400).send({ status: false, message: "Cart doesnot exist." });

        let totalQuantity = 0;
        for (let i = 0; i < (getCart["items"]).length; i++) {
            totalQuantity += getCart.items[i].quantity;
        }

        let order = getCart.toJSON();
        order['totalQuantity'] = totalQuantity;

        const orderDetails = await orderModel.create(order);
        return res.status(201).send({ status: true, message: 'Success', Data: orderDetails });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ status: false, message: " This cart does not belong to the correct user" })
        }
        console.log(error);
        return res.status(500).send({ status: false, message: error.message })
    }

}
const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body

        const { orderId } = requestBody

        //Validations
        if (!validator.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "Please enter orderId" })
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "orderId is invalid" })
        }

        const isUserExists = await userModel.findById(userId)
        if (!isUserExists) {
            return res.status(404).send({ status: false, message: "userData not found" })
        }

        const isOrderExists = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!isOrderExists) {
            return res.status(404).send({ status: false, message: "orderData not found" })
        }
        //If the cancellable is false then order can't be cancelled. 
        if (isOrderExists.cancellable == false) return res.status(400).send({ status: false, message: "This order can't be cancelled" });

        if (isOrderExists.userId != userId) {
            return res.status(400).send({ status: false, message: "order not belongs to the user" })
        }


        const updatedData = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false }, { status: "cancled", isDeleted: true, deletedAt: Date.now() }, { new: true })

        if (!updatedData) {
            return res.status(404).send({ status: false, message: "data not found for update" })
        }


        return res.status(200).send({ status: true, message: "order Cancelled successfully", data: updatedData })
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createOrder, updateOrder };
