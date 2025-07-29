import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/utils/mongoClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received resume save request:', { 
      userId: body.userId, 
      jobTitle: body.jobTitle,
      hasOriginalResume: !!body.originalResume,
      hasTailoredResume: !!body.tailoredResume,
      hasJobDescription: !!body.hasJobDescription
    });

    // Check if database is enabled
    if (process.env.ENABLE_DATABASE === 'false') {
      console.log('Database operations disabled');
      return NextResponse.json({ 
        success: true, 
        message: 'Database save disabled',
        id: 'local-only'
      });
    }

    // Validate required fields
    if (!body.userId || !body.tailoredResume) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: userId and tailoredResume' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    console.log('MongoDB client connected successfully');
    
    const db = client.db('nexium'); // Specify database name
    const collection = db.collection('resumes');
    
    const resumeDocument = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting resume document...');
    const result = await collection.insertOne(resumeDocument);
    console.log('Resume saved successfully:', result.insertedId);
    
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Resume save error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Database error: ${(error as Error).message}` 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }
    
    console.log('Fetching resumes for userId:', userId);
    const client = await clientPromise;
    const db = client.db('nexium'); // Specify database name
    const collection = db.collection('resumes');
    const resumes = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    
    console.log('Found resumes:', resumes.length);
    return NextResponse.json({ success: true, resumes });
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Database error: ${(error as Error).message}` 
    }, { status: 500 });
  }
} 