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

    try {
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
    } catch (dbError) {
      // Handle MongoDB connection/operation errors gracefully
      console.error('MongoDB operation failed:', (dbError as Error).message);
      
      // If it's a connection error, return success but indicate it wasn't saved
      if ((dbError as Error).name === 'MongoServerSelectionError' || 
          (dbError as Error).name === 'MongoNetworkError' ||
          (dbError as Error).message.includes('SSL') ||
          (dbError as Error).message.includes('TLS')) {
        
        console.log('MongoDB unavailable, continuing without database save');
        return NextResponse.json({ 
          success: true, 
          message: 'Resume processed successfully (database temporarily unavailable)',
          id: 'local-only'
        });
      }
      
      // For other database errors, throw to outer catch
      throw dbError;
    }
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
    
    // Check if database is enabled
    if (process.env.ENABLE_DATABASE === 'false') {
      console.log('Database operations disabled');
      return NextResponse.json({ 
        success: true, 
        resumes: [],
        message: 'Database queries disabled'
      });
    }
    
    try {
      console.log('Fetching resumes for userId:', userId);
      const client = await clientPromise;
      const db = client.db('nexium'); // Specify database name
      const collection = db.collection('resumes');
      const resumes = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
      
      console.log('Found resumes:', resumes.length);
      return NextResponse.json({ success: true, resumes });
    } catch (dbError) {
      // Handle MongoDB connection/operation errors gracefully
      console.error('MongoDB fetch operation failed:', (dbError as Error).message);
      
      // If it's a connection error, return empty array
      if ((dbError as Error).name === 'MongoServerSelectionError' || 
          (dbError as Error).name === 'MongoNetworkError' ||
          (dbError as Error).message.includes('SSL') ||
          (dbError as Error).message.includes('TLS')) {
        
        console.log('MongoDB unavailable, returning empty results');
        return NextResponse.json({ 
          success: true, 
          resumes: [],
          message: 'Database temporarily unavailable'
        });
      }
      
      // For other database errors, throw to outer catch
      throw dbError;
    }
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Database error: ${(error as Error).message}` 
    }, { status: 500 });
  }
} 