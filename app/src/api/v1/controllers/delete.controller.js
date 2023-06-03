const { deleteSeller, deleteOutlet, deleteCategory, deleteProduct, deleteVariation, deleteVariant, deleteById, deleteAddOnCategory, bulkTaskFormatter } = require("../helpers/delete.helper");
const { unknownError, success, badRequest } = require("../helpers/response.helper")

exports.deleteData = async (req, res) => {
    try {
        const { sellerId, outletId, categoryId, productId, variationId, variantId ,addOnCategoryId} = req.body
        const { status, message, data } = await deleteById(req.body)
        await bulkTaskFormatter(data)
        // const outletList = await outletsBySellerId(sellerId, "2");
        // let letOutletIdList = outletList.data.map(outlet => outlet.outletId);
        // const productList = await productsByOutletId(letOutletIdList)
        // let letProductIdList = productList.data.map(product => product.productId);
        // const filteredProductList = productList.data.filter(product => product.hasCustomization)
        // let letFilteredProductIdList = filteredProductList.map(product => product.productId);
        // let varitaionData = await Promise.all(letFilteredProductIdList.map(async (productId) => await customizationByProductId(productId)))
        return status ? success(res, message, data) : badRequest(res, message, data)
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}