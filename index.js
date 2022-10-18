const express = require('express'),
    morgan = require('morgan');
const app = express();

let topTenMovies = [
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

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to Your Movie DataBase!');
});

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh oh spaghetti-o...');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});