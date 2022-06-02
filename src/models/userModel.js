const { mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({

    fname: {type: String, required: true, trim: true},
    lname: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, trim: true},
    profileImage: {type: String, required: true, trim: true}, // s3 link
    phone: {type: String, required: true, unique: true}, // , valid Indian mobile number 
    password: {type: String, required: true, trim: true}, // encrypted password
    address: {
        type: Object,
        shipping: {
            street: {type: String, required: true},
            city: {type: String, required: true},
            pincode: {type: Number, required: true}
        },
        billing: {
            street: {type: String, required: true},
            city: {type: String, required: true},
            pincode: {type: Number, required: true}
        }
    }

}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);// users