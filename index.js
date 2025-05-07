
// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/Book');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library Management API",
      version: "1.0.0",
      description: "A simple Library Management API with Swagger UI",
    },
    servers: [
      {
        url: "https://library-api-git-main-manauwarnrgn-gmailcoms-projects.vercel.app/", // Replace with your Vercel URL
      },
    ],
  },
  apis: ['./index.js'], // Point to your route files (adjust this path)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));





// ✅ Debug log
console.log("🔍 MONGO_URI:", process.env.MONGODB_URI);

// ✅ Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error (e.g., missing title or duplicate ISBN)
 *       500:
 *         description: Internal server error
 */
// aLL Routes
// POST /books - Add a new book
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
 *     summary: Get all books (paginated)
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Books per page
 *     responses:
 *       200:
 *         description: Paginated list of books
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
// GET (Get all list of book)
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
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the book
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid ID format
 */
// GET (Get a specific book)
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
 *     summary: Update a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Validation error or duplicate ISBN
 */
// PUT method(update book)
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
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the book
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
// DELETE Method(Delete book)
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
 *         description: Search term
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
// GET (Fuzzy Search for book)
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send({ error: 'Search query is required' });
    }

    // Case-insensitive regex search for fuzzy matching
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


app.get('/', (req, res) => {
  res.send('Library Management API is running');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;