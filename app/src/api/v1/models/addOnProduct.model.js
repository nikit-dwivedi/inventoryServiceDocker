const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addOnProductSchema = new Schema({
    addOnCategoryId: {
        type: String,
        required: true
    },
    addOnProductId: {
        type: String,
        unique:true
    },
    productName: {
        type: String
    },
    productPrice: {
        type: Number,
    },
})

const addOnProductModel = mongoose.model("addOnProduct", addOnProductSchema);
module.exports = addOnProductModel;