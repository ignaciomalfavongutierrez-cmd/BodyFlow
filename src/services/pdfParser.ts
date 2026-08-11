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
 * Resizes and compresses any image file (JPEG, PNG, HEIC, WEBP) to max 1600px and 0.8 JPEG quality.
 * Reduces payload from ~15MB to ~200KB, preventing HTTP 413 errors on server proxies.
 */
export async function compressImageFile(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxDim = Math.max(img.width, img.height)
      const scale = maxDim > 1600 ? 1600 / maxDim : 1.0

      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto 2D del canvas.'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1)
      resolve({
        mimeType: 'image/jpeg',
        data: base64,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Error al cargar la imagen para compresión.'))
    }
    img.src = url
  })
}

/**
 * Renders PDF pages to compressed JPEG images (max 1600px, 0.8 quality).
 * Used when PDF client-side text extraction yields < 50 chars (scanned/vector Apple PDFs).
 * Keeps payload lightweight (~250KB/page) to prevent HTTP 413 errors on iOS.
 */
export async function renderPdfPagesToCompressedImages(file: File): Promise<{ mimeType: string; data: string }[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file)
  const typedArray = new Uint8Array(arrayBuffer)
  const pdf = await getPdfDocument(typedArray)

  const pagesData: { mimeType: string; data: string }[] = []
  const maxPages = Math.min(pdf.numPages, 5)

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const unscaledViewport = page.getViewport({ scale: 1.0 })

    const maxDim = Math.max(unscaledViewport.width, unscaledViewport.height)
    const scale = maxDim > 1600 ? 1600 / maxDim : 1.5
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (context) {
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1)
      pagesData.push({
        mimeType: 'image/jpeg',
        data: base64,
      })
    }
  }

  return pagesData
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
        .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
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

