const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
app.use(express.json({extended: false}));
app.use(cors())
app.use(express.static('public'))
app.use('/ticketSS', express.static(__dirname + '/ticketSS'))
app.use('/avatars', express.static(__dirname + '/avatars'))

connectDB();

app.get('/', (req,res) => res.send('Не крашьте плиз'));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/tickets', require('./routes/tickets'));
app.use('/projects', require('./routes/projects'));

const PORT = process.env.PORT || 7070;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));