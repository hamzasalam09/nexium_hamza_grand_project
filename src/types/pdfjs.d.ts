// Type declarations for PDF.js
declare module 'pdfjs-dist' {
  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    destroy?(): void;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
    cleanup?(): void;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface TextItem {
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
  }

  export interface LoadingTask {
    promise: Promise<PDFDocumentProxy>;
    destroy?(): void;
  }

  export interface DocumentInitParameters {
    data: ArrayBuffer | Uint8Array;
    useSystemFonts?: boolean;
    disableFontFace?: boolean;
    verbosity?: number;
    cMapUrl?: string;
    cMapPacked?: boolean;
    standardFontDataUrl?: string;
    isEvalSupported?: boolean;
    useWorkerFetch?: boolean;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptions;
  export function getDocument(src: DocumentInitParameters): LoadingTask;
  export const version: string;
}
