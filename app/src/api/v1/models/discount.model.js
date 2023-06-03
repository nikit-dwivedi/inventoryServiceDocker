const mongoose = require("mongoose")
const Schema = mongoose.Schema


const discountSchema = new Schema({
    discountId: {
        type: String,
        unique: true
    },
    customId: {
        type: String
    },
    discountTitle: {
        type: String,
    },
    promoCode: {
        type: String,
        unique: true
    },
    discountPercent: {
        type: Number,
    },
    maxDiscount: {
        type: Number,
    },
    minAmount: {
        type: Number,
    },
    isFlatDiscount: {
        type: Boolean,
        default: false
    },
    isCustom: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
})

const discountModel = mongoose.model("Discount", discountSchema)
module.exports = discountModel