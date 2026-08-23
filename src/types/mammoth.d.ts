declare module 'mammoth' {
  export interface ExtractResult {
    value: string;
    messages: any[];
  }

  export function extractRawText(options: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }): Promise<ExtractResult>;
  export function convertToHtml(options: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }): Promise<ExtractResult>;
}
