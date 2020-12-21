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
        ref: "users",
      },
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
  }
});

module.exports = Prop = mongoose.model("offer", PropSchema);
