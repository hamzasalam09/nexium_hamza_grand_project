// This file ensures PDF.js has a worker available
// Simplified approach without complex testing

let workerInitialized = false;

if (typeof window !== 'undefined') {
  // Set up PDF.js worker for client-side usage
  import('pdfjs-dist').then((pdfjsLib) => {
    // Only set worker if not already configured
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc && !workerInitialized) {
      workerInitialized = true;
      
      // Use the most reliable worker source
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      
      console.log('PDF.js worker configured with source:', workerUrl);
    } else if (pdfjsLib.GlobalWorkerOptions.workerSrc) {
      console.log('PDF.js worker already configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    }
  }).catch((error) => {
    console.warn('PDF.js failed to load:', error);
  });
}

export {};
