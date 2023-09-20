const outletModel = require("../models/outlet.model");
const categoryModel = require("../models/category.model");
const productModel = require("../models/product.model");
const variantModel = require("../models/variant.model");
const variationModel = require("../models/variation.model");
const addOnCategoryModel = require("../models/addOnCategory.model");
const addOnProductModel = require("../models/addOnProduct.model");
const data = require("./cus.json");
const { responseFormater } = require("./format.helper");
const discountModel = require("../models/discount.model");


exports.deleteById = async (bodyData) => {
    try {
        const { sellerId, outletId, categoryId, productId, variationId, variantId, addOnCategoryId, addOnProductId, discountId, ...garbage } = bodyData
        // validation creation
        const sellerIdCondition = (sellerId && (outletId != undefined || categoryId != undefined || productId != undefined || variationId != undefined || variantId != undefined || addOnCategoryId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const outletCondition = (outletId && (sellerId != undefined || categoryId != undefined || productId != undefined || variationId != undefined || variantId != undefined || addOnCategoryId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const categoryCondition = (categoryId && (outletId != undefined || sellerId != undefined || productId != undefined || variationId != undefined || variantId != undefined || addOnCategoryId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const productCondition = (productId && (outletId != undefined || categoryId != undefined || sellerId != undefined || variationId != undefined || variantId != undefined || addOnCategoryId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const variationCondition = (variationId && (outletId != undefined || categoryId != undefined || productId != undefined || sellerId != undefined || variantId != undefined || addOnCategoryId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const variantCondition = (variantId && (outletId != undefined || categoryId != undefined || productId != undefined || variationId != undefined || sellerId != undefined || addOnCategoryId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const addOnCategoryCondition = (addOnCategoryId && (outletId != undefined || categoryId != undefined || productId != undefined || variationId != undefined || sellerId != undefined || variantId != undefined || addOnProductId != undefined || discountId != undefined)) ? true : false
        const addOnProductCondition = (addOnProductId && (outletId != undefined || categoryId != undefined || productId != undefined || variationId != undefined || sellerId != undefined || addOnCategoryId != undefined || variantId != undefined || discountId != undefined)) ? true : false
        const discountCondition = (discountId && (outletId != undefined || categoryId != undefined || productId != undefined || variationId != undefined || sellerId != undefined || addOnCategoryId != undefined || variantId != undefined || addOnProductId != undefined)) ? true : false
        const garbageCondition = Object.entries(garbage)[0] ? true : false

        // validate Body
        if (sellerIdCondition || outletCondition || categoryCondition || productCondition || variationCondition || variantCondition || addOnCategoryCondition || addOnProductCondition || discountCondition || garbageCondition) {
            return responseFormater(false, "Please send only one type of Id ad a time")
        }


        if (sellerId) {
            return await this.deleteSeller(sellerId)
        }
        if (outletId) {
            return await this.deleteOutlet(outletId)
        }
        if (categoryId) {
            return await this.deleteCategory(categoryId)
        }
        if (productId) {
            return await this.deleteProduct(productId)
        }
        if (variationId) {
            await this.removeCustomizationFromProduct(variationId)
            return await this.deleteVariation(variationId)
        }
        if (variantId) {
            return await this.deleteVariant(variantId)
        }
        if (addOnCategoryId) {
            return await this.deleteAddOnCategory(addOnCategoryId)
        }
        if (addOnProductId) {
            return await this.deleteAddOnProduct(addOnProductId)
        }
        if (discountId) {
            return await this.deleteDiscount(discountId)
        }
        return responseFormater(true, "done", outletList)


    } catch (error) {
        console.log(error);
        return responseFormater(res, error.message)
    }
}

exports.deleteSeller = async (sellerId) => {
    try {
        let outletData = await outletModel.aggregate([
            {
                $match: {
                    sellerId
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "outletId",
                    foreignField: "outletId",
                    as: "categories"
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "outletId",
                    foreignField: "outletId",
                    as: "products"
                },
            },
            {
                $lookup: {
                    from: "addoncategories",
                    localField: "outletId",
                    foreignField: "outletId",
                    as: "addOnCategory"
                },
            },
            {
                $lookup: {
                    from: "discounts",
                    localField: "sellerId",
                    foreignField: "customId",
                    as: "discounts"
                },
            },
            {
                $group: {
                    _id: "$sellerId",
                    sellerId: { $first: "$sellerId" },
                    outletList: { $push: "$outletId" },
                    categoryData: { $push: "$categories.categoryId" },
                    productData: { $push: "$products.productId" },
                    addOnCategoryData: { $push: "$addOnCategory.addOnCategoryId" },
                    discountData: { $push: "$discounts.discountId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryData: { $push: { $reduce: { input: "$categoryData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    productData: { $addToSet: { $reduce: { input: "$productData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    addOnCategoryData: { $addToSet: { $reduce: { input: "$addOnCategoryData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    discountData: { $addToSet: { $reduce: { input: "$discountData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    categoryList: { $arrayElemAt: ["$categoryData", 0] },
                    productList: { $arrayElemAt: ["$productData", 0] },
                    discountList: { $arrayElemAt: ["$discountData", 0] },
                    addOnCategoryList: { $arrayElemAt: ["$addOnCategoryData", 0] },
                }
            },
            {
                $lookup: {
                    from: "variations",
                    localField: "productList",
                    foreignField: "productId",
                    as: "variations"
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "productList",
                    foreignField: "productId",
                    as: "variants"
                }
            },
            {
                $lookup: {
                    from: "addonproducts",
                    localField: "addOnCategoryList",
                    foreignField: "addOnCategoryId",
                    as: "addOnProduct"
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductData: { $addToSet: "$addOnProduct.addOnProductId" },
                    variationData: { $addToSet: "$variations.variationId" },
                    variantData: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    discountList: { $first: "$discountList" },
                    addOnProductData: { $addToSet: { $reduce: { input: "$addOnProductData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variationData: { $addToSet: { $reduce: { input: "$variationData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variantData: { $addToSet: { $reduce: { input: "$variantData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    addOnProductList: { $arrayElemAt: ["$addOnProductData", 0] },
                    variationList: { $arrayElemAt: ["$variationData", 0] },
                    variantList: { $arrayElemAt: ["$variantData", 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                    discountList: 1
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }

}

exports.deleteOutlet = async (outletId) => {
    try {
        let outletData = await outletModel.aggregate([
            {
                $match: {
                    outletId
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "outletId",
                    foreignField: "outletId",
                    as: "categories"
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "outletId",
                    foreignField: "outletId",
                    as: "products"
                },
            },
            {
                $lookup: {
                    from: "addoncategories",
                    localField: "outletId",
                    foreignField: "outletId",
                    as: "addOnCategory"
                },
            },
            {
                $group: {
                    _id: "$outletId",
                    sellerId: { $first: null },
                    outletId: { $first: "$outletId" },
                    categoryData: { $push: "$categories.categoryId" },
                    productData: { $push: "$products.productId" },
                    addOnCategoryData: { $push: "$addOnCategory.addOnCategoryId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletId: { $first: "$outletId" },
                    categoryData: { $addToSet: { $reduce: { input: "$categoryData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    productData: { $addToSet: { $reduce: { input: "$productData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    addOnCategoryData: { $addToSet: { $reduce: { input: "$addOnCategoryData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                }
            },
            {
                $set: {
                    outletList: ["$outletId"],
                    categoryList: { $arrayElemAt: ["$categoryData", 0] },
                    productList: { $arrayElemAt: ["$productData", 0] },
                    discountList: [],
                    addOnCategoryList: { $arrayElemAt: ["$addOnCategoryData", 0] },
                }
            },
            {
                $lookup: {
                    from: "variations",
                    localField: "productList",
                    foreignField: "productId",
                    as: "variations"
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "productList",
                    foreignField: "productId",
                    as: "variants"
                }
            },
            {
                $lookup: {
                    from: "addonproducts",
                    localField: "addOnCategoryList",
                    foreignField: "addOnCategoryId",
                    as: "addOnProduct"
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductData: { $addToSet: "$addOnProduct.addOnProductId" },
                    variationData: { $addToSet: "$variations.variationId" },
                    variantData: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductData: { $addToSet: { $reduce: { input: "$addOnProductData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variationData: { $addToSet: { $reduce: { input: "$variationData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variantData: { $addToSet: { $reduce: { input: "$variantData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    addOnProductList: { $arrayElemAt: ["$addOnProductData", 0] },
                    variationList: { $arrayElemAt: ["$variationData", 0] },
                    variantList: { $arrayElemAt: ["$variantData", 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                    discountList: 1,
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }

}

exports.deleteCategory = async (categoryId) => {
    try {
        let outletData = await categoryModel.aggregate([
            {
                $match: {
                    $or: [
                        { categoryId },
                        { parentCategoryId: categoryId }
                    ]
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "categoryId",
                    foreignField: "parentCategoryId",
                    as: "products"
                },
            },
            {
                $group: {
                    _id: "$outletId",
                    sellerId: { $first: null },
                    categoryList: { $push: "$categoryId" },
                    productData: { $push: "$products.productId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    categoryList: { $first: "$categoryList" },
                    productData: { $addToSet: { $reduce: { input: "$productData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    outletList: [],
                    productList: { $arrayElemAt: ["$productData", 0] },
                    discountList: [],
                    addOnCategoryList: [],
                }
            },
            {
                $lookup: {
                    from: "variations",
                    localField: "productList",
                    foreignField: "productId",
                    as: "variations"
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "productList",
                    foreignField: "productId",
                    as: "variants"
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    variationData: { $addToSet: "$variations.variationId" },
                    variantData: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    variationData: { $addToSet: { $reduce: { input: "$variationData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variantData: { $addToSet: { $reduce: { input: "$variantData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    addOnProductList: [],
                    variationList: { $arrayElemAt: ["$variationData", 0] },
                    variantList: { $arrayElemAt: ["$variantData", 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                    discountList: 1
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }

}

exports.deleteProduct = async (productId) => {
    try {
        let outletData = await productModel.aggregate([
            {
                $match: {
                    productId
                }
            },
            {
                $lookup: {
                    from: "variations",
                    localField: "productId",
                    foreignField: "productId",
                    as: "variations"
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "productId",
                    foreignField: "productId",
                    as: "variants"
                }
            },
            {
                $group: {
                    _id: null,
                    productId: { $first: "$productId" },
                    variationData: { $addToSet: "$variations.variationId" },
                    variantData: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    productId: { $first: "$productId" },
                    variationData: { $addToSet: { $reduce: { input: "$variationData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variantData: { $addToSet: { $reduce: { input: "$variantData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    sellerId: null,
                    outletList: [],
                    categoryList: [],
                    productList: ["$productId"],
                    discountList: [],
                    addOnCategoryList: [],
                    addOnProductList: [],
                    variationList: { $arrayElemAt: ["$variationData", 0] },
                    variantList: { $arrayElemAt: ["$variantData", 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    discountList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }

}

exports.deleteVariation = async (variationId) => {
    try {
        let outletData = await variationModel.aggregate([
            {
                $match: {
                    variationId
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "variationId",
                    foreignField: "variationId",
                    as: "variants"
                }
            },
            {
                $group: {
                    _id: null,
                    variationId: { $first: "$variationId" },
                    variantData: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    variationId: { $first: "$variationId" },
                    variantData: { $addToSet: { $reduce: { input: "$variantData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } }
                }
            },
            {
                $set: {
                    sellerId: null,
                    outletList: [],
                    categoryList: [],
                    productList: [],
                    discountList: [],
                    addOnCategoryList: [],
                    addOnProductList: [],
                    variationId: ["$variationId"],
                    variantList: { $arrayElemAt: ["$variantData", 0] }
                }
            },
            {
                $lookup: {
                    from: "variations",
                    localField: "variantList",
                    foreignField: "parentId",
                    as: "variations2"
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductList: { $first: "$addOnProductList" },
                    variationId: { $first: "$variationId" },
                    variationData: { $addToSet: "$variations2.variationId" },
                    variantList: { $first: "$variantList" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductList: { $first: "$addOnProductList" },
                    variationId: { $first: "$variationId" },
                    variationData: { $addToSet: { $reduce: { input: "$variationData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variantList: { $first: "$variantList" }
                }
            },
            {
                $set: {
                    variationTempData: { $arrayElemAt: ["$variationData", 0] },
                }
            },
            {
                $set: {
                    variationList: {
                        $concatArrays: ["$variationId", "$variationTempData"]
                    },
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "variationTempData",
                    foreignField: "variationId",
                    as: "variants"
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductList: { $first: "$addOnProductList" },
                    variationList: { $first: "$variationList" },
                    variant1List: { $first: "$variantList" },
                    variant2Data: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductList: { $first: "$addOnProductList" },
                    variationList: { $first: "$variationList" },
                    variant1List: { $first: "$variant1List" },
                    variant2Data: { $addToSet: { $reduce: { input: "$variant2Data", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                }
            },
            {
                $set: {
                    variantTempData: { $arrayElemAt: ["$variant2Data", 0] },
                }
            },
            {
                $set: {
                    variantList: {
                        $concatArrays: ["$variant1List", "$variantTempData"]
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                    discountList: 1
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }

}

exports.deleteVariant = async (variantId) => {
    try {
        let outletData = await variantModel.aggregate([
            {
                $match: {
                    variantId
                }
            },
            {
                $lookup: {
                    from: "variations",
                    localField: "variantId",
                    foreignField: "parentId",
                    as: "variations"
                }
            },
            {
                $group: {
                    _id: null,
                    variantId: { $first: "$variantId" },
                    variationData: { $addToSet: "$variations.variationId" }
                }
            },
            {
                $group: {
                    _id: null,
                    variantId: { $first: "$variantId" },
                    variationData: { $addToSet: { $reduce: { input: "$variationData", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                    variantList: { $first: "$variantList" }
                }
            },
            {
                $set: {
                    sellerId: null,
                    outletList: [],
                    categoryList: [],
                    productList: [],
                    discountList: [],
                    addOnCategoryList: [],
                    addOnProductList: [],
                    variant1List: ["$variantId"],
                    variationList: { $arrayElemAt: ["$variationData", 0] },
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "variationList",
                    foreignField: "variationId",
                    as: "variants"
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductList: { $first: "$addOnProductList" },
                    variationList: { $first: "$variationList" },
                    variant1List: { $first: "$variant1List" },
                    variant2Data: { $addToSet: "$variants.variantId" }
                }
            },
            {
                $group: {
                    _id: null,
                    sellerId: { $first: "$sellerId" },
                    outletList: { $first: "$outletList" },
                    categoryList: { $first: "$categoryList" },
                    productList: { $first: "$productList" },
                    discountList: { $first: "$discountList" },
                    addOnCategoryList: { $first: "$addOnCategoryList" },
                    addOnProductList: { $first: "$addOnProductList" },
                    variationList: { $first: "$variationList" },
                    variant1List: { $first: "$variant1List" },
                    variant2Data: { $addToSet: { $reduce: { input: "$variant2Data", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } } },
                }
            },
            {
                $set: {
                    variantTempData: { $arrayElemAt: ["$variant2Data", 0] },
                }
            },
            {
                $set: {
                    variantList: {
                        $concatArrays: ["$variant1List", "$variantTempData"]
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                    discountList: 1
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }

}

exports.deleteAddOnCategory = async (addOnCategoryId) => {
    try {
        let outletData = await addOnCategoryModel.aggregate([
            {
                $match: {
                    addOnCategoryId
                }
            },
            {
                $lookup: {
                    from: "addonproducts",
                    localField: "addOnCategoryId",
                    foreignField: "addOnCategoryId",
                    as: "addOnProducts"
                }
            },
            {
                $group: {
                    _id: addOnCategoryId,
                    addOnCategoryId: { $first: "$addOnCategoryId" },
                    addOnProductData: { $first: "$addOnProducts.addOnProductId" }
                }
            },
            {
                $set: {
                    sellerId: null,
                    outletList: [],
                    categoryList: [],
                    productList: [],
                    discountList: [],
                    addOnCategoryList: ["$addOnCategoryId"],
                    addOnProductList: "$addOnProductData",
                    variantList: [],
                    variationList: [],
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: 1,
                    outletList: 1,
                    categoryList: 1,
                    productList: 1,
                    variationList: 1,
                    variantList: 1,
                    addOnCategoryList: 1,
                    addOnProductList: 1,
                    discountList: 1
                }
            }
        ])
        return outletData[0] ? responseFormater(true, "data list", outletData[0]) : responseFormater(false, "Invalid Id provided")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }
}

exports.deleteAddOnProduct = async (addOnProductId) => {
    try {
        await addOnProductModel.findOneAndDelete({ addOnProductId })
        return responseFormater(true, "data list")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.deleteDiscount = async (discountId) => {
    try {
        await discountModel.findOneAndDelete({ discountId })
        return responseFormater(true, "data list")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.bulkTaskFormatter = async (dataSet) => {
    try {
        const { sellerId, outletList, categoryList, productList, addOnCategoryList, discountList, addOnProductList, variationList, variantList } = dataSet
        if (outletList[0]) {
            await outletModel.updateMany({ outletId: { $in: outletList } }, { isActive: false })
        }
        if (categoryList[0]) {
            await categoryModel.deleteMany({ categoryId: { $in: categoryList } })
        }
        if (productList[0]) {
            await productModel.deleteMany({ productId: { $in: productList } })
        }
        if (addOnCategoryList[0]) {
            await addOnCategoryModel.deleteMany({ addOnCategoryId: { $in: addOnCategoryList } })
        }
        if (discountList[0]) {
            await discountModel.deleteMany({ discountId: { $in: discountList } })
        }
        if (addOnProductList[0]) {
            await addOnProductModel.deleteMany({ addOnProductId: { $in: addOnProductList } })
        }
        if (variationList[0]) {
            await variationModel.deleteMany({ variationId: { $in: variationList } })
        }
        if (variantList[0]) {
            await variantModel.deleteMany({ variantId: { $in: variantList } })
        }
        console.log(dataSet);
    } catch (error) {
        console.log("========", error.message);
        return responseFormater(res, error.message)
    }
}

exports.removeCustomizationFromProduct = async (variationId) => {
    try {
        const variationDetail = await variationModel.findOne({ variationId })
        const productCheck = await productModel.findOne({ productId: variationDetail.parentId })
        if (productCheck) {
            await productModel.findOneAndUpdate({ productId: variationDetail.parentId }, { hasCustomization: false })
            return
        }
        const variantCheck = await variantModel.findOne({variantId: variationDetail.parentId })
        if (variantCheck) {
            await variantModel.findOneAndUpdate({ variantId: variationDetail.parentId }, { hasCustomization: false })
            return
        }
    } catch (error) {
        console.log(error.message)
    }
}