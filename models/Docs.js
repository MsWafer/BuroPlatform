const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  docs: [
    {
      title: {
        type: String,
      },
      text: {
        type: String,
      },
      file: {
        type: String,
      },
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
});

module.exports = Doc = mongoose.model("doc", DocSchema);
