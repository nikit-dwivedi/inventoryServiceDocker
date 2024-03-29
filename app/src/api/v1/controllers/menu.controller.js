const { addAddonCategory, addAddonProduct, getAllAddOnOfOutlet, getAddonCategoryByCategoryId, getAddOnTotal, getAllAddOnProductOfCategory, editAddonCategory, editAddonProduct } = require("../helpers/addOne.helper");
const { addCategory, getAllCategoryOfOutlet, getAllSubCategory, getOnlyCategoryOfOutlet, getSubCategoryOfOutlet, getProductOfCategory, editCategoryById, categoryByCategoryName, getAllCategoryOfOutletWithoutPagination, getFullItemOfCategory } = require("../helpers/category.helper");
const { menuFormater } = require("../helpers/menu.helper");
const { cartInit, outletByOutletId } = require("../helpers/outlet.helper");
const { addProduct, allProductOfCategory, productById, customizationByProductId, customItemBycostomItemId, filterCustomItem, addCustomizationByProductId, editCustomizationByProductId, addCustomItemBycustomizationId, editCustomItemByCustomItemId, changeStockStatus, getOutOfStockProduct, customItemByCustomId, customizationByCustomizationId, productByLastVariation, addRemoveAddOnToProduct, editProductByProductId, checkProductByName, batchUploadProductToAlgolia } = require("../helpers/product.helper");
const { success, badRequest, unknownError } = require("../helpers/response.helper");
const { parseJwt } = require("../middleware/authToken");
const { searchProduct } = require("../services/algoila.service");
const { imageUpload } = require("../services/image.service");

exports.getMenu = async (req, res) => {
    try {
        const { outletId } = req.params
        const { productId, page } = req.query
        // console.log("token ===>", req.headers.authorization);
        // const token = parseJwt(req.headers.authorization)
        if (isNaN(parseInt(page)) || parseInt(page) === 0) {
            return badRequest(res, "page parameter must be a number and greater than 0")
        }
        let categoryData = await getAllCategoryOfOutlet(outletId, page)
        let menu = await menuFormater(categoryData.docs, productId,)
        let data = {
            itemCount: categoryData.totalDocs,
            totalPage: categoryData.totalPages,
            currentPage: categoryData.page,
            prevPage: categoryData.prevPage,
            nextPage: categoryData.nextPage,
            menu: menu
        }
        return categoryData ? success(res, "success", data) : badRequest(res, "menu not found");
    } catch (error) {
        console.log(error.message);
        unknownError(res, error.message)
    }
}

exports.getFullMenu = async (req, res) => {
    try {
        const { outletId } = req.params
        // console.log("token ===>", req.headers.authorization);
        // const token = parseJwt(req.headers.authorization)
        let categoryData = await getAllCategoryOfOutletWithoutPagination(outletId)
        let menu = await menuFormater(categoryData)
        return categoryData ? success(res, "success", menu) : badRequest(res, "menu not found");
    } catch (error) {
        console.log(error.message);
        unknownError(res, error.message)
    }
}

// -------------------------------------------------category-------------------------------------------------

exports.getCategory = async (req, res) => {
    try {
        const { outletId } = req.params
        const { type } = req.query
        let categoryData = await getOnlyCategoryOfOutlet(outletId,type)
        return categoryData ? success(res, "success", categoryData) : badRequest(res, "no category found");
    } catch (error) {
        return unknownError(res, error)
    }
}
exports.getSubCategory = async (req, res) => {
    try {
        const { parentCategoryId } = req.params
        let categoryData = await getSubCategoryOfOutlet(parentCategoryId)
        return categoryData ? success(res, "success", categoryData) : badRequest(res, "no sub-category found");
    } catch (error) {
        return unknownError(res, error)
    }
}
exports.getAllItemOfCategory = async (req, res) => {
    try {
        const { parentCategoryId } = req.params
        let categoryData = await getFullItemOfCategory(parentCategoryId)
        return categoryData ? success(res, "success", categoryData) : badRequest(res, "no sub-category found");
    } catch (error) {
        return unknownError(res, error)
    }
}
exports.addNewCategory = async (req, res) => {
    try {
        const categoryCheck = await categoryByCategoryName(req.body)
        if (categoryCheck) {
            return badRequest(res, "category already exist")
        }
        const saveCategory = await addCategory(req.body);
        return saveCategory ? success(res, "category added", saveCategory) : badRequest(res, "please provide proper fields");
    } catch (error) {
        unknownError(res, error.message)
    }
}
exports.editCategory = async (req, res) => {
    try {
        const { categoryId, categoryName, displayIndex } = req.body
        if (categoryName && displayIndex) {
            return badRequest(res, "displayIndex cant be changed while updating any other field")
        }
        const categoryCheck = await categoryByCategoryName(req.body)
        if (categoryCheck) {
            return badRequest(res, "category already exist")
        }
        const { status, message } = await editCategoryById(categoryId, categoryName, displayIndex);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// -------------------------------------------------product-------------------------------------------------

exports.addNewProduct = async (req, res) => {
    try {
        if (req.file) {
            req.body.productImage = await imageUpload(req.file)
        }
        const productCheck = await checkProductByName(req.body)
        if (productCheck) {
            return badRequest(res, "product already exist")
        }
        const { status, message, data } = await addProduct(req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        unknownError(res, error.message)
    }
}

exports.getProduct = async (req, res) => {
    try {
        const { productId } = req.params
        const { status, message, data } = await productById(productId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        unknownError(res, error.message)
    }
}

exports.editProduct = async (req, res) => {
    try {
        const { productId } = req.params
        if (req.file) {
            req.body.productImage = await imageUpload(req.file)
        }
        const productCheck = await checkProductByName(req.body, productId)
        if (productCheck) {
            return badRequest(res, "product already exist")
        }
        const { status, message } = await editProductByProductId(productId, req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        unknownError(res, error.message)
    }
}

exports.stockChange = async (req, res) => {
    try {
        const { productId } = req.params
        const { status, message } = await changeStockStatus(productId);
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.outOfStockProduct = async (req, res) => {
    try {
        const { outletId } = req.body
        const { status, message, data } = await getOutOfStockProduct(outletId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getProductByCategory = async (req, res) => {
    try {
        const { parentCategoryId } = req.params
        const token = parseJwt(req.headers.authorization)
        const productData = await allProductOfCategory(parentCategoryId);

        return productData ? success(res, "product list", productData) : badRequest(res, "no product found")
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.linkUnlinkAddOn = async (req, res) => {
    try {
        const { productId, addOnCategoryId, operation } = req.body
        console.log(productId, addOnCategoryId, typeof operation);
        const { status, message } = await addRemoveAddOnToProduct(productId, addOnCategoryId, operation)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.addToSearch = async (req, res) => {
    try {
        const { status, message, data } = await batchUploadProductToAlgolia()
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getSearchData = async (req, res) => {
    try {
        console.log("searchResult");
        const searchResult = await searchProduct(req.query.name)
        return searchResult ? success(res, "search result", searchResult) : badRequest(res, "nothing found")
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}
// -------------------------------------------------variation-------------------------------------------------

exports.addCustomization = async (req, res) => {
    try {
        const { productId } = req.body
        const { status, message, data } = await addCustomizationByProductId(productId, req.body)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {

    }
}

exports.getCustomization = async (req, res) => {
    try {
        const { productId } = req.params
        const productData = await customizationByProductId(productId);
        return productData ? success(res, "customization list", productData) : badRequest(res, "no customization")
    } catch (error) {
        unknownError(res, error.message)
    }
}

exports.getCustomizationReverse = async (req, res) => {
    try {
        const { productId, addOnList } = req.body
        const productData = await productByLastVariation(productId);
        if (!productData) {
            return badRequest(res, "no product found")
        }
        const outletData = await outletByOutletId(productData.outletId)
        productData._doc.outletName = outletData.data.outletName
        productData._doc.outletLongitude = outletData.data.longitude
        productData._doc.outletLatitude = outletData.data.latitude
        productData._doc.isDiscounted = outletData.data.isDiscounted
        productData._doc.discountDetails = outletData.data.discountDetails
        productData._doc.addOnName = ""
        productData._doc.addOnPrice = 0
        if (addOnList && addOnList[0]) {
            const addOnData = await getAddOnTotal(addOnList)
            productData._doc.addOnName = addOnData.name
            productData._doc.addOnPrice = addOnData.price
        } else {
            productData.hasAddOn = false
        }
        return productData ? success(res, "customization list", productData) : badRequest(res, "no customization")
    } catch (error) {
        console.log(error);
        unknownError(res, error.message)
    }
}

exports.getCustomizationDetail = async (req, res) => {
    try {
        const { customizationId } = req.params
        const productData = await customizationByCustomizationId(customizationId);
        return productData ? success(res, "customization detail", productData) : badRequest(res, "no customization")
    } catch (error) {
        unknownError(res, error.message)
    }
}

exports.editCustomization = async (req, res) => {
    try {
        const { variationId } = req.params
        const { status, message } = await editCustomizationByProductId(variationId, req.body);
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error.message)
    }
}

// -------------------------------------------------variant-------------------------------------------------

exports.addCustomItem = async (req, res) => {
    try {
        const { variationId } = req.body
        const { status, message, data } = await addCustomItemBycustomizationId(variationId, req.body)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error.message)
    }
}

exports.editCustomItem = async (req, res) => {
    try {
        const { variantId } = req.body
        const { status, message } = await editCustomItemByCustomItemId(variantId, req.body);
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {

        unknownError(res, error.message)
    }
}

exports.getCustomItemByItemId = async (req, res) => {
    try {
        const { variantId } = req.params
        const { status, message, data } = await customItemByCustomId(variantId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {

        unknownError(res, error.message)
    }
}

exports.getCustomItem = async (req, res) => {
    try {
        const { productId } = req.params
        const { customItemIdList } = req.body
        let { status, message, data: productData } = await productById(productId);
        console.log(productData);
        if (!customItemIdList || customItemIdList[0].replaceAll(" ", "") == "" || !customItemIdList[0]) {
            productData._doc.customization = []
            productData._doc.hasCustomization = false
        }
        console.log(productData);
        let { filteredList, productAmount } = filterCustomItem(productData.customization, customItemIdList, productData.displayPrice)
        productData._doc.customization = filteredList
        productData._doc.productAmount = productAmount
        return status ? success(res, message, { productList: productData }) : badRequest(res, message)
    } catch (error) {
        console.log(error);
        unknownError(res, error.message)
    }
}


// -------------------------------------------------addOn-------------------------------------------------

exports.addNewAddOnCategory = async (req, res) => {
    try {
        const { outletId } = req.body
        const outletCheck = await outletByOutletId(outletId)
        if (!outletCheck.status) {
            return badRequest(res, outletCheck.message)
        }
        const { status, message, data } = await addAddonCategory(req.body)
        return status ? success(res, message, data) : badRequest(res, message, data)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.editAddOnCategoryDetails = async (req, res) => {
    try {
        const { addOnCategoryId } = req.body
        const { status, message, data } = await editAddonCategory(addOnCategoryId, req.body)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.addNewAddOnProduct = async (req, res) => {
    try {
        const { status, message, data } = await addAddonProduct(req.body)
        return status ? success(res, message, data) : badRequest(res, message, data)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.editAddOnProductDetails = async (req, res) => {
    try {
        const { addOnProductId } = req.body
        const { status, message } = await editAddonProduct(addOnProductId, req.body)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getOutletAddon = async (req, res) => {
    try {
        const { outletId } = req.params
        const { status, message, data } = await getAllAddOnOfOutlet(outletId)
        return status ? success(res, message, data) : badRequest(res, message, data)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getProductAddon = async (req, res) => {
    try {
        const { productId } = req.params
        const { status, message, data } = await productById(productId)
        if (!status) {
            return badRequest(res, message)
        }
        let categoryList = await Promise.all(data.addOnList.map(async (addOnId) => {
            let addOnDetail = await getAddonCategoryByCategoryId(addOnId)
            if (addOnDetail.status) {
                return addOnDetail.data
            }
        }))
        return categoryList[0] ? success(res, "addon list", categoryList) : badRequest(res, "no addon found")
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getAddonList = async (req, res) => {
    try {
        const { addOnCategoryId } = req.params
        let addOnDetail = await getAllAddOnProductOfCategory(addOnCategoryId)
        return addOnDetail[0] ? success(res, "addon list", addOnDetail) : badRequest(res, "no addon found")
    } catch (error) {
        return unknownError(res, error.message)
    }
}

