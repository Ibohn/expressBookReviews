const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered." });
});

// Helper function to simulate async database operations
const getBooksAsync = () => {
  return new Promise((resolve, reject) => {
    // Simulate async operation with setTimeout
    setTimeout(() => {
      resolve(books);
    }, 100);
  });
};

// Helper function to get book by ISBN asynchronously
const getBookByISBNAsync = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error(`No book found with ISBN ${isbn}`));
      }
    }, 100);
  });
};

// Helper function to get books by author asynchronously
const getBooksByAuthorAsync = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matches = Object.keys(books)
        .map(isbn => ({ isbn, ...books[isbn] }))
        .filter(b => b.author && b.author.toLowerCase() === author.toLowerCase());
      
      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(new Error(`No books found by author "${author}"`));
      }
    }, 100);
  });
};

// Helper function to get books by title asynchronously
const getBooksByTitleAsync = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matches = Object.keys(books)
        .map(isbn => ({ isbn, ...books[isbn] }))
        .filter(b => b.title && b.title.toLowerCase() === title.toLowerCase());
      
      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(new Error(`No books found with title "${title}"`));
      }
    }, 100);
  });
};

// Task 10: Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
  try {
    const booksData = await getBooksAsync();
    return res.status(200).send(JSON.stringify(booksData, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params;
  
  try {
    const book = await getBookByISBNAsync(isbn);
    return res.status(200).send(JSON.stringify(book, null, 2));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 12: Get book details based on the author using async/await
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;
  
  try {
    const matches = await getBooksByAuthorAsync(author);
    return res.status(200).send(JSON.stringify(matches, null, 2));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 13: Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;
  
  try {
    const matches = await getBooksByTitleAsync(title);
    return res.status(200).send(JSON.stringify(matches, null, 2));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 5: Get book reviews (synchronous version remains the same)
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}.` });
  }

  return res.status(200).send(JSON.stringify(book.reviews || {}, null, 2));
});

module.exports.general = public_users;

