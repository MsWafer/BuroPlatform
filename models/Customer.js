const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  companyName: {
    type: String,
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
  regId: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

module.exports = Customer = mongoose.model("customer", CustomerSchema);
