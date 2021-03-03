const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PropSchema = new Schema({
  divname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: [],
    },
  ],
  cover: {
    type: String,
    default: "avatars/spurdo.png"
  }
});

module.exports = Prop = mongoose.model("div", PropSchema);
