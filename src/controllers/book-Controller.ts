import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

// Validate search parameters
const searchSchema = z.object({
  query: z.string().min(1, { message: "Query must be at least 1 character long." }),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const searchBooks = async (req: Request, res: Response) => {
  try {
    const { query, page, limit } = searchSchema.parse({
      query: req.query.q,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });

    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.books.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { author: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          author: true,
          published_date: true,
          is_available: true,
          genre: true,
          rating: true,
        },
        skip,
        take: limit,
      }),
      prisma.books.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { author: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    res.json({
      data: books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message);
      res.status(400).json({ errors: messages });
    } else {
      const message = (error as Error).message || 'An unknown error occurred';
      res.status(500).json({ error: message });
    }
  }
};