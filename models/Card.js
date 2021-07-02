const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardSchema = new Schema({
  status: {
    type: Boolean,
    default: false,
  },
  type: String,
  likeCount: {
    type: Number,
    default: 0,
  },
  likeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  expired: Boolean,
  notification: [
    {
      date: Date,
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    },
  ],
  regular: Boolean,
  date: Date,
  column: String,
  title: String,
  description: String,
  deadline: Date,
  event_date: Date,
  explanation: String,
  board_id: String,
  emergency: { type: String, default: "Обычная" },
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
      file: {
        path: String,
        og_name: String,
        file_type: String,
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
