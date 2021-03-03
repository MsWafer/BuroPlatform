const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PropSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
  },
  status: {
    type: Schema.Types.Mixed,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  executor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});

module.exports = Prop = mongoose.model("offer", PropSchema);
