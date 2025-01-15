# BackendDeveloperTask
This project is a backend developer task for KS Labs Hong Kong Limited, implementing a simple book borrowing system using Express.js and Prisma for database interactions.

## Features
- Comprehensive book search functionality
- Book borrowing and return management
- User borrowing history tracking

## Technologies Used
- Node.js
- Express.js
- Prisma
- PostgreSQL

> Some dependencies might not be used for example, "supertest", due to insufficient time to complete the auto test flow

## Installation
```
git clone https://github.com/fung673/BackendDeveloperTask.git
```
- install all dependency by running ```npm install``` in terminal
```
npx prisma migrate dev
```
- Open pgAdmin
- Right-click on "Databases"
- Choose "Create" > "Database"
- Name the database `library_db`
- Insert the following data into corresponding table
```
INSERT INTO users (name, email)
VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Charlie Brown', 'charlie@example.com');


INSERT INTO books (title, author, published_date, is_available, genre, rating)
VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', '1925-04-10', TRUE, 'Fiction', 4.4),
    ('1984', 'George Orwell', '1949-06-08', TRUE, 'Dystopian', 4.7),
    ('To Kill a Mockingbird', 'Harper Lee', '1960-07-11', TRUE, 'Historical', 4.8),
    ('The Catcher in the Rye', 'J.D. Salinger', '1951-07-16', FALSE, 'Fiction', 4.0),
    ('The Hobbit', 'J.R.R. Tolkien', '1937-09-21', TRUE, 'Fantasy', 4.9);

INSERT INTO borrows (user_id, book_id, borrow_date, return_date)
VALUES
    (1, 2, '2025-01-01', NULL),  -- Alice borrows "1984"
    (2, 3, '2025-01-03', '2025-01-10'),  -- Bob borrows "To Kill a Mockingbird" and returns it
    (3, 4, '2025-01-05', NULL);  -- Charlie borrows "The Catcher in the Rye"
```

- Execute "npm run dev" for starting server in port 3000


## TEST CASE

1. Search for a book we know exists:
```
curl "http://localhost:3000/api/books/search?q=1984"
```
Expected: Should show the book available (is_available: true)

2. Borrow the book:
```
curl -X POST http://localhost:3000/api/books/borrow -H "Content-Type: application/json" -d "{\"userId\": 1, \"bookId\": 2, \"dueDate\": \"2024-02-15T00:00:00Z\"}"
```
Expected: Success message and borrow record created

3. Verify the book is now unavailable:
```
curl "http://localhost:3000/api/books/search?q=1984"
```
Expected: Should show is_available: false

4. Try to borrow the same book again:
```
curl -X POST http://localhost:3000/api/books/borrow -H "Content-Type: application/json" -d "{\"userId\": 1, \"bookId\": 2, \"dueDate\": \"2024-02-15T00:00:00Z\"}"
```
Expected: Error message about book not being available

5. Check user's borrow history:
```
curl http://localhost:3000/api/users/1/borrows
Expected: Should show the active borrow record
```

6. Return the book:
```
curl -X POST http://localhost:3000/api/books/return -H "Content-Type: application/json" -d "{\"userId\": 1, \"bookId\": 2}"
```
Expected: Success message for return

7. Verify the book is available again:
```
curl "http://localhost:3000/api/books/search?q=1984"
```
Expected: Should show is_available: true

8. Try to borrow with invalid user:
```
curl -X POST http://localhost:3000/api/books/borrow -H "Content-Type: application/json" -d "{\"userId\": 999, \"bookId\": 2, \"dueDate\": \"2024-02-15T00:00:00Z\"}"
```
Expected: Error about user not found

9. Try to borrow invalid book:
```
curl -X POST http://localhost:3000/api/books/borrow -H "Content-Type: application/json" -d "{\"userId\": 1, \"bookId\": 999, \"dueDate\": \"2024-02-15T00:00:00Z\"}"
```
Expected: Error about book not found

10. Try to return a book that isn't borrowed:
```
curl -X POST http://localhost:3000/api/books/return -H "Content-Type: application/json" -d "{\"userId\": 1, \"bookId\": 2}"
```
Expected: Error about no active borrow record





