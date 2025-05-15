import { hashPassword } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  if (!email || !email.includes('@') || !password || password.trim().length < 7) {
    return res.status(422).json({ message: 'Invalid input' });
  }

  await connectToDatabase();

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(422).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}