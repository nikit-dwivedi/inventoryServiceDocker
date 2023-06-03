const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testCuisineSchema = new Schema({
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

const testCuisineModel = mongoose.model("testCuisine", testCuisineSchema);
module.exports = testCuisineModel;

