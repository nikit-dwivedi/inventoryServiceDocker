const { outletSearch } = require("../helpers/outlet.helper")
const { productSearch } = require("../helpers/product.helper")
const { success, badRequest, unknownError } = require("../helpers/response.helper")

exports.overAllSearch = async (req, res) => {
    try {
        const { search } = req.params
        const { longitude, latitude } = req.query
        const { searchResult, nearByActiveOutletList } = await outletSearch(search, longitude, latitude)
        const productResult = await productSearch(search, nearByActiveOutletList)
        let mixedResult = [...productResult, ...searchResult]
        return productResult[0] || searchResult[0] ? success(res, "search result", mixedResult) : badRequest(res, "no result found")
    } catch (error) {
        return unknownError(res, error.message)
    }
}