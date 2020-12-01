const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
app.use(express.json({extended: false}));
app.use(cors())

connectDB();

app.get('/', (req,res) => res.send('Не крашься плиз'));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/tickets', require('./routes/tickets'));
app.use('/add', require('./routes/addProject'));
app.use('/projects', require('./routes/find'));
app.use('/city', require('./routes/findbycity'));


const PORT = process.env.PORT || 3672;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));