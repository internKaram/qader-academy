const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    pdfPath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index(
  {
    student: 1,
    course: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Certificate", certificateSchema);