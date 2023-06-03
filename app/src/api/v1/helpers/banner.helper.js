const { bannerModel } = require("../models/banner.model")
const { bannerFormatter, responseFormater } = require("./format.helper")

exports.addBanner = async (bannerData, linkedId) => {
    try {
        const formattedData = bannerFormatter(bannerData, linkedId)
        const saveData = new bannerModel(formattedData)
        await saveData.save()
        return responseFormater(true, "banner added")
    } catch (error) {
        return responseFormater(true, error.message)
    }
}
exports.getAllBanner = async () => {
    try {
        const bannerList = await bannerModel.find({ isActive: true }).select("-_id -isActive -__v")
        return bannerList[0] ? responseFormater(true, "banner list", bannerList) : responseFormater(false, "no banner found", [])
    } catch (error) {
        return responseFormater(true, error.message)
    }
}