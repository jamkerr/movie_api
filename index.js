const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');

const app = express();

app.use(bodyParser.json());

const allMovies = [
    {
        title: 'The Adventures of Priscilla, Queen of the Desert',
        director: 'Stephan Elliott'
    },
    {
        title: 'Everything Everywhere All at Once',
        director: ['Daniel Kwan', 'Daniel Scheinert']
    },
    {
        title: 'Fight Club',
        director: 'David Fincher'
    },
    {
        title: 'The Matrix',
        director: 'The Wachowskis'
    },
    {
        title: 'Shaun of the Dead',
        director: 'Edgar Wright'
    },
    {
        title: 'The Rocky Horror Picture Show',
        director: 'Jim Sharman'
    },
    {
        title: 'The Truman Show',
        director: 'Peter Weir'
    },
    {
        title: 'Eternal Sunshine of the Spotless Mind',
        director: 'Michel Gondry'
    },
    {
        title: '2001: A Space Odyssey',
        director: 'Stanley Kubrick'
    },
    {
        title: 'Picnic at Hanging Rock',
        director: 'Peter Weir'
    }
];

let users = [
    {
        username: 'Fred',
        favorites: []
    },
    {
        username: 'Agatha',
        favorites: []
    }
]

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
  res.json(allMovies);
});

// Return a single movie as json
app.get('/movies/:movieTitle', (req, res) => {
    res.json(allMovies.find((movie) =>
    { return movie.title === req.params.movieTitle }));
});

// Return a genre
app.get('/genres/:genreName', (req, res) => {
    res.send(`Here's info on the film genre "${req.params.genreName}".`);
});

// Return a director
app.get('/directors/:directorName', (req, res) => {
    res.send(`Here's info on the director ${req.params.directorName}.`);
});

// Register a new user
app.post('/users', (req, res) => {
    let newUser = req.body;
  
    if (!newUser.username) {
        const message = 'Missing username in request body';
        res.status(400).send(message);
    } else {
        newUser.favorites = [];
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

// Update a username
app.put('/users/:username', (req, res) => {
    // Find user with current username
    let user = users.find((user) => { return user.username === req.params.username });
    let newUsername = req.body.newname;
    if (user) {
        user.username = newUsername;
        res.status(201).send(`Your new username is ${newUsername}`);
    } else {
        res.status(404).send(`We couldn\'t find a user with the username ${req.params.username}`);
    }
});

// Add a favorite movie
app.put('/users/:username/favorites', (req, res) => {
    // Find user by username
    let user = users.find((user) => { return user.username === req.params.username });
    let newFavorite = req.body;


    // If user exists and they don't already have the film as a favorite
    if (user) {
        let isFavorite = user.favorites.find((favorite) => { return favorite.title === newFavorite.title});
        if (!isFavorite) {
            user.favorites.push(newFavorite);
            // res.status(201).send(`You added ${newFavorite.title} as a favorite.`);
            res.status(201).send(users);
        } else {
        res.status(404).send(`You already have ${newFavorite.title} as a favorite.`);
        }
    } else {
        res.status(404).send(`We couldn\'t find a user with the username ${req.params.username}`);
    }
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
    // Find user by username
    let user = users.find((user) => { return user.username === req.params.username });
    
    if (user) {
        users = users.filter((obj) => { return obj.username !== req.params.username });
        res.status(204);
    } else {
        res.status(404).send(`We couldn\'t find a user with the username ${req.params.username}`);
    }
});

// Catch internal server error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh oh spaghetti-o...');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});