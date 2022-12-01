const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    cors = require('cors'),
    {check, validationResult} = require('express-validator');

const app = express();
const Genres = Models.Genre;
const Directors = Models.Director;
const Movies = Models.Movie;
const Users = Models.User;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// let allowedOrigins = '*';

// app.use(cors({
//   origin: (origin, callback) => {
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){
//       let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
//       return callback(new Error(message), false);
//     }
//     return callback(null, true);
//   }
// }));

app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// mongoose.connect('mongodb://localhost:27017/YMDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Log requested URL
app.use(morgan('common'));

// Serve static files from the 'public' folder
app.use(express.static('public'));


// Default message on home page
app.get('/', (req, res) => {
  res.send('Welcome to Your Movie DataBase!');
});

// Return all movies as json
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .populate('Director')
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return a single movie as json
app.get('/movies/:moviename', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({Title: req.params.moviename})
    .then((movie) => {
        res.status(200).json(movie);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Add a new movie
/* JSON format:
{
  Title: String,
  Description: String,
  ImageURL: String,
  Genre: ObjectID,
  Director: ObjectID
}*/
app.post('/movies',
  passport.authenticate('jwt', { session: false }),
  // Validate fields with express-validator
  [
    check('Title', 'Title is required.').not().isEmpty(),
    check('Description', 'Description is required.').not().isEmpty(),
    check('ImageURL', 'Image URL needs to be a string.').optional().isString(),
    check('Featured', 'Featured can only be true or false.').optional().isBoolean()
  ],
  (req, res) => {
 
    // Check whether express-validator found any errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Movies.findOne({ Title: req.body.Title })
    .then((movie) => {
      if (movie) {
        return res.status(400).send(req.body.Title + ' already exists');
      } else {
        Movies
          .create({
            Title: req.body.Title,
            Description: req.body.Description,
            ImageURL: req.body.ImageURL,
            Genre: req.body.Genre,
            Director: req.body.Director
          })
          .then((movie) =>{res.status(201).json(movie) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Update movie details
/* JSON format:
{
  Title: String,
  Description: String,
  ImageURL: String,
  Genre: ObjectID,
  Director: ObjectID
}*/
app.put('/movies/:moviename',
  passport.authenticate('jwt', { session: false }),
  // Validate fields with express-validator
  [
    check('Title', 'Title needs to be a string.').optional().isString(),
    check('Description', 'Description needs to be a string.').optional().isString(),
    check('ImageURL', 'Image URL needs to be a string.').optional().isString(),
    check('Featured', 'Featured can only be true or false.').optional().isBoolean()
  ],
  (req, res) => {

    // Check whether express-validator found any errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Movies.findOneAndUpdate(
        {Title: req.params.moviename},
        {$set: {
            Title: req.body.Title,
            Description: req.body.Description,
            ImageURL: req.body.ImageURL,
            Genre: req.body.Genre,
            Director: req.body.Director,
            Featured: req.body.Featured
        }},
        {new: true}
    )
    .then((updatedMovie) => {
      let response = {"message": `Successfully updated info for ${updatedMovie.Title}`};
      res.status(201).json(response);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({"message": `The following error occurred: ${err}`});
    });
});


// Return a genre
app.get('/genres/:genrename', passport.authenticate('jwt', { session: false }), (req, res) => {
    Genres.findOne({Name: req.params.genrename})
    .then((genre) => {
        res.status(200).json(genre);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return a director
app.get('/directors/:directorname', passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.findOne({Name: req.params.directorname})
    .then((director) => {
        res.status(200).json(director);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
    .then((users) => {
        res.status(200).json(users);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return single user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.username })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Register a new user
/* JSON format:
{
  Username: String,
  Password: String,
  Email: String,
  Birth_Date: Date
}*/
app.post('/users',
  // Validate fields with express-validator
  [
    check('Username', 'Username is required.').not().isEmpty(),
    check('Username', 'Username can only contain numbers or letters.').isAlphanumeric(),
    check('Password', 'Password must be at least 8 characters long.').isLength({min:8}),
    check('Email', 'Email doesn\'t appear to be valid.').isEmail()
  ],
  (req, res) => {
  
  // Check whether express-validator found any errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      Users
        .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birth_Date: req.body.Birth_Date
        })
        .then((user) =>{
          let response = {"message": `Successfully created account for ${user.Username}`};
          res.status(201).json(response);
        })
      .catch((error) => {
        res.status(500).json({"message": `The following error occurred: ${error}`});
      })
    }
  })
  .catch((error) => {
    res.status(500).json({"message": `The following error occurred: ${error}`});
  });
});

// Update user details
app.put('/users/:username',
  passport.authenticate('jwt', { session: false }),
  // Validate fields with express-validator
  [
    check('Username', 'Username can only contain numbers or letters.').isAlphanumeric(),
    check('Password', 'Password must be at least 8 characters long.').isLength({min:8}),
    check('Email', 'Email doesn\'t appear to be valid.').isEmail()
  ],
  (req, res) => {

    // Check whether express-validator found any errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
        {Username: req.params.username},
        {$set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birth_Date: req.body.Birth_Date
        }},
        {new: true}
    )
    .then((updatedUser) => {
      let response = {"message": `Successfully updated info for ${updatedUser.Username}`};
      res.status(201).json(response);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({"message": `The following error occurred: ${err}`});
    });
});

// Add a favorite movie
app.put('/users/:username/favorites/:moviename', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({Title: req.params.moviename})
    .then((movie) => {
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        let updatedUser = Users.findOneAndUpdate(
            {Username: req.params.username},
            {$push: {FavoriteMovies: movie._id}},
            {new: true}
        )
        return updatedUser;
    })
    .then((updatedUser) => {res.status(201).json(updatedUser)})
    .catch((err) => {
        console.error(err);
        res.status(500).json({"message": `The following error occurred: ${err}`});
    });
});

// Remove a favorite movie
app.delete('/users/:username/favorites/:moviename', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({Title: req.params.moviename})
    .then((movie) => {
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        let updatedUser = Users.findOneAndUpdate(
            {Username: req.params.username},
            {$pull: {FavoriteMovies: movie._id}},
            {new: true}
        )
        return updatedUser;
    })
    .then((updatedUser) => {res.status(201).json(updatedUser)})
    .catch((err) => {
        console.error(err);
        res.status(500).json({"message": `The following error occurred: ${err}`});
    });
});

// Delete a user account
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({Username: req.params.username})
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.username + ' was not found');
        } else {
            res.status(200).send(req.params.username + ' was deleted!');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({"message": `The following error occurred: ${err}`});
    });
});

// Delete a movie
app.delete('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOneAndRemove({Title: req.params.title})
  .then((movie) => {
      if (!movie) {
          res.status(400).send(req.params.title + ' was not found');
      } else {
          res.status(200).send(req.params.title + ' was deleted!');
      }
  })
  .catch((err) => {
      console.error(err);
      res.status(500).json({"message": `The following error occurred: ${err}`});
  });
});

// Catch internal server error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh oh spaghetti-o...');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port' + port);
});