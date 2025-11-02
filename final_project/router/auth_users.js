const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Returns true if a username already exists in our records.
 * (Used by registration logic elsewhere.)
 */
const isValid = (username) => {
  return users.some((u) => u.username === username);
};

/**
 * Returns true if username+password matches our records.
 */
const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};

// -----------------------------
// Task 7: Login as registered user
// Endpoint (mounted at /customer): POST /customer/login
// -----------------------------
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  // Sign a JWT and store it in the session for this customer
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "Customer logged in successfully", token: accessToken });
});

// -----------------------------
// Task 8: Add/Modify a book review
// Endpoint: PUT /customer/auth/review/:isbn
// Review must come as a query param: ?review=Your+text
// Saves/overwrites the review for the logged-in user
// -----------------------------
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // per the assignment hint
  const sessionUser = req.session?.authorization?.username;

  if (!sessionUser) {
    return res.status(401).json({ message: "Login required" });
  }
  if (!review) {
    return res.status(400).json({ message: "Provide a review as a query param ?review=..." });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) book.reviews = {};
  // Add or modify the review for this user
  book.reviews[sessionUser] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews
  });
});

// -----------------------------
// Task 9: Delete a book review (only your own)
// Endpoint: DELETE /customer/auth/review/:isbn
// -----------------------------
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const sessionUser = req.session?.authorization?.username;

  if (!sessionUser) {
    return res.status(401).json({ message: "Login required" });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews || !book.reviews[sessionUser]) {
    return res.status(404).json({ message: "No review by this user for this book" });
  }

  delete book.reviews[sessionUser];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

