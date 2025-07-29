import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongoClient';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    const client = await clientPromise;
    console.log('Client obtained');
    
    const db = client.db('nexium');
    console.log('Database selected');
    
    const admin = db.admin();
    const result = await admin.ping();
    console.log('Ping result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      result 
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
