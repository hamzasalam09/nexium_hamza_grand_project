import { NextRequest, NextResponse } from 'next/server';
import { getEnvConfig, debugEnvironment } from '@/utils/config';

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription, jobTitle } = await req.json();
    
    if (!resume || !jobDescription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Resume and job description are required' 
      }, { status: 400 });
    }

    // Get configuration with enhanced environment variable access
    const config = getEnvConfig();
    const envDebug = debugEnvironment();
    
    console.log('Environment debugging:', envDebug);

    // Try N8N webhook first with better error handling
    const webhookUrl = config.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        console.log('Attempting N8N webhook:', webhookUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'NEXIUM-Resume-Tailor/1.0',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            resume, 
            jobDescription, 
            jobTitle: jobTitle || 'Position',
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('N8N webhook successful');
          return NextResponse.json({ 
            success: true, 
            tailoredResume: data.tailoredResume || data.aiResume || data.result || data 
          });
        } else {
          console.warn(`N8N webhook failed with status: ${response.status}`);
          const errorText = await response.text();
          console.warn('N8N webhook error response:', errorText);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.warn('N8N webhook timeout');
        } else {
          console.warn('N8N webhook error:', (error as Error).message);
        }
      }
    } else {
      console.log('N8N webhook URL not configured, using OpenAI fallback');
    }

    // Fallback to OpenAI API
    const openaiApiKey = config.OPENAI_API_KEY;
    
    // Debug environment variable access
    console.log('Environment check:', {
      OPENAI_API_KEY_exists: !!openaiApiKey,
      OPENAI_API_KEY_type: typeof openaiApiKey,
      OPENAI_API_KEY_length: openaiApiKey?.length || 0,
      OPENAI_API_KEY_empty: openaiApiKey === '',
      all_env_keys_count: Object.keys(process.env).length,
      openai_related_keys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
    });
    
    if (!openaiApiKey || openaiApiKey.trim() === '') {
      console.error('OpenAI API key not found or empty');
      return NextResponse.json({ 
        success: false, 
        error: `AI service not configured. API key status: ${!openaiApiKey ? 'missing' : 'empty'}. Environment has ${Object.keys(process.env).length} keys.` 
      }, { status: 500 });
    }

    console.log('Using OpenAI fallback for resume tailoring');

    const prompt = `You are an expert resume tailoring assistant. Please tailor the following resume for the specific job position with proper formatting and clear headings.

Job Title: ${jobTitle || 'Position'}

Job Description:
${jobDescription}

Original Resume:
${resume}

Instructions:
1. Format the resume with clear section headings (use ALL CAPS for main sections)
2. Include these standard sections with proper headings:
   - CONTACT INFORMATION (name, phone, email, location)
   - PROFESSIONAL SUMMARY or OBJECTIVE
   - WORK EXPERIENCE or PROFESSIONAL EXPERIENCE
   - EDUCATION
   - SKILLS (Technical Skills, Core Competencies, etc.)
   - CERTIFICATIONS (if applicable)
   - PROJECTS (if applicable)
3. Tailor the content to match the job requirements
4. Highlight relevant skills and experience
5. Use keywords from the job description
6. Keep all factual information accurate
7. Make the resume more compelling for this specific role
8. Use bullet points (•) for experience items and skills
9. Format dates consistently (Month Year - Month Year)
10. IMPORTANT: Return ONLY the tailored resume content with proper headings. Do not include any commentary, advice, or explanatory text.

Format Example:
[NAME]
[Contact Information]

PROFESSIONAL SUMMARY
[Summary paragraph]

WORK EXPERIENCE
[Company] | [Title] | [Dates]
• [Achievement/responsibility]
• [Achievement/responsibility]

EDUCATION
[Degree] | [School] | [Year]

SKILLS
• [Skill category]: [Skills list]

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
            content: 'You are a professional resume writer. Format resumes with clear section headings in ALL CAPS, use bullet points for lists, and maintain professional formatting. Return only the tailored resume content without any commentary, advice, or explanatory text. Use consistent formatting throughout.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
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

    // Clean up any AI-generated commentary or advice and format headings
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
      .map((line: string) => {
        // Format common section headings consistently
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
          // Check if line appears to be a section heading (standalone line with no bullet points or colons at the end)
          const isHeading = trimmedLine.length < 50 && 
                           !trimmedLine.includes('•') && 
                           !trimmedLine.includes('|') &&
                           !trimmedLine.includes('@') &&
                           !trimmedLine.includes('(') &&
                           !trimmedLine.includes(')') &&
                           !trimmedLine.endsWith(':') &&
                           (trimmedLine.toLowerCase().includes('experience') ||
                            trimmedLine.toLowerCase().includes('education') ||
                            trimmedLine.toLowerCase().includes('skills') ||
                            trimmedLine.toLowerCase().includes('summary') ||
                            trimmedLine.toLowerCase().includes('objective') ||
                            trimmedLine.toLowerCase().includes('certification') ||
                            trimmedLine.toLowerCase().includes('project') ||
                            trimmedLine.toLowerCase().includes('contact') ||
                            trimmedLine.toLowerCase().includes('achievement') ||
                            trimmedLine.toLowerCase().includes('qualification'));
          
          if (isHeading) {
            return trimmedLine.toUpperCase();
          }
        }
        return line;
      })
      .join('\n')
      .trim();

    // Add extra formatting for better structure
    tailoredResume = tailoredResume
      .replace(/\n([A-Z\s]+)\n/g, '\n\n$1\n')  // Add space before/after headings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
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