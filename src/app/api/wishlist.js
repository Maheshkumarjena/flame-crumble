import { connectToDatabase } from '../../lib/db';
import { verifyToken } from '../../lib/auth';
import Wishlist from '../../models/Wishlist';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const decoded = await verifyToken(req.cookies.token);
    
    if (req.method === 'GET') {
      // Get user's wishlist
      const wishlist = await Wishlist.findOne({ userId: decoded.userId });
      res.status(200).json(wishlist?.items || []);
    } else if (req.method === 'POST') {
      // Add item to wishlist
      const { productId, name, price, image, variant } = req.body;
      
      let wishlist = await Wishlist.findOne({ userId: decoded.userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({
          userId: decoded.userId,
          items: [],
        });
      }
      
      // Check if item already exists
      const existingItem = wishlist.items.find(
        item => item.productId.toString() === productId
      );
      
      if (!existingItem) {
        wishlist.items.push({
          productId,
          name,
          price,
          image,
          variant,
        });
        
        await wishlist.save();
        res.status(200).json({ message: 'Item added to wishlist' });
      } else {
        res.status(400).json({ message: 'Item already in wishlist' });
      }
    } else if (req.method === 'DELETE') {
      // Remove item from wishlist
      const { productId } = req.body;
      
      const wishlist = await Wishlist.findOne({ userId: decoded.userId });
      
      if (wishlist) {
        wishlist.items = wishlist.items.filter(
          item => item.productId.toString() !== productId
        );
        
        await wishlist.save();
        res.status(200).json({ message: 'Item removed from wishlist' });
      } else {
        res.status(404).json({ message: 'Wishlist not found' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Wishlist API error:', error);
    res.status(401).json({ message: error.message || 'Unauthorized' });
  }
}