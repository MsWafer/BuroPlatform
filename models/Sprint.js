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
    type:Date,
    default: null
  },
  description: {
    type: String,
    default: ""
  },
  tasks: [
    {
      taskTitle: {
        type: String,
        required: true,
      },
      workVolume: {
        type: Number,
        required: true,
      },
      taskStatus: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = Sprint = mongoose.model("sprint", SprintSchema);
