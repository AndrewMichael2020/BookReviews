// router/general.js
const express = require('express');
const books = require("./booksdb.js"); // Exports an object of book objects with ISBN as key
const public_users = express.Router();

// Middleware to parse JSON bodies
public_users.use(express.json());

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    // Simulate asynchronous retrieval of books
    const getBooks = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (books && typeof books === 'object') {
                    resolve(Object.values(books)); // Return array of book objects
                } else {
                    reject(new Error("Books data not available"));
                }
            }, 1000);
        });
    };

    try {
        const booksData = await getBooks();
        res.json(booksData);
    } catch (err) {
        console.error("Error fetching books:", err.message);
        res.status(500).json({ error: "An error occurred while fetching books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    // Simulate asynchronous retrieval of a book by ISBN
    const getBookByIsbn = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error("Book not found"));
                }
            }, 1000); // Simulates a 1-second delay
        });
    };

    try {
        const book = await getBookByIsbn(isbn);
        res.json(book);
    } catch (error) {
        console.error(`Error fetching book with ISBN "${isbn}":`, error.message);
        res.status(404).json({ error: "Book not found" });
    }
});

// Get books based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    // Simulate asynchronous retrieval of books by author
    const getBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const filteredBooks = Object.values(books).filter((b) => b.author.toLowerCase() === author.toLowerCase());
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject(new Error("Books by the author not found"));
                }
            }, 1000); // Simulates a 1-second delay
        });
    };

    try {
        const booksByAuthor = await getBooksByAuthor(author);
        res.json(booksByAuthor);
    } catch (error) {
        console.error(`Error fetching books by author "${author}":`, error.message);
        res.status(404).json({ error: "Books by the author not found" });
    }
});

// Get books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    // Simulate asynchronous retrieval of books by title
    const getBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const filteredBooks = Object.values(books).filter((b) => b.title.toLowerCase() === title.toLowerCase());
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject(new Error("Books with the title not found"));
                }
            }, 1000); // Simulates a 1-second delay
        });
    };

    try {
        const booksByTitle = await getBooksByTitle(title);
        res.json(booksByTitle);
    } catch (error) {
        console.error(`Error fetching books with title "${title}":`, error.message);
        res.status(404).json({ error: "Books with the title not found" });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    // Simulate asynchronous retrieval of a book's review by ISBN
    const getReviewByIsbn = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = books[isbn];
                if (book && book.reviews) {
                    resolve(book.reviews);
                } else {
                    reject(new Error("Review not found"));
                }
            }, 1000); // Simulates a 1-second delay
        });
    };

    try {
        const reviews = await getReviewByIsbn(isbn);
        res.json({ reviews });
    } catch (error) {
        console.error(`Error fetching review for ISBN "${isbn}":`, error.message);
        res.status(404).json({ error: "Review not found" });
    }
});

module.exports.general = public_users;
