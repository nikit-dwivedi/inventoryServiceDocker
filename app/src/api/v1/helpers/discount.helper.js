const discountModel = require("../models/discount.model");
const { responseFormater, discountFormater } = require("./format.helper");

exports.addDiscount = async (customId, discountData) => {
    try {
        const formmatedData = discountFormater(customId, discountData);
        console.log(formmatedData);
        if (!formmatedData.status) {
            return responseFormater(false, formmatedData.message)
        }
        const saveData = new discountModel(formmatedData.data)
        return await saveData.save() ? responseFormater(true, "discount added") : responseFormater(false, "discount not added")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.sellerDiscount = async (customId) => {
    try {
        const discountData = await discountModel.find({ customId }).select('-_id -isActive -__v')
        const defaultData = await discountModel.find({ isCustom: false }).select('-_id -isActive -__v')
        const returnData = [...discountData, ...defaultData]
        return returnData[0] ? responseFormater(true, "discount list", returnData) : responseFormater(false, "discount not added")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.discountByDiscountId = async (discountId) => {
    try {
        const discountData = await discountModel.findOne({ discountId }).select('-_id -isActive -__v')
        return discountData ? responseFormater(true, "discount details", discountData) : responseFormater(false, "no discount found")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}