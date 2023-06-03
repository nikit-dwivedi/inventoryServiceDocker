orderBaseUrlStage = 'http://139.59.60.119:4007'
orderBaseUrlProd = 'https://order.fablocdn.com'

exports.orderCountUrl = (outletId) => {
    return `${orderBaseUrlProd}/v1/order/count/${outletId}`
}

exports.rateOrder = (outletId) => {
    return `${orderBaseUrlProd}/v1/order/rating`
}