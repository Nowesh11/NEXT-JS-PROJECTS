import dbConnect from '../../../../lib/dbConnect';
import Book from '../../../../models/Book';
import { requireAuth } from '../../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { id } } = req;

  // Validate ObjectId
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid book ID'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const book = await Book.findById(id)
          .select('ratings reviews')
          .populate('reviews.user', 'name email');
        
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        // Calculate rating statistics
        const totalReviews = book.reviews.length;
        const averageRating = totalReviews > 0 
          ? book.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        const ratingDistribution = {
          5: book.reviews.filter(r => r.rating === 5).length,
          4: book.reviews.filter(r => r.rating === 4).length,
          3: book.reviews.filter(r => r.rating === 3).length,
          2: book.reviews.filter(r => r.rating === 2).length,
          1: book.reviews.filter(r => r.rating === 1).length
        };

        res.status(200).json({
          success: true,
          data: {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            ratingDistribution,
            reviews: book.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          }
        });
      } catch (error) {
        console.error('Ratings fetch error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching ratings',
          error: error.message
        });
      }
      break;

    case 'POST':
      try {
        const authResult = await requireAuth(req);
        if (!authResult.success) {
          return res.status(401).json(authResult);
        }

        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
          });
        }

        const book = await Book.findById(id);
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        // Check if user has already reviewed this book
        const existingReviewIndex = book.reviews.findIndex(
          review => review.user.toString() === authResult.user.id
        );

        const newReview = {
          user: authResult.user.id,
          rating: parseInt(rating),
          comment: comment || '',
          createdAt: new Date()
        };

        if (existingReviewIndex !== -1) {
          // Update existing review
          book.reviews[existingReviewIndex] = newReview;
        } else {
          // Add new review
          book.reviews.push(newReview);
        }

        // Recalculate average rating
        const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
        book.ratings.average = totalRating / book.reviews.length;
        book.ratings.count = book.reviews.length;

        await book.save();

        // Populate user data for response
        await book.populate('reviews.user', 'name email');

        res.status(200).json({
          success: true,
          message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
          data: {
            averageRating: Math.round(book.ratings.average * 10) / 10,
            totalReviews: book.ratings.count,
            userReview: book.reviews.find(r => r.user._id.toString() === authResult.user.id)
          }
        });
      } catch (error) {
        console.error('Rating submission error:', error);
        res.status(400).json({
          success: false,
          message: 'Error submitting rating',
          error: error.message
        });
      }
      break;

    case 'DELETE':
      try {
        const authResult = await requireAuth(req);
        if (!authResult.success) {
          return res.status(401).json(authResult);
        }

        const book = await Book.findById(id);
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        // Find and remove user's review
        const reviewIndex = book.reviews.findIndex(
          review => review.user.toString() === authResult.user.id
        );

        if (reviewIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Review not found'
          });
        }

        // Check if user owns the review or is admin
        const isOwner = book.reviews[reviewIndex].user.toString() === authResult.user.id;
        const isAdmin = ['admin', 'super_admin'].includes(authResult.user.role);

        if (!isOwner && !isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this review'
          });
        }

        book.reviews.splice(reviewIndex, 1);

        // Recalculate average rating
        if (book.reviews.length > 0) {
          const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
          book.ratings.average = totalRating / book.reviews.length;
          book.ratings.count = book.reviews.length;
        } else {
          book.ratings.average = 0;
          book.ratings.count = 0;
        }

        await book.save();

        res.status(200).json({
          success: true,
          message: 'Review deleted successfully',
          data: {
            averageRating: Math.round(book.ratings.average * 10) / 10,
            totalReviews: book.ratings.count
          }
        });
      } catch (error) {
        console.error('Review deletion error:', error);
        res.status(500).json({
          success: false,
          message: 'Error deleting review',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}