const bcrypt = require('bcrypt');
const randomize = require('randomatic');
const User = require('../models/User');
const compression = require('../middleware/compress-image');

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
            loggedIn: false
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

    console.log(req.body.name, req.body.email);

    try {

        let user = await User.findOne({email: email});

        if(user) {
            throw new Error('Account already exists with this email!');
        }

        const hashedPw = await bcrypt.hash(password, 12);

        if(!hashedPw) {
            throw new Error('Something went wrong, Try again!');
        }
        let uniqueId;
        while(true) {
            const randomNum = randomize('0', 5);
            uniqueId = `${name}#${randomNum}`;
            console.log(uniqueId);
            const users = await User.findOne({uniqueTag: uniqueId});
            if(users) {
                continue;
            }
            break;
        }

        user = new User({
            name: name,
            email: email,
            uniqueTag: uniqueId,
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

    } catch(e) {
        return next(e);
    }
    
}

exports.postLoginAuth = async (req, res, next) => {
    
    console.log('Posting Login');

    const email = req.body.email;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;
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
        user.sessionId = randomize('Aa0!', 345);
        if(rememberMe) {
            res.cookie('sessionId', user.sessionId);
        } else {
            user.sessionId = undefined;
        }
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save();
        await user.save();
        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Logged In!',
                rememberMe: rememberMe,
                sessionId: user.sessionId
            }
        })
    } catch (e) {
        next(e);
    }
}


exports.postLogoutAuth = async (req, res, next) => {
    const user = await User.findById(req.session.user._id);
    user.sessionId = undefined;
    await user.save();
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

exports.postUpdateProfile = async (req, res, next) => {
    try {
        const image = req.file;
        const name = req.body.user_name;
        const userId = req.query.userId;

        console.log(image);

        if(!req.session.isLoggedIn) {
            return next('You are not logged in!');
        }
        
        if(req.session.user._id.toString() !== userId.toString()) {
            return next('It\'s not you! You cannot update to this user');
        }

        if(image) {

            console.log(image);
            // const path = req

            let input = `productImages/user_images/${image.filename}`;
            let output = 'productImages/user_images/resized/';

            compression(input, output, async (error, completed, statistic) => {
                if(error) {
                    return next(error);
                }          
        
                const user = await User.findOne({email: req.session.user.email});
            
                user.name = name;
                console.log(statistic);
                if(image) {
                    user.image = statistic.path_out_new.slice(13);
                }
                
                await user.save();
                
                return res.json({
                    acknowledgment: {
                        type: 'success',
                        message: 'Profile updated!',
                        imageSrc: user.image,
                        name: name
                    }
                })
            })
        } else {

            const user = await User.findOne({email: req.session.user.email});
        
            user.name = name;
                
            await user.save();
                
            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Profile updated!',
                    name: name
                }
            })
        }
    } catch(e) {
        return next(e);
    }
}