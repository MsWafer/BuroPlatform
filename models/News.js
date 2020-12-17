const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  postDate: {
    type: Date,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = News = mongoose.model("news", NewsSchema);
