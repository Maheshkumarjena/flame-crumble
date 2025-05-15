import { connectToDatabase } from '../../lib/db';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const decoded = await verifyToken(req.cookies.token);
    
    if (req.method === 'GET') {
      // Get user's cart
      const user = await User.findById(decoded.userId).populate('cart.items.productId');
      res.status(200).json(user.cart);
    } else if (req.method === 'POST') {
      // Add item to cart
      const { productId, quantity = 1 } = req.body;
      
      const user = await User.findById(decoded.userId);
      const existingItemIndex = user.cart.items.findIndex(
        item => item.productId.toString() === productId
      );
      
      if (existingItemIndex >= 0) {
        user.cart.items[existingItemIndex].quantity += quantity;
      } else {
        user.cart.items.push({ productId, quantity });
      }
      
      await user.save();
      res.status(200).json({ message: 'Item added to cart' });
    } else if (req.method === 'PUT') {
      // Update cart item quantity
      const { productId, quantity } = req.body;
      
      const user = await User.findById(decoded.userId);
      const itemIndex = user.cart.items.findIndex(
        item => item.productId.toString() === productId
      );
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          user.cart.items.splice(itemIndex, 1);
        } else {
          user.cart.items[itemIndex].quantity = quantity;
        }
        await user.save();
        res.status(200).json({ message: 'Cart updated' });
      } else {
        res.status(404).json({ message: 'Item not found in cart' });
      }
    } else if (req.method === 'DELETE') {
      // Remove item from cart
      const { productId } = req.body;
      
      const user = await User.findById(decoded.userId);
      user.cart.items = user.cart.items.filter(
        item => item.productId.toString() !== productId
      );
      
      await user.save();
      res.status(200).json({ message: 'Item removed from cart' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Cart API error:', error);
    res.status(401).json({ message: error.message || 'Unauthorized' });
  }
}