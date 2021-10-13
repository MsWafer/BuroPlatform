const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SprintSchema = new Schema({
  status: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
  },
  dateOpen: {
    type: Date,
  },
  dateClosePlan: {
    type: Date,
    default: null,
  },
  dateCloseFact: {
    type: Date,
    default: null,
  },
  description: {
    type: String,
    default: "",
  },
  tags: {
    type: Array,
    default: [],
  },
  explanation: {
    type: String,
  },
  tasks: [
    {
      cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "card",
      },
      cardTitle: String,
      taskTitle: {
        type: String,
        required: true,
      },
      workVolume: {
        type: Number,
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
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
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
    },
  ],
  urn: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
  },
});

module.exports = Sprint = mongoose.model("sprint", SprintSchema);
