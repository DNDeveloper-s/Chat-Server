const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoute');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@cluster0-zlxgj.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error.message);
    return res.json({
        acknowledgment: {
            type: 'error',
            message: error.message
        }
    });
})

mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('Server is listening on 3000');
        app.listen( process.env.PORT || 3000);
    })
    .catch(err => console.log(err));