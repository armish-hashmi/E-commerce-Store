import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { getSession } from '@/lib/auth';
import { MOCK_PRODUCTS } from '@/data/mockData';


export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();

    let inserted = 0;
    let skipped = 0;

    for (const mock of MOCK_PRODUCTS) {
      const existing = await Product.findOne({ name: mock.name });
      if (existing) {
        skipped++;
        continue;
      }

      await Product.create({
        name: mock.name,
        price: mock.price,
        originalPrice: mock.originalPrice,
        category: mock.category,
        rating: mock.rating,
        reviewsCount: mock.reviewsCount,
        image: mock.image,
        description: mock.description,
        inStock: mock.inStock,
        isFeatured: mock.isFeatured,
      });
      inserted++;
    }

    return NextResponse.json({
      message: `Seed complete. Inserted ${inserted}, skipped ${skipped} (already existed).`,
      inserted,
      skipped,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load products' },
      { status: 500 }
    );
  }
}