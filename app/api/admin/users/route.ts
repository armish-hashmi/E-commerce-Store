import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status'); // 'active' | 'disabled' | null (all)

    await connectToDatabase();

    const filter: any = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (status === 'active') filter.isDisabled = { $ne: true };
    if (status === 'disabled') filter.isDisabled = true;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}