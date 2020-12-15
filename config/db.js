const mongoose = require("mongoose");
require('dotenv').config()
if(!process.env.N_ENV){db=process.env.MONGOURI2}else if(process.env.N_ENV=='production'){db=process.env.MONGOURI}
const connectDB = async () => {
  try {
      await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      });
      console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
