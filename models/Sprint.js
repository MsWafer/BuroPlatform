const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SprintSchema = new Schema({
  status: {
    type: Boolean,
    default: false,
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
  tasks: [
    {
      taskTitle: {
        type: String,
        required: true,
      },
      workVolume: {
        type: Number,
        required: false,
      },
      taskStatus: {
        type: Boolean,
        default: false,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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
});

module.exports = Sprint = mongoose.model("sprint", SprintSchema);
