const algoliaSearch = require('algoliasearch');
require('dotenv').config();

const appId = process.env.ALGOILA_APP_ID
const adminApiKey = process.env.ALGOILA_ADMIN_API_KEY

const client = algoliaSearch(appId, adminApiKey);

const outletIndex = client.initIndex('outlet');
const productIndex = client.initIndex('product');


//----------------------------------------add data to algolia----------------------------------------//

// outlet multiple
exports.addOutletData = async (outletList) => {
    try {
        const addedData = await outletIndex.saveObjects(outletList)
        return addedData
    } catch (error) {
        throw error
    }
}

// outlet single
exports.addSingleOutlet = async (outletData) => {
    try {
        const addedData = await outletIndex.saveObject(outletData)
        return addedData
    } catch (error) {
        throw error
    }
}

// product multiple
exports.addProductData = async (productList) => {
    try {
        const addedData = await productIndex.saveObjects(productList)
        return addedData
    } catch (error) {
        throw error
    }
}

// product single
exports.addSingleProduct = async (productData) => {
    try {
        const addedData = await productIndex.saveObject(productData)
        return addedData
    } catch (error) {
        throw error
    }
}

//------------------------------------------Update data to algolia------------------------------------------//

// outlet
exports.updateOutletOnAlgolia = async (data) => {
    try {
        const updatedData = await outletIndex.partialUpdateObject(data)
        return updatedData
    } catch (error) {
        throw error
    }
}

// product
exports.updateProductOnAlgolia = async (data) => {
    try {
        const updatedData = await productIndex.partialUpdateObject(data)
        return updatedData
    } catch (error) {
        throw error
    }
}

//----------------------------------------delete outlet data to algolia----------------------------------------//

// outlet multiple
exports.deleteMultipleOutlet = async (outletIdList) => {
    try {
        const deletedData = await outletIndex.deleteObjects(outletIdList)
        return deletedData
    } catch (error) {
        throw error
    }
}

// outlet single
exports.deleteSingleOutlet = async (outletId) => {
    try {
        const deletedData = await outletIndex.deleteObject(outletId)
        return deletedData
    } catch (error) {
        throw error
    }
}

// outlet multiple
exports.deleteMultipleProduct = async (productIdList) => {
    try {
        const deletedData = await productIndex.saveObjects(productIdList)
        return deletedData
    } catch (error) {
        throw error
    }
}

// outlet single
exports.deleteSingleProduct = async (productId) => {
    try {
        const deletedData = await productIndex.saveObject(productId)
        return deletedData
    } catch (error) {
        throw error
    }
}

//-----------------------------------------Search data from algolia-----------------------------------------//

// outlet
exports.searchOutlet = async (query) => {
    try {
        const { hits } = await outletIndex.search(query); // Perform the search
        return hits
    } catch (error) {
        throw error
    }
}

// product
exports.searchProduct = async (query) => {
    try {
        const { hits } = await productIndex.search(query); // Perform the search
        return hits
    } catch (error) {
        throw error
    }
}
