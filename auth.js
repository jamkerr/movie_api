const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

// POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session:false}, (error, user, info) => {
            if (error) {
                return res.status(400).json({
                    message: 'Something isn\'t right.',
                });
            }
            if (!user) {
                return res.status(404).json({
                    message: 'Make sure you\'ve included a valid username and password to sign in.',
                });
            }            
            req.login(user, {session:false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}