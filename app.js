const express = require('express');

const app = express();

const server = app.listen('3000');

const authRoutes = require('./routes/authRoute');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));

app.use(authRoutes);

console.log('Its listening at 3000');