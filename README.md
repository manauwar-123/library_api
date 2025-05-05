# 📚 Library Management API

A Node.js + Express backend for managing a library system with MongoDB. Includes full CRUD operations and fuzzy search functionality. Deployed on Vercel.

---

## 🚀 Features
- Add, retrieve, update, and delete books
- Fuzzy search by title, author, or genre
- MongoDB schema validation with Mongoose
- Environment variable management using `.env`
- Deployed on Vercel

---

## 🧠 Tech Stack
- Node.js, Express.js
- MongoDB + Mongoose
- dotenv
- Vercel (for deployment)

---

## 📁 Project Structurelibrary-api/
├── controllers/bookController.js
├── models/Book.js
├── routes/bookRoutes.js
├── utils/fuzzySearch.js
├── index.js
├── .env
├── vercel.json
├── package.json


---

## ⚙️ Setup Instructions

1. **Clone the repo**  
   `git clone https://github.com/your-username/library-api.git && cd library-api`

2. **Install dependencies**  
   `npm install`

3. **Configure environment variables** (`.env`)
MONGO_URI=mongodb://localhost:27017/library
PORT=3000


4. **Start the server locally**  
`node index.js`  
➤ Server runs at: `http://localhost:3000`

---

## 📘 API Endpoints

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| POST   | `/books`         | Add a new book                     |
| GET    | `/books`         | Get a paginated list of books      |
| GET    | `/books/:id`     | Get a single book by ID            |
| PUT    | `/books/:id`     | Update a book by ID                |
| DELETE | `/books/:id`     | Delete a book by ID                |
| GET    | `/search?q=xyz`  | Fuzzy search by title/author/genre |

---

## 🔍 Fuzzy Search Example
Query:
Response:
```json
[
  {
    "title": "Harry Potter and the Sorcerer's Stone",
    "author": "J.K. Rowling",
    ...
  }


 Deployment (Vercel)
Push code to GitHub

Connect repo on Vercel

Add environment variables:

ini
Copy
Edit
MONGO_URI = your MongoDB URI (Atlas recommended)
PORT = 3000
]



