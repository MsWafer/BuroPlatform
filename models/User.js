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
  partition: {
    type: Array,
    default: [],
  },
  bday: {
    type: Date,
  },
  phone: {
    type: String,
  },
  merc: {
    type: Boolean,
    default: false,
  },
  tasks: {
    type: Array,
    default: [],
  },
  tasks: [
    {
      taskTitle: {
        type: String,
        required: true,
      },
      taskStatus: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
      deadline: {
        type: Date,
      },
      dateClose: {
        type: Date,
      },
      own: {
        type: Boolean,
        // default: true,
      },
      delay: {
        type: Boolean,
        default: false,
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
      },
      user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  activeTasks: { type: Array, default: [] },
  deadlineTasks: { type: Array, default: [] },
  taskHistory: [
    {
      year: { type: mongoose.Schema.Types.Mixed },
      month_tasks: [
        {
          month: {
            type: String,
          },
          tasks: [
            {
              taskTitle: { type: String },
              taskStatus: { type: Boolean },
              date: { type: Date },
              deadline: { type: Date },
              dateClose: { type: Date },
              own: { type: Boolean },
              project: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
              user2: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
            },
          ],
        },
      ],
    },
  ],
  device_tokens: { type: Array, default: [] },
  notifications: [
    {
      priority: { type: String },
      delayWhileIdle: { type: Boolean },
      timeToLive: { type: Number },
      restrictedPackageName: { type: String },
      notification: {
        icon: { type: String },
        body: { type: String },
        title: { type: String },
      },
      data: {
        news_id: { type: mongoose.Schema.Types.ObjectId },
        avatar: { type: String },
        fullname: { type: String },
        read: { type: Boolean },
        id: { type: String },
        date: { type: String },
        sprint_id: { type: mongoose.Schema.Types.ObjectId },
      },
    },
  ],
  fav_proj: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
    },
  ],
  fav_cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
    },
  ],
  event_cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
    },
  ],
  fav_boards: [
    {
      board_id: String,
      project: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
    },
  ],
  boards: {
    type: Array,
    default: [],
  },
  theme: {
    type: Boolean,
    default: false,
  },
});

module.exports = User = mongoose.model("user", UserSchema);
