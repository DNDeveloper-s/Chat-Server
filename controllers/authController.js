const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getAuth = (req, res, next) => {
    return res.render('auth', {
        pageTitle: 'Chat Authentication'
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
            password: hashedPw
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