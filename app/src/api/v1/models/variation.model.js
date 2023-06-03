const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const variationSchema = new Schema({
    productId:{
        type:String
    },
    parentId: {
        type: String,
        required: true
    },
    variationId: {
        type: String,
    },
    variationName: {
        type: String
    },
    minSelection: {
        type: Number,
        default: 1
    },
    maxSelection: {
        type: Number,
        default: 1
    },
    required: {
        type: Boolean,
        default: true
    },
}, { timestamps: true })


const variationModel = mongoose.model("variation", variationSchema);
module.exports = variationModel;