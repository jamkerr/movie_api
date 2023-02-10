const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

/**
 * Generate a JSON Web Token for a user.
 * @name generateJWTToken
 * @kind function
 * @returns a JSON Web Token
 */
let generateJWTToken = (user) => {
    return jwt.sign({"_id":user._id}, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

/**
 * POST to login for user authentication.
 * @name userLogin
 * @kind function
 * @requires passport
 * @returns a user object, and the associated JSON Web Token.
 */
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