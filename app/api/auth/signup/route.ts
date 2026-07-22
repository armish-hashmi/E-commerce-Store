import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth-server';

export async function GET() {
  try {
    await connectToDatabase();

    const adminEmail = 'admin@store.com';
    const rawPassword = 'admin123!';

    const hashedPassword = await hashPassword(rawPassword);

    await User.findOneAndUpdate(
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
      message: 'Admin account created/updated successfully!',
      credentials: {
        email: adminEmail,
        password: rawPassword,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to seed admin' }, { status: 500 });
  }
}