const { getAllSubCategory } = require("./category.helper")
const { allProductOfCategory, productById } = require("./product.helper")

exports.menuFormater = async (categoryArray, productId,role) => {
    for (let element of categoryArray) {
        if (element.hasSubCategory) {
            let subCategoryList = await getAllSubCategory(element.categoryId)
            let subCategoryLength = subCategoryList.length
            element._doc.itemCount = subCategoryLength
            element._doc.subCategoryList = subCategoryList
            await this.menuFormater(subCategoryList)
        } else {
            let productList = await allProductOfCategory(element.categoryId,role);
            let productLength = productList.length
            element._doc.itemCount = productLength
            element._doc.productList = productList
        }
    }
    if (productId) {
        let productList = await productById(productId);
        delete productList.outletId
        delete productList.parentCategoryId
        const data = {
            categoryId: "f57e25d45028",
            categoryName: "Gotcha!!!",
            hasSubCategory: false,
            isCustom: true,
            itemCount: 1,
            productList:[productList]
        }
        categoryArray.unshift(data)
    }
    return await categoryArray
}