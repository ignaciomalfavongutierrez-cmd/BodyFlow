import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import Tesseract from 'tesseract.js'

// Worker fallback URL using jsDelivr CDN matching pdfjs-dist version
const CDN_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '5.6.205'}/build/pdf.worker.min.mjs`

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl || CDN_WORKER_URL

/**
 * Converts a File object to base64 string safely across all browsers (including iOS Safari).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result as string
      const base64 = res.substring(res.indexOf(',') + 1)
      resolve(base64)
    }
    reader.onerror = (err) => reject(err || new Error('Error al leer el archivo como base64.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Reads a File as ArrayBuffer with fallback for iOS Safari FileReader issues.
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (file.arrayBuffer) {
    try {
      const ab = await file.arrayBuffer()
      if (ab && ab.byteLength > 0) return ab
    } catch (e) {
      console.warn('file.arrayBuffer() falló en Safari/iOS, usando FileReader fallback:', e)
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('FileReader no devolvió un ArrayBuffer.'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('Error al leer el archivo con FileReader.'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Gets PDF document from Uint8Array with CMaps and standard fonts for Apple PDFs decoding.
 */
async function getPdfDocument(typedArray: Uint8Array) {
  const version = pdfjsLib.version || '5.6.205'
  const options = {
    data: typedArray,
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/standard_fonts/`,
    verbosity: 0,
  }

  try {
    const loadingTask = pdfjsLib.getDocument(options)
    return await loadingTask.promise
  } catch (err: any) {
    console.warn('Fallo al cargar PDF.js con worker local, reintentando con CDN worker...', err)
    pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_WORKER_URL
    const loadingTask = pdfjsLib.getDocument(options)
    return await loadingTask.promise
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('El archivo PDF está vacío o no se pudo leer correctamente.')
    }

    const typedArray = new Uint8Array(arrayBuffer)
    const pdf = await getPdfDocument(typedArray)

    let fullText = ''

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      let pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      // Fallback a OCR si el texto extraído es muy escaso (PDF escaneado o imagen)
      if (pageText.trim().length < 50) {
        try {
          const scale = 1.8 // Escala optimizada para dispositivos móviles (evita crash de memoria en canvas de iOS)
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

            const result = await Tesseract.recognize(canvas, 'spa+eng', {
              logger: m => console.log(m)
            })
            if (result && result.data && result.data.text) {
              pageText = result.data.text
            }
          }
        } catch (ocrError) {
          console.warn(`Error en OCR para la página ${pageNum}:`, ocrError)
        }
      }

      fullText += pageText + '\n\n'
    }

    return fullText.trim()
  } catch (error: any) {
    console.error('Error extrayendo texto del PDF:', error)
    throw new Error(error.message || 'Failed to parse PDF file. Ensure it is a valid PDF containing text.')
  }
}

