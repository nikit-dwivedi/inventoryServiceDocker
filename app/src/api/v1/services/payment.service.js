const { get, post } = require("./axios.service");
const { checkBankUrl, transactionOfOutlet } = require("./url.service");

exports.checkBankByBankId = async (bankId, token) => {
    try {
        let url = checkBankUrl(bankId)
        let orderCheck = await get(url, token)
        return orderCheck ? orderCheck : { status: false, message: "payment service error" };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

exports.getAllTransactionOfOutlet = async (outletList, from, to, token) => {
    try {
        let url = transactionOfOutlet(from, to)
        let { status, message, items } = await post(url, { outletList }, token)
        return status ? { status, message, data: items } : { status, message };
    } catch (error) {
        return { status: false, message: error.message };
    }
}