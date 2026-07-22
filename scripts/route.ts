import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth-server';
import * as dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });


export async function GET() {
  try {
    await connectToDatabase();

    const adminEmail = 'admin@store.com';
    const rawPassword = 'admin123'; 
    const hashedPassword = await hashPassword(rawPassword);

    const hashedPassword = await hashPassword(rawPassword);

    const adminUser = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'Primary Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Admin account created successfully!',
      credentials: {
        email: adminEmail,
        password: rawPassword,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed admin.' }, { status: 500 });
  }
}

