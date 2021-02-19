const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MercSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  job: {
    type: Date,
  },
  contacts:{ 
    type:Array
  },
});

module.exports = Merc = mongoose.model("merc", MercSchema);
