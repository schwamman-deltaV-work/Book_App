DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(25),
  image_url VARCHAR(255),
  description VARCHAR(5000),
  bookshelf VARCHAR(255)
);

INSERT INTO books (author, title, isbn, description, bookshelf) VALUES('author', 'title', 124457575468, 'description', 'bookshelf');
INSERT INTO books (author, title, isbn, description, bookshelf) VALUES('author1', 'title1', 124457575461, 'description1', 'bookshelf1');
INSERT INTO books (author, title, isbn, description, bookshelf) VALUES('author2', 'title2', 124457575462, 'description2', 'bookshelf2');