const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StatSchema = new Schema({
  date: { type: Date },
  day: { type: Number },
  month: { type: Number },
  year: { type: Number },
  users: [{ type: Schema.Types.ObjectId, ref: "user" }],
  user_count: { type: Number },
});

module.exports = Stat = mongoose.model("stat", StatSchema);
