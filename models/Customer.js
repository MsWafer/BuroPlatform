const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  projects: {
    type: mongoose.Schema.Types.ObjectId,
    default: [],
  },
  url: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
});

module.exports = Customer = mongoose.model("customer", CustomerSchema);
