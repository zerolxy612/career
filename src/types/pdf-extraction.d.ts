declare module 'pdf-extraction' {
  interface PDFExtractionResult {
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      Producer: string;
      CreationDate: string;
    };
    metadata: Record<string, unknown> | null;
    text: string;
    version: string;
  }

  function extract(buffer: Buffer): Promise<PDFExtractionResult>;
  
  export = extract;
}
