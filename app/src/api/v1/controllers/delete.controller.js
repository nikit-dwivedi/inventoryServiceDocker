const { deleteSeller, deleteOutlet, deleteCategory, deleteProduct, deleteVariation, deleteVariant, deleteById, deleteAddOnCategory, bulkTaskFormatter } = require("../helpers/delete.helper");
const { unknownError, success, badRequest } = require("../helpers/response.helper")

exports.deleteData = async (req, res) => {
    try {
        const { sellerId, outletId, categoryId, productId, variationId, variantId, addOnCategoryId } = req.body

        const { status, message, data } = await deleteById(req.body)
        console.log(data);
        if (Object.entries(data)[0]) {
            await bulkTaskFormatter(data)
        }
        return status ? success(res, message, data) : badRequest(res,message, data)
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}