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
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
});

module.exports = Prop = mongoose.model("div", PropSchema);
