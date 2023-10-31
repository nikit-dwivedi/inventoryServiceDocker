const { randomBytes } = require('node:crypto')

exports.responseFormater = (status, message, data = {}) => {
    return { status, message, data }
}
exports.outletFormmater = (sellerId, bodyData, cuisines) => {
    const { outletName, phone, type, isFood = false, area, shopAddress, outletImage, outletBanner, longitude, latitude, preparationTime, isPureVeg = false, isDiscounted = false, discountId = "", tag = [] } = bodyData;
    const location = {
        'type': 'Point',
        'coordinates': [parseFloat(longitude), parseFloat(latitude)]
    }
    let openingHours = {
        0: bodyData.openingHours,
        1: bodyData.openingHours,
        2: bodyData.openingHours,
        3: bodyData.openingHours,
        4: bodyData.openingHours,
        5: bodyData.openingHours,
        6: bodyData.openingHours,
    }
    const outletId = randomBytes(6).toString('hex');
    return { sellerId, outletImage, phone, outletId, outletName, type, isFood, cuisines, outletBanner, shopAddress, longitude, latitude, openingHours, location, preparationTime, area, isPureVeg, isDiscounted, discountId, tag }
}
exports.updatedOutletFormatter = (outletData, cuisineList) => {
    const cuisines = cuisineList[0] ? cuisineList : undefined;
    let { outletName, shopAddress, phone, outletImage, outletBanner, longitude, latitude, preparationTime, isPureVeg, openingHours } = outletData;
    let location = undefined
    if (longitude && latitude) {
        location = {
            'type': 'Point',
            'coordinates': [longitude, latitude]
        }
    }
    if (openingHours && typeof openingHours == 'string') {

        openingHours = JSON.parse(openingHours)
    }
    return { outletImage, outletBanner, outletName, phone, shopAddress, longitude, latitude, location, preparationTime, isPureVeg, cuisines, openingHours }
}
exports.customizationFormatter = (parentId, customizationData) => {
    try {
        const { variationName, productId } = customizationData
        if (!variationName) {
            return { status: false, message: "please provide valid data" }
        }
        const variationId = randomBytes(6).toString('hex');
        const variationData = {
            parentId,
            variationId,
            variationName,
            productId,
        }
        return { status: true, message: "", data: variationData }
    } catch (error) {
        return { status: false, message: error.message }
    }
}
exports.customItemFormatter = (variationId, customItemData) => {
    try {
        const { variantName, variantPrice, productId } = customItemData
        const displayPrice = variantPrice
        const variantId = randomBytes(6).toString('hex');
        const variantData = { variationId, variantId, variantName, variantPrice, displayPrice, productId }
        return { status: true, message: "", data: variantData }
    } catch (error) {
        return { status: false, message: error.message }
    }
}
exports.discountFormater = (customId, discountData) => {
    try {
        let { discountTitle, promoCode, discountPercent, maxDiscount, minAmount, isCustom = true, isFlatDiscount = false } = discountData
        if (!promoCode) {
            promoCode = randomBytes(6).toString('hex');
        }
        const discountId = randomBytes(6).toString('hex');
        return this.responseFormater(true, "", { discountId, customId, discountTitle, promoCode, discountPercent, maxDiscount, minAmount, isFlatDiscount, isCustom })
    } catch (error) {
        return this.responseFormater(false, error.message)
    }
}
exports.bannerFormatter = (bannerData, linkId) => {
    const bannerID = randomBytes(6).toString('hex');
    let { type, tag, url } = bannerData
    let redirect = ""
    switch (tag) {
        case "offer":
            redirect = `/v1/discount/outlet/${linkId}`
            break;
        case "sponsor":
            redirect = `/v1/outlet/single/${linkId}`
            break;
        default:
            tag = "default"
            redirect = `/v1/outlet/all`
            break;
    }
    return { bannerID, type, tag, url, redirect }
}

exports.addOnCategoryFormatter = (categoryData) => {
    const addOnCategoryId = randomBytes(6).toString('hex');
    const { outletId, categoryName, maxSelection, minSelection } = categoryData
    return { addOnCategoryId, outletId, categoryName, maxSelection, minSelection }
}

exports.addOnCategoryEditFormatter = (categoryData) => {
    const { categoryName, maxSelection, minSelection } = categoryData
    return { categoryName, maxSelection, minSelection }
}


exports.addOnProductFormatter = (productData) => {
    const addOnProductId = randomBytes(6).toString('hex');
    const { addOnCategoryId, productName, productPrice } = productData
    return { addOnProductId, addOnCategoryId, productName, productPrice }
}

exports.addOnProductEditFormatter = (productData) => {
    const { productName, productPrice } = productData
    return { productName, productPrice }
}

exports.ratingFormatter = (outletId, ratingData) => {
    const ratingId = randomBytes(6).toString('hex');
    const { rating, comment, type } = ratingData
    return { ratingId, outletId, rating, comment, type }
}

exports.cuisineFormatter = (cuisineData) => {
    const { cuisineName, cuisineImage, cuisineDescription } = cuisineData
    const cuisineId = randomBytes(6).toString('hex');
    return { cuisineId, cuisineName, cuisineImage, cuisineDescription }
}

exports.formatOutletForAlgolia = (outletData) => {
    const { outletId, outletName, outletImage, shopAddress } = outletData
    return { objectID: outletId, outletName, outletImage, shopAddress }
}

exports.formatProductForAlgolia = (productData) => {
    const { productId, outletId, productName, productDesc, productImage, productPrice, isVeg, inStock, outletName, area,outletImage } = productData
    return { objectID: productId, outletId, productName, productDesc, productImage, productPrice, isVeg, inStock, outletName, area ,outletImage}
}
