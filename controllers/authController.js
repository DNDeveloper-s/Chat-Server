const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.fetchUser = async (req, res, next) => {
    const userId = req.query.userId;
    
    const user = await User.findById(userId);

    if(!user) {
        return next('Invalid User');
    }

    return res.json({
        acknowledgment: {
            type: 'success',
            message: 'Succesfully fetched the user',
            user: {
                name: user.name,
                _id: user._id,
                image: user.image,
                status: user.status,
            }
        }
    });
}

exports.getAuth = async (req, res, next) => {

    // let users = await User.find();

    // console.log(users);

    const message = req.query.message;
    const type = req.query.type;

    if(message) {
        return res.render('auth', {
            pageTitle: 'Chat Authentication',
            acknowledgment: {
                exists: true,
                type: type,
                message: message
            },
            loggedIn: true
        });
    }
    
    return res.render('auth', {
        pageTitle: 'Chat Authentication',
        acknowledgment: {
            exists: false
        },
        loggedIn: false
    });
}

exports.postRegAuth = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {

        let user = await User.findOne({email: email});

        if(user) {
            throw new Error('Account already exists with this email!');
        }

        const hashedPw = await bcrypt.hash(password, 12);

        if(!hashedPw) {
            throw new Error('Something went wrong, Try again!');
        }

        user = new User({
            name: name,
            email: email,
            password: hashedPw,
            image: '/assets/images/Saurabh_DP_square.jpg'
        })

        await user.save();

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'User posted successfully!'
            }
        })

        console.log(req.body.name, req.body.email);

    } catch(e) {
        next(e);
    }
    
}

exports.postLoginAuth = async (req, res, next) => {
    
    console.log('Posting Login');

    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({
                acknowledgment: {
                    type: 'error',
                    message: 'User not exists with this email, Try creating new one!'
                }
            })
        }
        const doMatch = await bcrypt.compare(password, user.password);
        if(!doMatch) {
            return res.json({
                acknowledgment: {
                    type: 'error',
                    message: 'Passwords doesn\'t match!'
                }
            })
        }
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save();
        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Logged In!'
            }
        })
    } catch (e) {
        next(e);
    }
}


exports.postLogoutAuth = async (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Logged Out!'
            }
        });
    })
}