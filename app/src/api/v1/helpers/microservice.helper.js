const { post } = require("../services/axios.service");
const { rateOrder } = require("../services/url.service");



exports.changeRatingInOrder = async (orderId, ratingStatus) => {
    try {
        const url = rateOrder()
        const bodyData = { orderId, ratingStatus }
        const response = await post(url, bodyData)
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}