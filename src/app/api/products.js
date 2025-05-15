import { connectToDatabase } from '../../lib/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const { category, sort, stock, newArrivals } = req.query;
      
      let query = {};
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (stock === 'true') {
        query.stock = { $gt: 0 };
      }
      
      if (newArrivals === 'true') {
        query.isNew = true;
      }
      
      let sortOption = {};
      switch (sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
      
      const products = await Product.find(query).sort(sortOption);
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}