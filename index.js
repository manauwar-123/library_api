require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/Book');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// Swagger Configuration
// ======================
/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *         isbn:
 *           type: string
 *           description: Unique ISBN number
 *         genre:
 *           type: string
 *           description: Book genre/category
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the book was added
 *       example:
 *         _id: 6512d5f3a8e1f2a3b4c5d6e7
 *         title: The Lord of the Rings
 *         author: J.R.R. Tolkien
 *         isbn: "9780544003415"
 *         genre: Fantasy
 *         createdAt: "2023-09-26T10:30:00Z"
 */

// Swagger Configuration (if you are not using a separate config file)
// Swagger Configuration (Improved)
// Swagger Configuration (Improved)
// Serve Swagger UI static files
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();
app.use('/swagger-ui', express.static(swaggerUiAssetPath));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management API',
      version: '1.0.0',
      description: 'A simple API for managing books in a library system',
    },
    servers: [
      {
        url: 'https://library-api-git-main-manauwarnrgn-gmailcoms-projects.vercel.app',
      },
    ],
  },
  apis: ['./index.js'], // Adjust the path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCssUrl: '/swagger-ui/swagger-ui.css',
  customJs: '/swagger-ui/swagger-ui-bundle.js',
  customSiteTitle: 'Library Management API Documentation',
}));

  

// ======================
// Database Connection
// ======================
console.log("🔍 MONGO_URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// ======================
// API Routes
// ======================

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book to the library
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error or missing required fields
 *       500:
 *         description: Internal server error
 */
app.post('/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).send(book);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ error: error.message });
    } else if (error.code === 11000) {
      res.status(400).send({ error: 'ISBN must be unique' });
    } else {
      res.status(500).send({ error: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get a list of all books with pagination
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A paginated list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalBooks:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
app.get('/books', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .skip(skip)
      .limit(limit)
      .sort({ title: 1 });

    const totalBooks = await Book.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);

    res.send({
      page,
      totalPages,
      totalBooks,
      books
    });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the book to get
 *     responses:
 *       200:
 *         description: Book data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid ID format
 */
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.send(book);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(400).send({ error: 'Invalid book ID' });
    } else {
      res.status(500).send({ error: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book's information
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid input or ISBN conflict
 */
app.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.send(book);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ error: error.message });
    } else if (error.code === 11000) {
      res.status(400).send({ error: 'ISBN must be unique' });
    } else {
      res.status(500).send({ error: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book from the library
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the book to delete
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.send({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search books by title, author, or genre
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term to match against title, author, or genre
 *     responses:
 *       200:
 *         description: List of matching books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       400:
 *         description: Missing search query
 */
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send({ error: 'Search query is required' });
    }

    const regex = new RegExp(query, 'i');
    const books = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { genre: { $regex: regex } }
      ]
    }).limit(10);

    res.send(books);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// ======================
// Basic Routes
// ======================
app.get('/', (req, res) => {
  res.send('Library Management API is running');
});

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Internal Server Error' });
});

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;