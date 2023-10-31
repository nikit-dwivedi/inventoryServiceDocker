const categoryModel = require('../models/category.model');
const { randomBytes } = require('node:crypto');
const { responseFormater } = require('./format.helper');

exports.addCategory = async (bodyData) => {
    try {
        const { parentCategoryId = "", categoryName, categoryDesc, categoryImage } = bodyData
        let { outletId } = bodyData;
        if (parentCategoryId != "") {
            let parentCategoryData = await categoryModel.findOne({ categoryId: parentCategoryId }).lean()
            outletId = parentCategoryData.outletId;
        }
        const displayIndex = await categoryModel.count({ outletId, parentCategoryId })
        const categoryId = randomBytes(6).toString('hex')
        const formattedData = { outletId, categoryId, parentCategoryId, categoryName, categoryDesc, categoryImage, displayIndex }
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

exports.addProductToCategory = async (categoryId) => {
    try {
        await categoryModel.findOneAndUpdate({ categoryId }, { hasProduct: true });
        return true
    } catch (error) {
        return false
    }
}

exports.getAllSubCategory = async (parentCategoryId) => {
    try {
        const data = await categoryModel.find({ parentCategoryId }).select('-_id categoryId hasSubCategory hasProduct categoryImage categoryDesc categoryName');
        return data
    } catch (error) {
        return false
    }
}

exports.getAllCategoryOfOutlet = async (outletId, page) => {
    try {
        const options = {
            page: page,
            limit: 1,
            sort: { createdAt: -1 },
            select: '-_id categoryId hasSubCategory hasProduct categoryImage categoryDesc categoryName isVeg'
        };
        const data = await categoryModel.paginate({ outletId, parentCategoryId: "" }, options);
        return data
    } catch (error) {
        console.log(error.message);
        return false
    }
}

exports.getAllCategoryOfOutletWithoutPagination = async (outletId, page) => {
    try {
        const data = await categoryModel.find({ outletId, parentCategoryId: "" }).select('-_id categoryId hasSubCategory hasProduct categoryImage categoryDesc categoryName isVeg');
        return data
    } catch (error) {
        console.log(error.message);
        return false
    }
}
exports.getOnlyCategoryOfOutlet = async (outletId, type) => {
    try {
        const categoryFilterQuery = type && type === "customer" ? { $gt: 0 } : { $gte: 0 }
        const data = await categoryModel.aggregate([
            {
                $match: {
                    outletId,
                    parentCategoryId: ''
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: 'parentCategoryId',
                    as: 'subCategory'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'subCategory.categoryId',
                    foreignField: 'parentCategoryId',
                    as: 'subCategoryProducts'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'categoryId',
                    foreignField: 'parentCategoryId',
                    as: 'products'
                }
            },
            {
                $set: {
                    subCategoriesCount: {
                        $size: '$subCategory'
                    },
                    totalProductsCount: {
                        $add: [
                            {
                                $size: '$products'
                            },
                            {
                                $size: '$subCategoryProducts'
                            }
                        ]
                    },
                    availableProductsCount: {
                        $size: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: '$products',
                                        as: 'data',
                                        cond: {
                                            $eq: ['$$data.inStock', true]
                                        }
                                    }
                                },
                                {
                                    $filter: {
                                        input: '$subCategoryProducts',
                                        as: 'data',
                                        cond: {
                                            $eq: ['$$data.inStock', true]
                                        }
                                    }
                                },
                            ]
                        }
                    },
                    outOfStockProductsCount: {
                        $size: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: '$products',
                                        as: 'data',
                                        cond: {
                                            $eq: ['$$data.inStock', false]
                                        }
                                    }
                                },
                                {
                                    $filter: {
                                        input: '$subCategoryProducts',
                                        as: 'data',
                                        cond: {
                                            $eq: ['$$data.inStock', false]
                                        }
                                    }
                                },
                            ]

                        }
                    }
                }
            },
            {
                $match: {
                    availableProductsCount: categoryFilterQuery // Filter documents with availableProductsCount greater than 0
                }
            },
            {
                $project: {
                    _id: 0,
                    subCategoriesCount: 1,
                    totalProductsCount: 1,
                    availableProductsCount: 1,
                    outOfStockProductsCount: 1,
                    categoryId: 1,
                    hasSubCategory: 1,
                    hasProduct: 1,
                    parentCategoryId: 1,
                    displayIndex: 1,
                    categoryImage: 1,
                    categoryDesc: 1,
                    categoryName: 1,
                }
            },
            {
                $sort: {
                    displayIndex: 1 // Sort by displayIndex in ascending order
                }
            }
        ])
        return data[0] ? data : false
    } catch (error) {
        return false
    }
}

exports.getSubCategoryOfOutlet = async (parentCategoryId) => {
    try {
        const data = await categoryModel.aggregate([
            {
                $match: {
                    parentCategoryId
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: 'parentCategoryId',
                    as: 'subCategory'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'categoryId',
                    foreignField: 'parentCategoryId',
                    as: 'products'
                }
            },
            {
                $set: {
                    subCategoriesCount: {
                        $size: '$subCategory'
                    },
                    totalProductsCount: {
                        $size: '$products'
                    },
                    availableProductsCount: {
                        $size: {
                            $filter: {
                                input: '$products',
                                as: 'data',
                                cond: {
                                    $eq: ['$$data.inStock', true]
                                }
                            }
                        }
                    },
                    outOfStockProductsCount: {
                        $size: {
                            $filter: {
                                input: '$products',
                                as: 'data',
                                cond: {
                                    $eq: ['$$data.inStock', false]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    subCategoriesCount: 1,
                    totalProductsCount: 1,
                    availableProductsCount: 1,
                    outOfStockProductsCount: 1,
                    categoryId: 1,
                    hasSubCategory: 1,
                    parentCategoryId: 1,

                    displayIndex: 1,
                    hasProduct: 1,
                    categoryImage: 1,
                    categoryDesc: 1,
                    categoryName: 1
                }
            },
            {
                $sort: {
                    displayIndex: 1 // Sort by displayIndex in ascending order
                }
            }
        ])
        return data[0] ? data : false
    } catch (error) {
        return false
    }
}
exports.getFullItemOfCategory = async (categoryId) => {
    try {
        const data = await categoryModel.aggregate([
            {
                $match: {
                    categoryId
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: 'parentCategoryId',
                    pipeline: [{
                        $lookup: {
                            from: 'products',
                            localField: 'categoryId',
                            foreignField: 'parentCategoryId',
                            pipeline: [{
                                $project: {
                                    _id: 0,
                                    isActive: 0,
                                    createdAt: 0,
                                    updatedAt: 0,
                                    __v: 0
                                }
                            }
                            ],
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            categoryId: 1,
                            categoryName: 1,
                            hasSubCategory: 1,
                            displayIndex: 1,
                            parentCategoryId: 1,

                            hasProduct: 1,
                            categoryImage: 1,
                            products: 1
                        }
                    },
                    {
                        $sort: {
                            displayIndex: 1 // Sort by displayIndex in ascending order
                        }
                    }],
                    as: 'subCategory'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'categoryId',
                    foreignField: 'parentCategoryId',
                    pipeline: [{
                        $project: {
                            _id: 0,
                            isActive: 0,
                            createdAt: 0,
                            updatedAt: 0,
                            __v: 0
                        }
                    }],
                    as: 'products'
                }
            },
            {
                $set: {
                    subCategoriesCount: {
                        $size: '$subCategory'
                    },
                    totalProductsCount: {
                        $size: '$products'
                    },
                    availableProductsCount: {
                        $size: {
                            $filter: {
                                input: '$products',
                                as: 'data',
                                cond: {
                                    $eq: ['$$data.inStock', true]
                                }
                            }
                        }
                    },
                    outOfStockProductsCount: {
                        $size: {
                            $filter: {
                                input: '$products',
                                as: 'data',
                                cond: {
                                    $eq: ['$$data.inStock', false]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    subCategoriesCount: 1,
                    totalProductsCount: 1,
                    availableProductsCount: 1,
                    outOfStockProductsCount: 1,
                    parentCategoryId: 1,
                    categoryId: 1,
                    hasSubCategory: 1,
                    displayIndex: 1,
                    hasProduct: 1,
                    categoryImage: 1,
                    categoryDesc: 1,
                    categoryName: 1,
                    products: 1,
                    subCategory: 1
                }
            },
            {
                $sort: {
                    displayIndex: 1 // Sort by displayIndex in ascending order
                }
            }
        ])
        return data[0] ? data : false
    } catch (error) {
        return false
    }
}
exports.getCategoryById = async (categoryId, full) => {
    try {
        const data = await categoryModel.findOne({ categoryId })
        console.log(data);
        return data ? full ? data : data.outletId : false;
    } catch (error) {
        return false
    }
}

exports.editCategoryById = async (categoryId, categoryName, displayIndex) => {
    try {
        const categoryData = await categoryModel.findOne({ categoryId }).lean()
        if (!categoryData) {
            return responseFormater(false, "category not found")
        }
        if (displayIndex) {
            const changeIndexOps = await changeDisplayIndex(categoryData, displayIndex)
            return changeIndexOps ? responseFormater(true, "index changed") : responseFormater(false, "index not changed")

        }
        await categoryModel.findOneAndUpdate({ categoryId }, { categoryName })
        return responseFormater(true, "category name changed")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.categoryByCategoryName = async (bodyData) => {
    try {
        let { categoryId, categoryName, outletId, parentCategoryId } = bodyData
        if (categoryId) {
            const categoryData = await categoryModel.findOne({ categoryId })
            outletId = categoryData.outletId
            parentCategoryId = categoryData.parentCategoryId
        }
        const categoryData = await categoryModel.findOne({ categoryName, outletId, parentCategoryId })
        return categoryData && categoryData.categoryId != categoryId ? true : false
    } catch (error) {
        return false
    }
}

async function changeDisplayIndex(categoryData, newIndex) {
    try {
        // const matchQuery = categoryData.parentCategoryId == "" ? { outletId: categoryData.outletId, parentCategoryId: categoryData.parentCategoryId }
        const displayIndexQuery = categoryData.displayIndex < newIndex ? [
            { displayIndex: { $lte: newIndex } },
            { displayIndex: { $gte: categoryData.displayIndex } }
        ] :
            [
                { displayIndex: { $lte: categoryData.displayIndex } },
                { displayIndex: { $gte: newIndex } }
            ]

        const operationQuery = categoryData.displayIndex < newIndex ? { $subtract: ["$displayIndex", 1] } : { $add: ["$displayIndex", 1] }
        const data = await categoryModel.aggregate([
            {
                $match: {
                    outletId: categoryData.outletId,
                    parentCategoryId: categoryData.parentCategoryId,
                    $and: displayIndexQuery
                },

            },
            {
                $project: {
                    _id: 0,
                    categoryId: 1,
                    displayIndex: {
                        $cond: {
                            if: { $eq: [categoryData.categoryId, "$categoryId"] },
                            then: newIndex,
                            else: operationQuery
                        }
                    }
                }
            }
        ])
        const bulkOps = data.map(item => ({
            updateOne: {
                filter: { categoryId: item.categoryId },
                update: { $set: { displayIndex: item.displayIndex } },
            },
        }));
        await categoryModel.bulkWrite(bulkOps)
        return true
    } catch (error) {
        throw error
    }
}









