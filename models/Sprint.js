const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SprintSchema = new Schema({
  status: {
    type: Boolean,
    default: false,
  },
  dateOpen: {
    type: Date,
    default: Date.now(),
  },
  dateClose: {
    type: Date,
    default: null,
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
