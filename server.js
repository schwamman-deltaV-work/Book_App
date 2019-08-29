/* eslint-disable comma-dangle */
'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

// Application Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
//Routes/renders index page with saved books or a search page if nothing saved
app.get('/', getBooks);
app.post('/books', createBook);
app.get('/search', (request, response) => { 
  response.render('pages/searches/new');
});

app.get('/books/:id', getDetails);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`I know that you came to party baby, baby, baby, baby on port: ${PORT}`));

//Function to handle errors
function handleError(error, response) {
  response.status(error.status || 500).send(error.message);
}

let httpRegex = /^(http:\/\/)/g;

// HELPER FUNCTIONS
function Book(bookData) {
  this.title = bookData.hasOwnProperty('title') ? bookData.title : 'Unknown Title';
  this.author = bookData.hasOwnProperty('authors') ? bookData.authors : 'Unknown Authors';
  this.description = bookData.hasOwnProperty('description') ? bookData.description : 'No Description';
  this.isbn = bookData.hasOwnProperty('industryIdentifiers') ? bookData.industryIdentifiers[0].identifier : 'No ISBN';
  this.image_url = bookData.hasOwnProperty('imageLinks') ? bookData.imageLinks.thumbnail.replace(httpRegex, 'https://') : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
}

// No API key required
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => {
      return new Book(bookResult.volumeInfo);
    }))
    .then(results => {
      const sliceIndex = results.length > 10 ? 10 : results.length;
      return response.render('pages/searches/show', {searchResults: results.slice(0, sliceIndex)});
    })
    .catch(error => handleError(error, response));
  // how will we handle errors? ^^^^^^^ Like dis ^^^^^^^
}

function getBooks(request, response) {
  const SQL = 'SELECT * FROM books';

  return client.query(SQL)
    .then(results => {
      console.log(results);
      if( results.rowCount === 0){
        response.render('pages/searches/new');
      }
      else{
        response.render('pages/index', {saveResults: results.rows, count: results.rowCount});
      }
    });
}

function getDetails(req, res) {
  getBookshelves()
    .then(shelves => {
      const SQL = 'SELECT * FROM books WHERE id=$1';
      let values = [req.params.id];
      client.query(SQL, values)
        .then(results => {
          res.render('pages/books/show', {detailResults: results.rows[0], bookshelves: shelves.rows});
        });
    });
}

function getBookshelves() {
  let SQL = 'SELECT DISTINCT bookshelf FROM books ORDER BY bookshelf;';

  return client.query(SQL);
}

function createBook(req, res){
  let {title, author, isbn, image_url, description, bookshelf } = req.body;
  let SQL = 'INSERT INTO books(title, author, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;';
  let values = [title, author, isbn, image_url, description, bookshelf];

  client.query(SQL, values)
    .then(result => res.redirect(`/books/${result.rows[0].id}`))
    .catch(err => handleError(err, res));

}