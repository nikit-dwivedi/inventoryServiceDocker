const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;


const productSchema = new Schema({
    productId: {
        type: String,
        required: true
    },
    parentCategoryId: {
        type: String,
    },
    outletId: {
        type: String,
    },
    productName: {
        type: String
    },
    productDesc: {
        type: String
    },
    productImage: {
        type: String
    },
    productPrice: {
        type: Number,
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    displayPrice: {
        type: Number
    },
    hasCustomization: {
        type: Boolean,
        default: false
    },
    hasAddOn: {
        type: Boolean,
        default: false
    },
    addOnList: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true })
productSchema.index({ productName: 'text' });
productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model("product", productSchema);
module.exports = productModel;