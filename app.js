const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoute');
const dashboardRoutes = require('./routes/dashboardRoutes');
const messageRoutes = require('./routes/messageRoutes');
const workSpaceRoutes = require('./routes/workSpaceRoutes');
const roomRoutes = require('./routes/roomRoutes');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@cluster0-zlxgj.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});


const fileStorageProduct = multer.diskStorage({
    destination: './productImages/user_images',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
        console.log(file);
    }
});

// View Engines
app.set('view engine', 'ejs');
app.set('views', 'views');

// Multer-Resizer


// Utility Middlewares
app.use(bodyParser.json());
app.use(multer({ storage: fileStorageProduct }).single('image'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/material-design-icons'));
app.use(express.static(__dirname + '/productImages'));
app.use(cookieParser());
app.use(session({
    secret: 'You dont know the secret of this project and can never know 8860119880',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000
    }
}));

// Application Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/message', messageRoutes);
app.use('/workspace', workSpaceRoutes);
app.use('/room', roomRoutes);

// Redirecting to correct page even on bad URL
app.use('/', (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/auth/ui');
    } 
    return res.redirect('/dashboard/home');
});

// Every single error will go through this middleware (Error One !Special)
app.use((error, req, res, next) => {
    err = error.message;
    if(!err) {
        err = error;
    }
    console.log(error);
    return res.json({
        acknowledgment: {
            type: 'error',
            message: err
        }
    });
});

// Connection to Mongo DB and Socket.io and Server
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('Server is listening on 3000');
        const server = app.listen( process.env.PORT || 3000);
        const io = require('./socket').init(server, 
            {
                'pingInterval': 2000,
                'pingTimeout': 5000
            });
        app.set('socketio', io);
    })
    .catch(err => console.log(err));
    