const addOnCategoryModel = require("../models/addOnCategory.model");
const addOnProductModel = require("../models/addOnProduct.model");
const { responseFormater, addOnCategoryFormatter, addOnProductFormatter, addOnCategoryEditFormatter, addOnProductEditFormatter } = require("./format.helper");


// -----------------------------------------------Add-On-Category----------------------------------------------- //

exports.addAddonCategory = async (categoryData) => {
    try {
        const formattedCategoryData = addOnCategoryFormatter(categoryData);
        const saveData = new addOnCategoryModel(formattedCategoryData);
        await saveData.save()
        return responseFormater(true, "category added", formattedCategoryData.addOnCategoryId);
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.getAllAddOnOfOutlet = async (outletId) => {
    try {
        addOnCategoryList = await addOnCategoryModel.find({ outletId }).select("-_id -isActive -__v")
        if (!addOnCategoryList[0]) {
            return responseFormater(false, "no addOn added")
        }
        const returnArray = await Promise.all(addOnCategoryList.map(async (addOnCategory) => {
            const addOnProductList = await this.getAllAddOnProductOfCategory(addOnCategory.addOnCategoryId)
            addOnCategory._doc.productList = addOnProductList
            return addOnCategory
        }))
        return responseFormater(true, "AddOn List", returnArray)
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.getAddonCategoryByCategoryId = async (addOnCategoryId) => {
    try {
        const addOnCategoryData = await addOnCategoryModel.findOne({ addOnCategoryId }).select("-_id -isActive -__v")
        addOnCategoryData._doc.productList = await this.getAllAddOnProductOfCategory(addOnCategoryData.addOnCategoryId)
        return addOnCategoryData ? responseFormater(true, "add on detail", addOnCategoryData) : responseFormater(false, "addOn not found", addOnCategoryData)
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.editAddonCategory = async (addOnCategoryId, addOnCategoryData) => {
    try {
        const categoryCheck = await addOnCategoryModel.exists({ addOnCategoryId })
        if (!categoryCheck) {
            return responseFormater(false, "add on category not found")
        }
        const formattedData = addOnCategoryEditFormatter(addOnCategoryData)
        await addOnCategoryModel.findOneAndUpdate({ addOnCategoryId }, formattedData)
        return responseFormater(true, "add on category updated")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

// -----------------------------------------------Add-On-Product----------------------------------------------- //

exports.addAddonProduct = async (productData) => {
    try {
        const categoryCheck = await addOnCategoryModel.exists({ addOnCategoryId: productData.addOnCategoryId })
        if (!categoryCheck) {
            return responseFormater(false, "category not found")
        }
        const formattedProductData = addOnProductFormatter(productData);
        const saveData = new addOnProductModel(formattedProductData);
        await saveData.save()
        return responseFormater(true, "product added", formattedProductData.addOnProductId);
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.getAllAddOnProductOfCategory = async (addOnCategoryId) => {
    try {
        addOnProductList = await addOnProductModel.find({ addOnCategoryId }).select("-_id -__v")
        return addOnProductList
    } catch (error) {
        return []
    }
}

exports.editAddonProduct = async (addOnProductId, addOnProductData) => {
    try {
        const productCheck = await addOnProductModel.exists({ addOnProductId })
        if (!productCheck) {
            return responseFormater(false, "add on product not found")
        }
        const formattedData = addOnProductEditFormatter(addOnProductData)
        await addOnProductModel.findOneAndUpdate({ addOnProductId }, formattedData)
        return responseFormater(true, "add on product updated")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.getAddOnTotal = async (addOnIdArray) => {
    try {

        const groupList = await addOnProductModel.aggregate([
            {
                $match: {
                    addOnProductId: { $in: addOnIdArray }
                }
            },
            {
                $group: {
                    _id: "$addOnCategoryId",
                    productName: { $push: "$productName" },
                    addOnPrice: { $sum: "$productPrice" }
                }
            },
            {
                $project: {
                    _id: 0,
                    addOnCategoryId: "$_id",
                    addOnPrice: 1,
                    productName: 1,
                }
            }
        ])
        const reducedData = await groupList.reduce(async (previousData, groupData) => {
            const resolvedData = await previousData
            const addOnDetails = await addOnCategoryModel.findOne({ addOnCategoryId: groupData.addOnCategoryId })
            const name = `${addOnDetails.categoryName}-${groupData.productName.concat()}`
            let returnData = { name: resolvedData.name === "" ? name : resolvedData.name + "|" + name, price: resolvedData.price + groupData.addOnPrice }
            return returnData
        }, { name: "", price: 0 })
        reducedData.name = reducedData.name.replaceAll(",", ", ")
        return reducedData
    } catch (error) {
        console.log(error);
        return error
    }
}