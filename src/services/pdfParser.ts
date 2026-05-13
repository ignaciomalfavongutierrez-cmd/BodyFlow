import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import Tesseract from 'tesseract.js'

// Set worker source to point to local node_modules dist worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    let arrayBuffer: ArrayBuffer
    if (file.arrayBuffer) {
      arrayBuffer = await file.arrayBuffer()
    } else {
      arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
    }
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    let fullText = ''
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      let pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      // Fallback a OCR con alta resolución si el texto extraído es muy poco (PDF escaneado o imagen)
      if (pageText.trim().length < 50) {
        const scale = 2.5 // Aumentar resolución (scale) para mejorar la detección
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        if (context) {
          canvas.height = viewport.height
          canvas.width = viewport.width
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          }).promise
          
          // Ejecutar OCR en español e inglés
          const result = await Tesseract.recognize(canvas, 'spa+eng', {
            logger: m => console.log(m)
          })
          pageText = result.data.text
        }
      }
      
      fullText += pageText + '\n\n'
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to parse PDF file. Ensure it is a valid PDF containing text.')
  }
}
