const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  problemname: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  date: {
    type: String,
  },
  emergency: {
    type: Number,
    required: true,
  },
  screenshot: {
    type: String,
  },
  pcpass: {
    type: String,
    default: null,
  },
});

module.exports = Ticket = mongoose.model("ticket", TicketSchema);
