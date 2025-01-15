import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

const borrowSchema = z.object({
  userId: z.number().int().positive(),
  bookId: z.number().int().positive(),
  dueDate: z.string().datetime()
});

export const borrowBook = async (req: Request, res: Response) => {
  try {
    const { userId, bookId, dueDate } = borrowSchema.parse(req.body);

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if book exists and is available
      const book = await tx.books.findUnique({
        where: { id: bookId }
      });

      if (!book) {
        throw new Error('Book not found');
      }

      if (!book.is_available) {
        throw new Error('Book not available');
      }

      // Check if user exists
      const user = await tx.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create borrow record and update book availability
      const [borrowRecord] = await Promise.all([
        tx.borrows.create({
          data: {
            user_id: userId,
            book_id: bookId,
            borrow_date: new Date(),
            return_date: null
          }
        }),
        tx.books.update({
          where: { id: bookId },
          data: { is_available: false }
        })
      ]);

      return borrowRecord;
    });

    res.status(201).json({ 
      message: 'Book borrowed successfully',
      data: result 
    });

  } catch (error) {
    console.error('Borrow error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to borrow book'
      });
    }
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const { userId, bookId } = borrowSchema.pick({ 
      userId: true, 
      bookId: true 
    }).parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // Find active borrow record
      const borrowRecord = await tx.borrows.findFirst({
        where: {
          user_id: userId,
          book_id: bookId,
          return_date: null
        }
      });

      if (!borrowRecord) {
        throw new Error('No active borrow record found');
      }

      // Update borrow record and book availability
      const [updated] = await Promise.all([
        tx.borrows.update({
          where: { id: borrowRecord.id },
          data: { return_date: new Date() }
        }),
        tx.books.update({
          where: { id: bookId },
          data: { is_available: true }
        })
      ]);

      return updated;
    });

    res.json({
      message: 'Book returned successfully',
      data: result
    });

  } catch (error) {
    console.error('Return error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to return book'
      });
    }
  }
};

export const getUserBorrowHistory = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }

    const borrowRecords = await prisma.borrows.findMany({
      where: { 
        user_id: userId 
      },
      include: {
        book: true,
        user: true
      },
      orderBy: { 
        borrow_date: 'desc' 
      }
    });

    res.json({
      data: borrowRecords
    });
    
  } catch (error) {
    console.error('Get history error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to get borrow history'
    });
  }
};