const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StickerSchema = new Schema({
  path: String,
  name: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = Sticker = mongoose.model("stickers", StickerSchema);
