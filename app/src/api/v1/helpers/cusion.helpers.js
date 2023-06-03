const { cards } = require('./cus.json');
const { randomBytes } = require('node:crypto');
const testCuisineModel = require('../models/testCusine.model')
const { responseFormater, cuisineFormatter } = require('./format.helper');
const outletModel = require('../models/outlet.model');

// exports.addCuisine = async (req, res) => {
//     const outletList = await outletModel.find();
//     outletList.forEach(async (outlet) => {
//         outlet.cuisine.forEach(async (cuisineId) => {
//             const categoryData = await testCuisineModel(cuisineId);
//             await ou
//         })
//     })
//     const saveData = new testCuisineModel(formmateData);
//     await saveData.save()
//     console.log(index);
//     res.send("done")
// }
exports.addCuisine = async (cuisineData) => {
    try {
        const formattedData = cuisineFormatter(cuisineData)
        const saveData = new testCuisineModel(formattedData);
        await saveData.save()
        return responseFormater(true, "cuisine added")
    } catch (error) {
        return responseFormater(false, error.message, error)
    }
}
exports.getCuisineList = async () => {
    try {
        const cuisinelist = await testCuisineModel.find().select('-_id -__v');
        return cuisinelist[0] ? responseFormater(true, "cuisine list", cuisinelist) : responseFormater(false, "no cuisine found", [])
    } catch (error) {
        return responseFormater(false, "bad request", error)
    }
}
exports.getCuisineForOutlet = async (cuisineIdList) => {
    try {
        const cuisineList = await Promise.all(cuisineIdList.map(async (cuisineId) => await testCuisineModel.findOne({ cuisineId }).select('-_id -cuisineImage -cuisineDescription -__v')))
        return cuisineList[0] ? cuisineList : []
    } catch (error) {
        return []
    }
}


