const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
const db2 = config.get('mongoURI2');

const connectDB = async () => {
    try {
         try {
        await mongoose.connect(db, {
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex:true,
            useFindAndModify:false
        });
        console.log('MongoDB connected');
    }catch{
        await mongoose.connect(db2, {
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex:true,
            useFindAndModify:false
        });
        console.log('MongoDB connected');
    }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
   
    
}

module.exports = connectDB;