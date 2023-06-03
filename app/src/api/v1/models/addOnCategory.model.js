const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addOnCategorySchema = new Schema({
    addOnCategoryId: {
        type: String,
        required: true,
        unique: true
    },
    outletId: {
        type: String,
        required: true
    },
    categoryName: {
        type: String
    },
    minSelection: {
        type: Number,
        default: 1
    },
    maxSelection: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

const addOnCategoryModel = mongoose.model("addOnCategory", addOnCategorySchema);
module.exports = addOnCategoryModel;