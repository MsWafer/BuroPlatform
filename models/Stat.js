const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StatSchema = new Schema({
  date: { type: Date },
  day: { type: Number },
  month: { type: Number },
  year: { type: Number },
  users: [{ type: Schema.Types.ObjectId, ref: "user" }],
  user_count: { type: Number },
  task_open_count: { type: Number, default: 0 },
  task_close_count: { type: Number, default: 0 },
  my_tasks_created: { type: Number, default: 0 },
  sprints_created: { type: Number, default: 0 },
  complete_sprints_closed: { type: Number, default: 0 },
  incomplete_sprints_closed: { type: Number, default: 0 },
  cards_created: { type: Number, default: 0 },
});

module.exports = Stat = mongoose.model("stat", StatSchema);
