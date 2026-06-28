const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postit: {
      type: String,
      maxlength: 500,
    },
    img: {
      type: String,
    },
    file: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);