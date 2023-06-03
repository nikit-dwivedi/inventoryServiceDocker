const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    bannerId: {
        type: String
    },
    type: {
        type: String
    },
    tag: {
        type: String
    },
    url: {
        type: String
    },
    redirect: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

exports.bannerModel = mongoose.model("banner", bannerSchema)