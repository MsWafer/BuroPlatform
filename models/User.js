const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ticket",
    },
  ],
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
    },
  ],
  sprints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sprint",
    },
  ],
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "div",
  },
  permission: {
    type: String,
    default: "user",
  },
  position: {
    type: String,
  },
  avatar: {
    type: String,
    default: "avatars/spurdo.png",
  },
  reccode: {
    type: String,
    default: "a",
  },
  rocketname: {
    type: String,
  },
  rocketId: {
    type: String,
  },
  fullname: {
    type: String,
  },
  report: {
    type: String,
  },
  partitions: {
    type: Array,
    default: []
  },
});

module.exports = User = mongoose.model("user", UserSchema);
