const categoryModel = require('../models/category.model');
const { randomBytes } = require('node:crypto');
const { responseFormater } = require('./format.helper');

exports.addCategory = async (bodyData) => {
    try {
        const { outletId, parentCategoryId = "", categoryName, categoryDesc, categoryImage } = bodyData
        const categoryId = randomBytes(6).toString('hex')
        const formattedData = { outletId, categoryId, parentCategoryId, categoryName, categoryDesc, categoryImage }
        const saveData = new categoryModel(formattedData);
        await saveData.save()
        if (parentCategoryId !== "") {
            await this.addSubCategoryToCategory(parentCategoryId)
        }
        return saveData.categoryId
    } catch (error) {
        return false
    }
}

exports.addSubCategoryToCategory = async (categoryId) => {
    try {
        await categoryModel.findOneAndUpdate({ categoryId }, { hasSubCategory: true });
        return true
    } catch (error) {
        return false
    }
}

exports.getAllSubCategory = async (parentCategoryId) => {
    try {
        const data = await categoryModel.find({ parentCategoryId }).select('-_id categoryId hasSubCategory categoryImage categoryDesc categoryName');
        return data
    } catch (error) {
        return false
    }
}

exports.getAllCategoryOfOutlet = async (outletId,page) => {
    try {
        const options = {
            page: page,
            limit: 1,
            sort: { createdAt: -1 },
            select: '-_id categoryId hasSubCategory categoryImage categoryDesc categoryName isVeg'
        };
        const data = await categoryModel.paginate({ outletId, parentCategoryId: "" }, options);
        return data
    } catch (error) {
        console.log(error.message);
        return false
    }
}
exports.getOnlyCategoryOfOutlet = async (outletId) => {
    try {
        const data = await categoryModel.find({ outletId, parentCategoryId: "" }).select('-_id categoryId hasSubCategory categoryImage categoryDesc categoryName');
        return data[0] ? data : false
    } catch (error) {
        return false
    }
}

exports.getSubCategoryOfOutlet = async (parentCategoryId) => {
    try {
        const data = await categoryModel.find({ parentCategoryId }).select('-_id categoryId hasSubCategory categoryImage categoryDesc categoryName');
        return data[0] ? data : false
    } catch (error) {
        return false
    }
}
exports.getCategoryById = async (categoryId) => {
    try {
        const data = await categoryModel.findOne({ categoryId })
        return data ? data.outletId : false;
    } catch (error) {
        return false
    }
}

exports.editCategoryById = async (categoryId, categoryName) => {
    try {
        const categoryCheck = await categoryModel.exists({ categoryId })
        if (!categoryCheck) {
            return responseFormater(false, "category not found")
        }
        await categoryModel.findOneAndUpdate({ categoryId }, { categoryName })
        return responseFormater(true, "category name changed")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}










