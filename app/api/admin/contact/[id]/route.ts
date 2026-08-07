import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    await connectToDatabase();
    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    await connectToDatabase();
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Contact message deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete contact' },
      { status: 500 }
    );
  }
}