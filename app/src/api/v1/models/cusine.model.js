const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cuisineSchema = new Schema({
    cuisineId: {
        type: String,
    },
    cuisineName: {
        type: String,
    },
    cuisineImage: {
        type: String
    },
    cuisineDescription: {
        type: String
    }
})

const cuisineModel = mongoose.model("cuisine", cuisineSchema);
module.exports = cuisineModel;