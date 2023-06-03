const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    ratingId: {
        type: String,
        unique: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false,
        maxLength: [500, "Comment cannot be more than 500 characters long."]
    },
    type: {
        type: String,
        enum: ["Outlet", "Partner"],
        default: "Outlet"
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Outlet",
    },
}, {
    timestamps: true
});

ratingSchema.index({ outletId: 1 });

ratingSchema.statics.calculateAverage = async function (outletId) {
    const ratings = await this.aggregate([
        {
            $match: { outletId }
        },
        {
            $group: {
                _id: "$outletId",
                average: { $avg: "$rating" }
            }
        }
    ]);

    if (ratings.length > 0) {
        await this.model("Outlet").findByIdAndUpdate(outletId, {
            rating: trimRating(ratings[0].average)
        });
    } else {
        await this.model("Outlet").findByIdAndUpdate(outletId, {
            rating: 0
        });
    }
};

ratingSchema.post("save", function () {
    this.constructor.calculateAverage(this.outletId);
});

ratingSchema.pre("remove", function () {
    this.constructor.calculateAverage(this.outletId);
});

const ratingModel = mongoose.model("rating", ratingSchema);

module.exports = ratingModel;


const trimRating = (rating => Number(rating.toFixed(1)))
