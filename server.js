const express = require('express');
const connectDB = require('./config/db')

const app = express();

connectDB();

app.use(express.json({extended: false}));

app.get('/', (req,res) => res.send('Vse ok'));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/tickets', require('./routes/tickets'));

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));