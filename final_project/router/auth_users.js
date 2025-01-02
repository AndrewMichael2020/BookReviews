// router/auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js"); // Exports an object of book objects with ISBN as key
const regd_users = express.Router();
const bcrypt = require('bcrypt');

// In-memory users array
let users = [];

// Middleware to parse JSON bodies
regd_users.use(express.json());

/**
 * Function to validate if a username is valid (not already taken)
 * @param {string} username - The username to validate
 * @returns {Promise<boolean>} - Resolves to true if valid, false otherwise
 */
const isValid = async (username) => { // returns boolean
    return new Promise((resolve) => {
        setTimeout(() => {
            const userExists = users.some(user => user.username === username);
            resolve(!userExists);
        }, 500); // Simulate async operation with 0.5-second delay
    });
};

/**
 * Function to authenticate a user
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<boolean>} - Resolves to true if authenticated, false otherwise
 */
const authenticatedUser = async (username, password) => {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
            const user = users.find(user => user.username === username);
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                resolve(isMatch);
            } else {
                resolve(false);
            }
        }, 500); // Simulate async operation with 0.5-second delay
    });
};

/**
 * Middleware to verify JWT token
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1]; // Expected format: "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ message: "Internal server error" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Use JWT_SECRET from environment variables
        if (err) {
            console.error("Token verification failed:", err.message);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

/**
 * Route to register a new user
 * Endpoint: POST /register
 */
regd_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const isUsernameValid = await isValid(username);
        if (!isUsernameValid) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        // Add new user to the in-memory users array
        users.push({ username, password: hashedPassword });
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during user registration:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Route to login a registered user
 * Endpoint: POST /login
 */
regd_users.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const isAuth = await authenticatedUser(username, password);
        if (!isAuth) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ message: "Internal server error" });
        }

        // Generate JWT token using the secret from environment variables
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during user login:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Route to add or update a book review
 * Endpoint: PUT /auth/review/:isbn
 */
regd_users.put("/auth/review/:isbn", verifyToken, async (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username;

    // Validate input
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    try {
        // Find the book by ISBN
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Initialize reviews object if not present
        if (!book.reviews) {
            book.reviews = {};
        }

        // Add or update the review for the user
        book.reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
    } catch (error) {
        console.error(`Error updating review for ISBN "${isbn}":`, error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Route to delete a user's book review
 * Endpoint: DELETE /customer/auth/review/:isbn
 */
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    try {
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.reviews && book.reviews[username]) {
            delete book.reviews[username];
            return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
        } else {
            return res.status(404).json({ message: "Review not found for this user" });
        }
    } catch (error) {
        console.error(`Error deleting review for ISBN "${isbn}":`, error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
