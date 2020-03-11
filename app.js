const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoute');
const dashboardRoutes = require('./routes/dashboardRoutes');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@cluster0-zlxgj.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/material-design-icons'));
app.use(session({
    secret: 'You dont know the secret of this project and can never know 8860119880',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 10 * 60 * 60 * 1000
    }
}))

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/', (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/auth/ui');
    } 
    return res.redirect('/dashboard/home');
});

app.use((error, req, res, next) => {
    err = error.message;
    if(!err) {
        err = error;
    }
    return res.json({
        acknowledgment: {
            type: 'error',
            message: err
        }
    });
})
// console.log('Server is listening on 3000');       
// app.listen( process.env.PORT || 3000);

mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('Server is listening on 3000');
        const server = app.listen( process.env.PORT || 3000);
        const io = require('./socket').init(server);
        // io.on('connection', socket => {
        //     console.log(socket.id + ' is connected')
        // })
        app.set('socketio', io);
    })
    .catch(err => console.log(err));
    