const mongoose = require("mongoose")

const courseSchema = mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    thumbnail: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        required: true,
    },

    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    isPublished: {
        type: Boolean,
        default: false
    }
},
    {timestamps: {createdAt: true, updatedAt: false}

})

module.exports = mongoose.model("courseSchema", courseSchema)