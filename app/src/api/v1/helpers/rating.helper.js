const ratingModel = require("../models/rating.model")
const { ratingFormatter, responseFormater } = require("./format.helper")

exports.addRating = async (outletId, bodyData) => {
    try {
        const formattedRating = ratingFormatter(outletId, bodyData)
        const ratingData = new ratingModel(formattedRating);
        await ratingData.save()
        return responseFormater(true, "rating added")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}