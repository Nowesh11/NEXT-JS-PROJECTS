import dbConnect from '../../../lib/dbConnect';
import Cart from '../../../models/Cart';
import Book from '../../../models/Book';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const authResult = await requireAuth(req);
        if (!authResult.success) {
          return res.status(401).json(authResult);
        }

        let cart = await Cart.findOne({ user: authResult.user.id })
          .populate({
            path: 'items.book',
            select: 'title author price originalPrice coverImage stock status category discount'
          });

        if (!cart) {
          cart = new Cart({ user: authResult.user.id, items: [] });
          await cart.save();
        }

        // Filter out items with unavailable books
        const availableItems = cart.items.filter(item => 
          item.book && item.book.status === 'active' && item.book.stock > 0
        );

        // Update cart if items were filtered out
        if (availableItems.length !== cart.items.length) {
          cart.items = availableItems;
          await cart.save();
        }

        // Calculate totals
        const subtotal = cart.items.reduce((total, item) => {
          const price = item.book.discount > 0 
            ? item.book.price * (1 - item.book.discount / 100)
            : item.book.price;
          return total + (price * item.quantity);
        }, 0);

        const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

        res.status(200).json({
          success: true,
          data: {
            cart,
            summary: {
              subtotal: Math.round(subtotal * 100) / 100,
              totalItems,
              itemCount: cart.items.length
            }
          }
        });
      } catch (error) {
        console.error('Cart fetch error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching cart',
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

        const { bookId, quantity = 1 } = req.body;

        if (!bookId) {
          return res.status(400).json({
            success: false,
            message: 'Book ID is required'
          });
        }

        if (quantity < 1 || quantity > 10) {
          return res.status(400).json({
            success: false,
            message: 'Quantity must be between 1 and 10'
          });
        }

        // Verify book exists and is available
        const book = await Book.findById(bookId);
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        if (book.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Book is not available for purchase'
          });
        }

        if (book.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${book.stock} items available in stock`
          });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: authResult.user.id });
        if (!cart) {
          cart = new Cart({ user: authResult.user.id, items: [] });
        }

        // Check if book is already in cart
        const existingItemIndex = cart.items.findIndex(
          item => item.book.toString() === bookId
        );

        if (existingItemIndex !== -1) {
          // Update quantity
          const newQuantity = cart.items[existingItemIndex].quantity + quantity;
          
          if (newQuantity > book.stock) {
            return res.status(400).json({
              success: false,
              message: `Cannot add ${quantity} more items. Only ${book.stock - cart.items[existingItemIndex].quantity} more available.`
            });
          }

          if (newQuantity > 10) {
            return res.status(400).json({
              success: false,
              message: 'Maximum 10 items per book allowed'
            });
          }

          cart.items[existingItemIndex].quantity = newQuantity;
          cart.items[existingItemIndex].updatedAt = new Date();
        } else {
          // Add new item
          cart.items.push({
            book: bookId,
            quantity,
            addedAt: new Date()
          });
        }

        await cart.save();

        // Populate book data for response
        await cart.populate({
          path: 'items.book',
          select: 'title author price originalPrice coverImage stock status category discount'
        });

        res.status(200).json({
          success: true,
          message: 'Item added to cart successfully',
          data: cart
        });
      } catch (error) {
        console.error('Add to cart error:', error);
        res.status(400).json({
          success: false,
          message: 'Error adding item to cart',
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

        // Clear entire cart
        await Cart.findOneAndUpdate(
          { user: authResult.user.id },
          { items: [] },
          { new: true, upsert: true }
        );

        res.status(200).json({
          success: true,
          message: 'Cart cleared successfully'
        });
      } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
          success: false,
          message: 'Error clearing cart',
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


  }
}