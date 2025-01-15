import { Router } from 'express'
import { searchBooks } from '../controllers/book-Controller.js'
import { borrowBook, returnBook, getUserBorrowHistory } from '../controllers/borrow-Controller.js'

const router = Router()

// Book routes
router.get('/books/search', searchBooks)

// Borrow routes
router.post('/books/borrow', borrowBook)
router.post('/books/return', returnBook)
router.get('/users/:userId/borrows', getUserBorrowHistory)

export default router