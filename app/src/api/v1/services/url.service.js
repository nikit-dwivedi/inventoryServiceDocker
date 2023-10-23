orderBaseUrlStage = 'http://139.59.60.119:4007'
orderBaseUrlProd = 'https://order.fablocdn.com'
paymentBaseUrlProd = 'https://payment.fablocdn.com'
adminBaseUrlProd = 'https://admin.fablocdn.com'

exports.orderCountUrl = (outletId) => {
    return `${orderBaseUrlProd}/v1/order/count/${outletId}`
}

exports.rateOrder = (outletId) => {
    return `${orderBaseUrlProd}/v1/order/rating`
}

exports.checkBankUrl = (bankId) => {
    return `${paymentBaseUrlProd}/bank/individual/${bankId}`
}

exports.transactionOfOutlet = (from, to) => {
    return from && to ? `${paymentBaseUrlProd}/payment/transaction/outlet?from=${from}&to=${to}` : `${paymentBaseUrlProd}/payment/transaction/outlet`
}

exports.getConfigUrl = ()=>{
    return `${adminBaseUrlProd}/v1/config`
}