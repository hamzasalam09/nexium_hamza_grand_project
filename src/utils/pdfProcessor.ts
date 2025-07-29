// PDF processing utility with robust worker handling
import type { PDFDocumentProxy, LoadingTask } from 'pdfjs-dist';

interface PDFTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PDFProcessor {
  private static pdfjsLib: any = null;
  private static workerConfigured = false;

  static async initialize() {
    if (!this.pdfjsLib) {
      this.pdfjsLib = await import('pdfjs-dist');
      await this.configureWorker();
    }
    return this.pdfjsLib;
  }

  private static async configureWorker() {
    if (this.workerConfigured) return;

    const pdfjsLib = this.pdfjsLib;
    
    // Set worker source with fallback strategy
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      
      console.log('PDF worker configured:', workerUrl);
      this.workerConfigured = true;
    }
  }

  static async extractTextFromFile(file: File): Promise<string> {
    try {
      console.log('Starting PDF processing with robust handler...');
      
      // Initialize PDF.js
      const pdfjsLib = await this.initialize();
      
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Validate PDF format
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = Array.from(uint8Array.slice(0, 5))
        .map(byte => String.fromCharCode(byte))
        .join('');
      
      if (!header.startsWith('%PDF')) {
        throw new Error('INVALID_PDF_FORMAT');
      }

      // Simple PDF configuration to avoid network issues
      const pdfConfig = {
        data: arrayBuffer,
        verbosity: 0,
        useSystemFonts: false,
        disableFontFace: true,
        isEvalSupported: false
      };

      // Load PDF with timeout
      const pdf = await this.loadPDFWithRetry(pdfjsLib, pdfConfig);
      
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      // Extract text from all pages
      const fullText = await this.extractTextFromPages(pdf);
      
      // Cleanup
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pdf as any).destroy?.();
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (!fullText || fullText.length < 10) {
        throw new Error('NO_TEXT_EXTRACTED');
      }
      
      console.log(`Successfully extracted ${fullText.length} characters from PDF`);
      return fullText;
      
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw this.createUserFriendlyError(error as Error);
    }
  }

  private static async loadPDFWithRetry(pdfjsLib: any, config: any, maxRetries = 2): Promise<PDFDocumentProxy> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`PDF loading attempt ${attempt + 1}/${maxRetries + 1}`);
        
        const loadingTask = pdfjsLib.getDocument(config);
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (loadingTask as any).destroy?.();
            } catch (e) {
              // Ignore cleanup errors
            }
            reject(new Error('PDF_LOAD_TIMEOUT'));
          }, 15000); // 15 second timeout
        });
        
        // Race between loading and timeout
        const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
        
        console.log('PDF loaded successfully on attempt', attempt + 1);
        return pdf;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`PDF loading attempt ${attempt + 1} failed:`, lastError.message);
        
        // Try different worker source on worker-related errors
        if (attempt < maxRetries && (lastError.message.includes('worker') || lastError.message.includes('fetch'))) {
          console.log('Trying local worker fallback...');
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError || new Error('PDF loading failed after all retries');
  }

  private static async extractTextFromPages(pdf: PDFDocumentProxy): Promise<string> {
    let fullText = '';
    let processedPages = 0;
    const maxPages = Math.min(pdf.numPages, 15);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}...`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        if (textContent?.items && textContent.items.length > 0) {
          const pageText = this.processTextItems(textContent.items);
          
          if (pageText.trim()) {
            fullText += pageText.trim() + '\n\n';
            processedPages++;
          }
        }
        
        // Cleanup page
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (page as any).cleanup?.();
        } catch (e) {
          // Ignore cleanup errors
        }
        
      } catch (pageError) {
        console.warn(`Failed to process page ${pageNum}:`, pageError);
        // Continue with next page
      }
    }
    
    console.log(`Processed ${processedPages}/${maxPages} pages`);
    return fullText.trim().replace(/\n{3,}/g, '\n\n');
  }

  private static processTextItems(items: any[]): string {
    // Convert items to structured text objects
    const textItems: PDFTextItem[] = items
      .filter((item: any) => item?.str && typeof item.str === 'string')
      .map((item: any) => ({
        text: item.str.trim().replace(/\s+/g, ' '),
        x: item.transform?.[4] || 0,
        y: item.transform?.[5] || 0,
        width: item.width || 0,
        height: item.height || 0
      }))
      .filter((item: PDFTextItem) => item.text.length > 0);

    if (textItems.length === 0) return '';

    // Sort by position (Y descending, then X ascending)
    textItems.sort((a, b) => {
      const yDiff = Math.abs(a.y - b.y);
      if (yDiff < 5) { // Same line tolerance
        return a.x - b.x;
      }
      return b.y - a.y;
    });

    // Join text with appropriate spacing
    let result = '';
    let lastY: number | null = null;

    for (const item of textItems) {
      const currentY = Math.round(item.y);

      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        result += '\n';
      } else if (result.length > 0 && !result.endsWith(' ') && !item.text.startsWith(' ')) {
        result += ' ';
      }

      result += item.text;
      lastY = currentY;
    }

    return result;
  }

  private static createUserFriendlyError(error: Error): Error {
    const errorCode = error.message;
    let userMessage = '';

    switch (errorCode) {
      case 'INVALID_PDF_FORMAT':
        userMessage = 'Invalid PDF file format. Please ensure you have selected a valid PDF document.';
        break;
      case 'PDF_LOAD_TIMEOUT':
        userMessage = 'PDF processing timed out. The file may be too large or complex. Please try converting to TXT format.';
        break;
      case 'NO_TEXT_EXTRACTED':
        userMessage = 'No readable text found in this PDF. This may be a scanned/image-based PDF. Please try converting to TXT or DOCX format.';
        break;
      default:
        if (errorCode.includes('worker') || errorCode.includes('fetch') || errorCode.includes('network')) {
          userMessage = 'PDF processing service temporarily unavailable. Please try refreshing the page or converting to TXT format.';
        } else if (errorCode.includes('password') || errorCode.includes('encrypted')) {
          userMessage = 'This PDF is password-protected. Please remove password protection or convert to TXT format.';
        } else {
          userMessage = `PDF processing failed. Please try converting to TXT or DOCX format.\n\nError: ${errorCode}`;
        }
    }

    return new Error(userMessage);
  }
}
