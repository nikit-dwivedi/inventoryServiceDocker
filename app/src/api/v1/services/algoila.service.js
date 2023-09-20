const algoliaSearch = require('algoliasearch');
require('dotenv').config();

const appId = process.env.APP_ID
const adminApiKey = process.env.ADMIN_API_KEY

const client = algoliaSearch(appId, adminApiKey);

const outletIndex = client.initIndex('outlet');
const productIndex = client.initIndex('product');



exports.addOutletData = async (outletList) => {
    try {
        const addedData = await outletIndex.saveObjects(outletList)
        return addedData
    } catch (error) {
        throw error
    }
}


exports.addProductData = async (productList) => {
    try {
        const addedData = await productIndex.saveObjects(productList)
        return addedData
    } catch (error) {
        throw error
    }
}


exports.searchOutlet=async (query)=>{
    try {
        console.log(query.outletName);
        const { hits } = await outletIndex.search(query.outletName); // Perform the search
        return hits
      } catch (error) {
        throw error
      }
}


exports.searchProduct=async (query)=>{
    try {
        const { hits } = await productIndex.search(query); // Perform the search
        return hits
      } catch (error) {
        throw error
      }
}
