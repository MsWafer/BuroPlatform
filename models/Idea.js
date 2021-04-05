const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IdeaSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
  },
  type: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  dateOpen: { type: Date },
  dateAccept: { type: Date },
  dateFinish: { type: Date },
});

module.exports = Idea = mongoose.model("idea", IdeaSchema);
