const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    outletId: {
        type: String,
        require: true
    },
    categoryId: {
        type: String,
        required: true
    },
    parentCategoryId: {
        type: String,
        default: ""
    },
    categoryName: {
        type: String
    },
    categoryDesc: {
        type: String
    },
    categoryImage: {
        type: String
    },
    hasSubCategory: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true })

categorySchema.plugin(mongoosePaginate);
const categoryModel = mongoose.model("categories", categorySchema);
module.exports = categoryModel;