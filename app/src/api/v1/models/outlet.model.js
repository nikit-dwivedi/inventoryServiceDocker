const mongoose = require("mongoose")
const Schema = mongoose.Schema

const timingSchema = new Schema({
    0: {
        type: Array,
        default: []
    },
    1: {
        type: Array,
        default: []
    },
    2: {
        type: Array,
        default: []
    },
    3: {
        type: Array,
        default: []
    },
    4: {
        type: Array,
        default: []
    },
    5: {
        type: Array,
        default: []
    },
    6: {
        type: Array,
        default: []
    },
})

const outletSchema = new Schema({
    outletId: {
        type: String,
        required: true,
        unique: true
    },
    outletName: {
        type: String,
    },
    outletImage: {
        type: Array
    },
    type: {
        type: String
    },
    phone:{
        type:Number
    },
    preparationTime: {
        type: String
    },
    area: {
        type: String
    },
    isPureVeg: {
        type: Boolean,
        default: false
    },
    isDiscounted: {
        type: Boolean,
        default: false
    },
    discountId: {
        type: String,
        default: ""
    },
    discountDetails: {
        discountPercent: {
            type: String
        },
        isFlatDiscount: {
            type: Boolean
        },
        maxDiscount: {
            type: String,
        },
        minAmount: {
            type: String,
        },
    },
    tag: {
        type: Array,
        default: []
    },
    isFood: {
        type: Boolean,
        default: false,
    },
    cuisines: [{
        cuisineId: {
            type: String
        },
        cuisineName: {
            type: String
        },
    }],
    shopAddress: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    location: {
        type: { type: String },
        coordinates: [],
    },
    sellerId: {
        type: String,
        required: true
    },
    subSellerId: {
        type: Array,
        default: []
    },
    openingHours: {
        type: timingSchema,
        required: true
    },
    isClosed: {
        type: Object,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: null
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
})
outletSchema.index({ location: "2dsphere" });
outletSchema.index({ outletName: 'text' });
const outletModel = mongoose.model("Outlet", outletSchema)

module.exports = outletModel