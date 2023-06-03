const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variantSchema = new Schema({
    productId:{
        type:String
    },
    variationId: {
        type: String,
        required: true
    },
    variantId: {
        type: String,
        unique: true
    },
    variantName: {
        type: String,
    },
    variantPrice: {
        type: Number,
    },
    displayPrice: {
        type: Number,
    },
    hasCustomization: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
})

const variantModel = mongoose.model("variant", variantSchema)
module.exports = variantModel