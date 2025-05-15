import { connectToDatabase } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const decoded = await verifyToken(req.cookies.token);
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
      // Get all products
      const products = await Product.find({});
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      // Create new product
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } else if (req.method === 'PUT') {
      // Update product
      const { id, ...updateData } = req.body;
      const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
      res.status(200).json(product);
    } else if (req.method === 'DELETE') {
      // Delete product
      const { id } = req.body;
      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: 'Product deleted' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Admin products API error:', error);
    res.status(401).json({ message: error.message || 'Unauthorized' });
  }
}