const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "under_review", "closed"],
      default: "under_review",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // OFFICIAL RESPONSE SYSTEM
    officialResponse: {
      type: String,
      default: "",
      trim: true,
    },

    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// INDEXES (ONLY HERE — clean way)
petitionSchema.index({ location: 1 });
petitionSchema.index({ category: 1 });
petitionSchema.index({ status: 1 });

// VIRTUAL: Signature Count
petitionSchema.virtual("signatureCount", {
  ref: "Signature",
  localField: "_id",
  foreignField: "petition",
  count: true,
});

// AUTO POPULATE
petitionSchema.pre(/^find/, function (next) {
  this.populate("creator", "name email");
  this.populate("respondedBy", "name");
  next();
});

// SAFE EXPORT (prevents overwrite error)
module.exports =
  mongoose.models.Petition ||
  mongoose.model("Petition", petitionSchema);