declare module 'docx-pdf' {
  export default function docxPdf(input: Buffer, callback: (err: Error | null, pdfBuffer: Buffer) => void): void;
}
