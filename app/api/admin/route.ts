import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    await connectToDatabase();

    await Contact.create({
      name,
      email: email.toLowerCase(),
      subject: subject || 'General Inquiry',
      message,
    });

    return NextResponse.json({ message: 'Thank you! Your message has been received.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit contact request.' }, { status: 500 });
  }
}