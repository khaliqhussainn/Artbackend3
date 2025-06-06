const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['customer', 'admin'],
        default: 'customer'
      },
    mobile:{
        type: String
    },
    address:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresses"
    }],
    paymentInformation:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment_information"
    }],
    ratings:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ratings"
    }],
    reviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "reviews"
    }],
    contact:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "contact"
    }],
    createAt:{
        type: Date,
        default:Date.now()
    }

})

const User = mongoose.model("users", userSchema)
module.exports = User