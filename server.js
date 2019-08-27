'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
// Renders the search form
app.get('/', (request, response) => { 
  // Note that .ejs file extension is not required
  response.render('pages/index');
});

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
  this.name = bookData.hasOwnProperty('title') ? bookData.title : 'Unknown Title';
  this.author = bookData.hasOwnProperty('authors') ? bookData.authors : 'Unknown Authors';
  this.description = bookData.hasOwnProperty('description') ? bookData.description : 'No Description';
  this.isbn = bookData.hasOwnProperty('industryIdentifiers') ? bookData.industryIdentifiers[0].identifier : 'No ISBN';
  this.image_url = bookData.hasOwnProperty('imageLinks') ? bookData.imageLinks.thumbnail.replace(httpRegex, 'https://') : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
}

// No API key required
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

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
    
  // how will we handle errors?
}
