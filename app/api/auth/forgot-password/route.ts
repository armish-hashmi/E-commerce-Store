import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getResend } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const resend = getResend();
    await resend.emails.send({
      from: 'Your Store <onboarding@resend.dev>',  
      to: user.email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}