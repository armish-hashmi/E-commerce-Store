import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Review } from '@/lib/models/Review';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const sort = searchParams.get('sort') || 'newest';
    const ratingFilter = searchParams.get('rating');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const filter: any = { productId, hidden: false };
    if (ratingFilter) filter.rating = Number(ratingFilter);

    const sortMap: Record<string, any> = {
      newest: { createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
      helpful: { helpfulCount: -1, createdAt: -1 },
    };

    const reviews = await Review.find(filter).sort(sortMap[sort] || sortMap.newest);
    const allForProduct = await Review.find({ productId, hidden: false });
    const totalReviews = allForProduct.length;
    const averageRating =
      totalReviews > 0
        ? allForProduct.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return NextResponse.json({
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 });
    }

    const { productId, orderId, rating, comment } = await req.json();

    if (!productId || !orderId || !rating) {
      return NextResponse.json({ error: 'productId, orderId, and rating are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.customerEmail?.toLowerCase() !== session.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You can only review your own orders' }, { status: 403 });
    }
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'You can only review products after your order has been delivered' },
        { status: 400 }
      );
    }

    const purchasedItem = order.items.find((item: any) => item.productId?.toString() === productId);
    if (!purchasedItem) {
      return NextResponse.json({ error: 'This product was not part of the specified order' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.email });
    const existing = await Review.findOne({ productId, orderId, userEmail: session.email });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment || '';
      await existing.save();
      return NextResponse.json(existing);
    }

    const review = await Review.create({
      productId,
      orderId,
      userEmail: session.email,
      userName: user?.name || 'Anonymous',
      rating,
      comment: comment || '',
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit review' }, { status: 500 });
  }
}