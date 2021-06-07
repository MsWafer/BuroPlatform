const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardSchema = new Schema({
  status: {
    type: Boolean,
    default: false,
  },
  type: String,
  expired: Boolean,
  regular: Boolean,
  date: Date,
  column: String,
  title: String,
  description: String,
  deadline: Date,
  event_date: Date,
  explanation: String,
  emergency: { type: String, default: "Нет" },
  comments: [
    {
      text: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      date: Date,
      type: {
        type: String,
      },
    },
  ],
  tags: [String],
  tasks: [
    {
      taskTitle: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: new Date(),
      },
      taskStatus: {
        type: Boolean,
        default: false,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      deadline: {
        type: Date,
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
      },
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  execs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  event_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

module.exports = Card = mongoose.model("card", CardSchema);
