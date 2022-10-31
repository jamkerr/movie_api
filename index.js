const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const app = express();
const Genres = Models.Genre;
const Directors = Models.Director;
const Movies = Models.Movie;
const Users = Models.User;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/YMDB', { useNewUrlParser: true, useUnifiedTopology: true });


// Log requested URL
app.use(morgan('common'));

// Serve static files from the 'public' folder
app.use(express.static('public'));


// Default message on home page
app.get('/', (req, res) => {
  res.send('Welcome to Your Movie DataBase!');
});

// Return all movies as json
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return a single movie as json
app.get('/movies/:moviename', (req, res) => {
    Movies.findOne({Title: req.params.moviename})
    .then((movie) => {
        res.status(201).json(movie);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return a genre
app.get('/genres/:genrename', (req, res) => {
    Genres.findOne({Name: req.params.genrename})
    .then((genre) => {
        res.status(201).json(genre);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return a director
app.get('/directors/:directorname', (req, res) => {
    Directors.findOne({Name: req.params.directorname})
    .then((director) => {
        res.status(201).json(director);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return all users
app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// Return single user by username
app.get('/users/:username', (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// Register a new user
/* JSON format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birth:Date: Date
}*/
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birth_Date: req.body.Birth_Date
          })
          .then((user) =>{res.status(201).json(user) })
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

// Update a username
app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate(
        {Username: req.params.username},
        {$set: {Username: req.body.Username}},
        {new: true}
    )
    .then((updatedUser) => {res.status(201).json(updatedUser)})
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
        

// Add a favorite movie
// app.put('/users/:username/favorites', (req, res) => {
//     // Find user by username
//     let user = users.find((user) => { return user.username === req.params.username });
//     let newFavorite = req.body;


//     // If user exists and they don't already have the film as a favorite
//     if (user) {
//         let isFavorite = user.favorites.find((favorite) => { return favorite.title === newFavorite.title});
//         if (!isFavorite) {
//             user.favorites.push(newFavorite);
//             // res.status(201).send(`You added ${newFavorite.title} as a favorite.`);
//             res.status(201).send(users);
//         } else {
//             res.status(404).send(`You already have ${newFavorite.title} as a favorite.`);
//         }
//     } else {
//         res.status(404).send(`We couldn\'t find a user with the username ${req.params.username}`);
//     }
// });

// Add a favorite movie v2
// app.put('/users/:username/favorites/:moviename', (req, res) => {
//     Users.findOneAndUpdate(
//         {Username: req.params.username},
//         {$push: {FavoriteMovies: Movies.findOne({Title: req.params.moviename})._id}},
//         {new: true}
//     )
//     .then((updatedUser) => {res.status(201).json(updatedUser)})
//     .catch((err) => {
//         console.error(err);
//         res.status(500).send('Error: ' + err);
//     });
// });

// Add a favorite movie v3
app.put('/users/:username/favorites/:moviename', (req, res) => {
    Users.findOneAndUpdate(
        {Username: req.params.username},
        {$push: {FavoriteMovies: Movies.findOne({Title: req.params.moviename}, '_id')}},
        {new: true}
    )
    .then((updatedUser) => {res.status(201).json(updatedUser)})
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Remove a favorite movie
app.delete('/users/:username/favorites', (req, res) => {
    // Find user by username
    let user = users.find((user) => { return user.username === req.params.username });
    // Favorite to delete
    let notFavoriteAnymore = req.body.title;

    // If user exists and they have the film as a favorite
    if (user) {
        let isFavorite = user.favorites.find((favorite) => { return favorite.title === notFavoriteAnymore });
        if (isFavorite) {
            user.favorites = user.favorites.filter((obj) => { return obj.title !== notFavoriteAnymore });
            res.status(204);
        } else {
            res.status(404).send(`You don't have ${notFavoriteAnymore} as a favorite.`);
        }
    } else {
        res.status(404).send(`We couldn\'t find a user with the username ${req.params.username}`);
    }

});

// Delete a user account
app.delete('/users/:username', (req, res) => {
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
        res.status(500).send('Error: ' + err);
    });
});

// Catch internal server error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh oh spaghetti-o...');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});