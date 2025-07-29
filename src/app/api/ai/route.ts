import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription, jobTitle } = await req.json();
    
    if (!resume || !jobDescription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Resume and job description are required' 
      }, { status: 400 });
    }

    // Try N8N webhook first
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        console.log('Attempting N8N webhook:', webhookUrl);

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'NEXIUM-Resume-Tailor/1.0'
          },
          body: JSON.stringify({ 
            resume, 
            jobDescription, 
            jobTitle: jobTitle || 'Position',
            timestamp: new Date().toISOString()
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({ 
            success: true, 
            tailoredResume: data.tailoredResume || data.aiResume || data.result || data 
          });
        } else {
          console.warn(`N8N webhook failed with status: ${response.status}`);
        }
      } catch (error) {
        console.warn('N8N webhook error:', error);
      }
    }

    // Fallback to OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service not configured. Please check your API configuration.' 
      }, { status: 500 });
    }

    console.log('Using OpenAI fallback for resume tailoring');

    const prompt = `You are an expert resume tailoring assistant. Please tailor the following resume for the specific job position.

Job Title: ${jobTitle || 'Position'}

Job Description:
${jobDescription}

Original Resume:
${resume}

Instructions:
1. Tailor the resume to match the job requirements
2. Highlight relevant skills and experience
3. Use keywords from the job description
4. Maintain the original format and structure
5. Keep all factual information accurate
6. Make the resume more compelling for this specific role
7. IMPORTANT: Return ONLY the tailored resume content. Do not include any commentary, advice, or explanatory text.

Tailored Resume:`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer. Return only the tailored resume content without any commentary, advice, or explanatory text. Do not include phrases like "This resume focuses on" or "Good luck with your application" or any other guidance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API responded with status: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    let tailoredResume = openaiData.choices[0]?.message?.content || '';

    if (!tailoredResume) {
      throw new Error('No response received from AI service');
    }

    // Clean up any AI-generated commentary or advice
    tailoredResume = tailoredResume
      .split('\n')
      .filter((line: string) => {
        const lowerLine = line.toLowerCase().trim();
        // Remove lines that contain AI commentary
        return !lowerLine.includes('this resume') &&
               !lowerLine.includes('this tailored resume') &&
               !lowerLine.includes('good luck') &&
               !lowerLine.includes('make sure to') &&
               !lowerLine.includes('emphasizing') &&
               !lowerLine.includes('aligns well') &&
               !lowerLine.includes('further elaborate') &&
               !lowerLine.includes('cover letter') &&
               !lowerLine.includes('during interviews') &&
               !lowerLine.includes('focuses on') &&
               !lowerLine.includes('highlights your') &&
               !lowerLine.startsWith('note:') &&
               !lowerLine.startsWith('tip:') &&
               line.trim() !== '';
      })
      .join('\n')
      .trim();

    return NextResponse.json({ 
      success: true, 
      tailoredResume: tailoredResume
    });
    
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `AI processing failed: ${(error as Error).message}` 
    }, { status: 500 });
  }
} 