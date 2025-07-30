import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongoClient';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Check if database is enabled
    if (process.env.ENABLE_DATABASE === 'false') {
      return NextResponse.json({
        status: 'disabled',
        message: 'Database operations are disabled'
      });
    }

    const client = await clientPromise;
    const db = client.db('nexium');
    
    // Test connection by pinging the database
    await db.admin().ping();
    
    // Get database stats
    const stats = await db.stats();
    
    return NextResponse.json({
      status: 'connected',
      message: 'MongoDB connection successful',
      database: 'nexium',
      collections: stats.collections || 0,
      dataSize: stats.dataSize || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
