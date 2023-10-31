const productModel = require('../models/product.model');
const { randomBytes } = require('node:crypto');
const { getCategoryById, addProductToCategory } = require('./category.helper');
const { customizationFormatter, customItemFormatter, responseFormater, formatProductForAlgolia } = require('./format.helper');
const outletModel = require('../models/outlet.model');
const variationModel = require('../models/variation.model');
const variantModel = require('../models/variant.model');
const { getAddOnTotal } = require('./addOne.helper');
const { addSingleProduct, updateProductOnAlgolia, addProductData } = require('../services/algoila.service');


// ---------------------------------------------------------product---------------------------------------------------------

exports.addProduct = async (bodyData) => {
    try {
        const { parentCategoryId, productName, productPrice, isVeg = true, hasCustomization = false } = bodyData
        let { productImage, productDesc } = bodyData
        const productId = randomBytes(6).toString('hex')
        const outletData = await getCategoryById(parentCategoryId, true)
        if (!outletId) {
            return { status: false, message: "outlet not found" }
        }
        let displayPrice = productPrice
        productImage = productImage ? productImage : ""
        productDesc = productDesc ? productDesc : ""
        let formattedData = {
            productId,
            outletId: outletData.outletId,
            parentCategoryId,
            productName,
            productDesc,
            productImage,
            productPrice,
            displayPrice,
            isVeg,
            hasCustomization,
        }
        const saveProduct = new productModel(formattedData)
        await saveProduct.save()
        formattedData.outletName = outletData.outletName
        formattedData.area =outletData.area
        formattedData.outletImage =outletData.outletImage
        const algoliaFormat = formatProductForAlgolia(formattedData)
        await addSingleProduct(algoliaFormat)
        await addProductToCategory(parentCategoryId)
        return { status: true, message: "product added", data: formattedData.productId }
    } catch (error) {
        console.log(error);
        return { status: false, message: error.message }
    }
}

exports.checkProductByName = async (bodyData, productId) => {
    try {
        let { productName, parentCategoryId } = bodyData
        if (productId) {
            let productData = await productModel.findOne({ productId }).lean()
            parentCategoryId = productData.parentCategoryId

        }
        let productCheck = await productModel.findOne({ productName, parentCategoryId })

        return productCheck && productCheck.productId != productId ? true : false
    } catch (error) {
        return false
    }
}

exports.editProductByProductId = async (productId, bodyData) => {
    try {
        let { productName, productDesc, productImage, productPrice, isVeg } = bodyData
        const productData = await productModel.findOne({ productId })
        if (!productData) {
            return { status: false, message: "product not found", data: {} }
        }
        if (!isVeg) {
            isVeg = productData.isVeg
        }
        let displayPrice = !productData.hasCustomization ? productPrice : productData.displayPrice
        if (!productData.hasCustomization) {
            displayPrice = productPrice
        }
        const formattedData = {
            productName,
            productDesc,
            productImage,
            productPrice,
            displayPrice,
            isVeg,
        }
        await productModel.findOneAndUpdate({ productId }, formattedData)
        const algoliaFormat = formatProductForAlgolia({ productId, ...formattedData })
        await updateProductOnAlgolia(algoliaFormat)
        return { status: true, message: "product added", data: {} }
    } catch (error) {
        console.log(error);
        return { status: false, message: error.message, data: {} }
    }
}


exports.allProductOfCategory = async (parentCategoryId) => {
    try {
        // const options = {
        //     page: 1,
        //     limit: 10,
        //     sort: { createdAt: -1 },
        // };
        // const data = await productModel.paginate({parentCategoryId, isActive: true }, options);
        const productData = await productModel.find({ parentCategoryId, isActive: true, inStock: true }).select('-_id productId productName inStock productDesc productImage productPrice displayPrice hasCustomization hasAddOn isVeg')
        return productData
    } catch (error) {
        return false
    }
}

exports.productById = async (productId) => {
    try {
        const productData = await productModel.findOne({ productId }).select('-_id -__v -customization._id -customization.customItem._id -customization.createdAt -customization.updatedAt -createdAt -updatedAt -isActive')
        return productData ? responseFormater(true, "Product details", productData) : responseFormater(false, "product not found")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.changeStockStatus = async (productId) => {
    try {
        const productData = await productModel.findOne({ productId })
        if (!productData) {
            return { status: false, message: "product not found", data: {} }
        }
        productData.inStock = !productData.inStock
        await productData.save()
        return { status: true, message: "Stock updated", data: {} }
    } catch (error) {
        return { status: false, message: error.message, data: {} }
    }
}

exports.getOutOfStockProduct = async (outletId) => {
    try {
        const productData = await productModel.find({ outletId, inStock: false })
        return productData[0] ? { status: true, message: "out of stock product list", data: productData } : { status: false, message: "no product found", data: {} }
    } catch (error) {
        return { status: false, message: error.message, data: {} }
    }
}

exports.productSearch = async (searchText, outletList) => {
    try {
        const outletMap = new Map(outletList.map(doc => [doc._id, doc.data]));
        const idList = Array.from(outletMap.keys())
        // const searchResult = await productModel.find({ outletId: { $in: idList }, productName: { $regex: searchText, $options: 'i' } }).select('-_id productId outletId productName productImage isVeg inStock')
        const searchResult = await productModel.aggregate([
            {
                "$addFields": {
                    "productNameWithoutSpaces":
                    {
                        "$reduce": {
                            "input": { "$split": ["$productName", " "] },
                            "initialValue": "",
                            "in": {
                                "$concat": [
                                    "$$value",
                                    { "$cond": [{ "$eq": ["$$value", ""] }, "", ""] },
                                    "$$this"
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    productNameWithoutSpaces: { $regex: searchText.replace(/\s+/g, ''), $options: 'i' },
                    outletId: { $in: idList },
                    inStock: true
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "productId": 1,
                    "outletId": 1,
                    "productName": 1,
                    "productImage": 1,
                    "isVeg": 1,
                    "inStock": 1
                }
            }
        ])
        searchResult.map((product) => {
            const outletData = outletMap.get(product.outletId);
            product.outletDetail = outletData
            product.type = 'product'
            return product
        })
        return searchResult
    } catch (error) {
        console.log(error);
        return false
    }
}

exports.productsByOutletId = async (outletIdList) => {
    try {
        const productData = await productModel.find({ outletId: { $in: outletIdList } })
        return productData[0] ? { status: true, message: "out of stock product list", data: productData } : { status: false, message: "no product found", data: {} }
    } catch (error) {
        return { status: false, message: error.message, data: {} }
    }
}

exports.batchUploadProductToAlgolia = async () => {
    try {
        const productList = await productModel.aggregate(
            [{
                $match: {
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: 'outlets',
                    localField: 'outletId',
                    foreignField: 'outletId',
                    as: 'outletDetails'
                }
            },
            { $unwind: '$outletDetails' },
            {
                $addFields: {
                    outletName: '$outletDetails.outletName',
                    area:'$outletDetails.area',
                    outletImage:'$outletDetails.outletImage'
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: 1,
                    outletId: 1,
                    productName: 1,
                    productDesc: 1,
                    productImage: 1,
                    productPrice: 1,
                    isVeg: 1,
                    inStock: 1,
                    outletName: 1,
                    area:1,
                    outletImage:1
                }
            }
        ],
        );
        const formattedData = productList.map((product) => formatProductForAlgolia(product))
        const pushData = await addProductData(formattedData)
        return responseFormater(true, "data added", pushData)
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

// ---------------------------------------------------------variation---------------------------------------------------------

exports.addCustomizationByProductId = async (productId, customizationData) => {
    try {
        const productCheck = await productModel.findOne({ productId }).lean()
        customizationData.productId = productId
        if (!productCheck) {
            const itemCheck = await variantModel.findOne({ variantId: productId }).lean()
            customizationData.productId = itemCheck.productId
            if (!itemCheck) {
                return { status: false, message: "no product found", data: {} }
            }
        }
        let parentId = productId
        const customizationCheck = await variationModel.findOne({ parentId })
        if (customizationCheck) {
            return { status: false, message: "Max 1 variation can be added to product", data: {} }
        }
        const { status, message, data } = customizationFormatter(parentId, customizationData)
        if (!status) {
            return { status, message, data }
        }
        const saveData = new variationModel(data)
        await saveData.save()
        if (productCheck) {
            await productModel.findOneAndUpdate({ productId }, { hasCustomization: true })
        } else {
            await variantModel.findOneAndUpdate({ variantId: productId }, { hasCustomization: true })
        }
        return { status: true, message: "customization added", data: data.variationId }
    } catch (error) {
        console.log(error);
        return { status: false, message: error.message, data: {} }
    }

}

exports.customizationByProductId = async (productId) => {
    try {
        const variationData = await variationModel.findOne({ parentId: productId }).select("-_id variationId variationName minSelection maxSelection")
        const variantData = await variantModel.find({ variationId: variationData.variationId }).select("-_id variantId variantName displayPrice hasCustomization")
        const completeVariation = await Promise.all(variantData.map(async (variant) => {
            if (variant.hasCustomization) {
                variant._doc.variantDetail = await this.customizationByProductId(variant.variantId)
            }
            return variant
        }))
        variationData._doc.variantList = completeVariation
        return variationData
    } catch (error) {
        console.log(error);
        return false
    }
}

exports.customizationListByProductId = async (productId) => {
    try {
        const variationData = await variationModel.findOne({ parentId: productId }).select("-_id variationId variationName minSelection maxSelection")
        const variantData = await variantModel.find({ variationId: variationData.variationId }).select("-_id variantId variantName displayPrice hasCustomization")
        const completeVariation = await Promise.all(variantData.map(async (variant) => {
            if (variant.hasCustomization) {
                variant._doc.variantDetail = await this.customizationByProductId(variant.variantId)
            }
            return variant
        }))
        variationData._doc.variantList = completeVariation
        return variationData
    } catch (error) {
        console.log(error);
        return false
    }
}


exports.productByLastVariation = async (productId, previousData) => {
    try {
        let productData = await productModel.findOne({ productId, inStock: true }).select("-_id productId outletId productName productImage productPrice isVeg displayPrice hasCustomization hasAddOn")
        if (productData) {
            if (previousData) {
                productData._doc.variationDetail = previousData
                productData.hasCustomization = true
            } else {
                productData.hasCustomization = false
            }
            return productData
        }
        let variantData = await variantModel.findOne({ variantId: productId }).select("-_id variationId variantId variantName variantPrice displayPrice hasCustomization")
        if (!variantData) {
            return false
        }
        variantData._doc.variationDetail = previousData
        let variationData = await variationModel.findOne({ variationId: variantData.variationId }).select("-_id parentId variationId variationName minSelection maxSelection required")
        const completeData = await this.productByLastVariation(variationData.parentId, variantData)
        return completeData
    } catch (error) {
        console.log(error);
        return false
    }
}

exports.customizationByCustomizationId = async (customizationId) => {
    try {
        const productData = await productModel.findOne({ 'customization.customizationId': customizationId }).select('-_id productId customization.customizationId customization.customizationName customization.multipleSelection customization.noOfSelection customization.isRequired customization.customItem.customItemId customization.customItem.customItemName customization.customItem.customItemPrice customization.customItem.isDefault')
        if (!productData) {
            return false
        }
        let { customization } = productData
        let [mainData] = customization.filter(data => data.customizationId == customizationId)
        mainData._doc.productId = productData.productId
        return mainData
    } catch (error) {
        console.log(error);
        return false
    }
}
exports.editCustomizationByProductId = async (variationId, changeData) => {
    try {
        const { variationName, minSelection, maxSelection, required } = changeData
        const query = {}
        if (variationName) {
            let newQuery = { variationName }
            Object.assign(query, newQuery)
        }
        if (minSelection !== undefined) {
            let newQuery = { minSelection }
            Object.assign(query, newQuery)
        }
        if (maxSelection) {
            let newQuery = { maxSelection }
            Object.assign(query, newQuery)
        }
        if (required !== undefined) {
            let newQuery = { required }
            Object.assign(query, newQuery)
        }
        await variationModel.findOneAndUpdate({ variationId }, query)
        return { status: true, message: "item updated", data: {} }
    } catch (error) {
        console.log(error);
        return { status: false, message: error.message, data: {} }
    }
}

// ---------------------------------------------------------variant---------------------------------------------------------

exports.addCustomItemBycustomizationId = async (variationId, customItemData) => {
    try {
        const productCheck = await variationModel.findOne({ variationId }).lean()
        if (!productCheck) {
            return { status: false, message: "no  variation found", data: {} }
        }
        customItemData.productId = productCheck.productId
        const { status, message, data } = customItemFormatter(variationId, customItemData)
        if (!status) {
            return { status, message, data }
        }
        let variantData = new variantModel(data)
        await variantData.save()
        return { status: true, message: "Variant added", data: data.variantId }
    } catch (error) {
        return { status: false, message: error.message, data: {} }
    }

}


exports.editCustomItemByCustomItemId = async (variantId, changeData) => {
    try {
        const { variantName, variantPrice, isAvailable, isDefault } = changeData
        const query = {}
        if (variantName) {
            let newQuery = { variantName }
            Object.assign(query, newQuery)
        }
        if (variantPrice) {
            let newQuery = { variantPrice, displayPrice: variantPrice }
            Object.assign(query, newQuery)
        }
        if (isAvailable !== undefined) {
            let newQuery = { isAvailable }
            Object.assign(query, newQuery)
        }
        if (isDefault !== undefined) {
            let newQuery = { isDefault }
            Object.assign(query, newQuery)
        }
        await variantModel.findOneAndUpdate({ variantId }, query)
        return { status: true, message: "item updated", data: {} }
    } catch (error) {
        console.log(error);
        return { status: false, message: error.message, data: {} }
    }
}

exports.customItemByCustomId = async (variantId) => {
    try {
        const customItemData = await variantModel.findOne({ variantId }).select("-_id  -__v")
        return customItemData ? { status: true, message: "custom item data", data: customItemData } : { status: false, message: "no custom item found", data: {} }
    } catch (error) {
        console.log(error);
        return { status: false, message: error.message, data: {} }
    }
}

exports.filterCustomItem = (customizationList, customItemIdList, displayPrice) => {
    try {
        let filteredList = []
        productAmount = displayPrice
        const customItemIdSet = new Set(customItemIdList);
        for (const customization of customizationList) {
            for (const customItem of customization.customItem) {
                if (customItemIdSet.has(customItem.customItemId)) {
                    productAmount += customItem.customItemPrice;
                    filteredList.push({
                        ...customItem,
                        _doc: { ...customItem._doc, _id: undefined }
                    });
                }
            }
        }
        return { filteredList, productAmount }
    } catch (error) {
        console.log(error);
        return false
    }
}

// ---------------------------------------------------------addOn---------------------------------------------------------

exports.addRemoveAddOnToProduct = async (productId, addOnCategoryId, operation) => {
    try {
        const productInfo = await productModel.findOne({ productId })
        if (!productInfo) {
            return responseFormater(false, "product not found")
        }
        let query = ""
        let message = "addOn added to product"
        if (operation) {
            query = { $push: { addOnList: addOnCategoryId } }
            if (!productInfo.hasAddOn) {
                query = { $push: { addOnList: addOnCategoryId }, hasAddOn: true }
            }
        } else {
            query = { $pull: { addOnList: addOnCategoryId } }
            message = "addOn removed from product"
            if (productInfo.addOnList.length === 1) {
                query = { $pull: { addOnList: addOnCategoryId }, hasAddOn: false }
            }
        }
        await productModel.findOneAndUpdate({ productId }, query, { new: true })
        return responseFormater(true, message)
    } catch (error) {
        return responseFormater(false, error.message);
    }
}

