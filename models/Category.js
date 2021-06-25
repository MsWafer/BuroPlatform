const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: String,
  step: Number,
  month: Number,
  columns: Array,
  timeline: [
    {
      start: Date,
      end: Date,
      cards: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "card",
        },
      ],
    },
  ],
  archive: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
    },
  ],
  expired: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
    },
  ],
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
    },
  ],
});

module.exports = Category = mongoose.model("category", CategorySchema);
