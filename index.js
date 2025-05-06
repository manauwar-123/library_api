require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/Book');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Debug log
console.log("🔍 MONGO_URI:", process.env.MONGODB_URI);

// ✅ Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));
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