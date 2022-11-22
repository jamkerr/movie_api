const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');
const passport = require('passport');

let directorSchema = mongoose.Schema({
    Name: {type: String, reqired: true},
    Bio: {type: String},
});

let genreSchema = mongoose.Schema({
    Name: {type: String, reqired: true},
    Description: {type: String},
});

let movieSchema = mongoose.Schema({
    Title: {type: String, reqired: true},
    Description: {type: String, required: true},
    ImageURL: {type: String},
    Genre: [{type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],
    Director: [{type: mongoose.Schema.Types.ObjectId, ref: 'Director'}],
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birth_Date: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Genre = Genre;
module.exports.Director = Director;
module.exports.Movie = Movie;
module.exports.User = User;