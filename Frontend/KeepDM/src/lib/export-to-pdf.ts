import { jsPDF } from "jspdf"
import * as htmlToImage from "html-to-image"

export type ExportElementToPdfOptions = {
  element: HTMLElement
  fileName: string
  marginMm?: number
  backgroundColor?: string
  pixelRatio?: number
}

const clampFileName = (name: string) => {
  const trimmed = name.trim() || "dashboard"
  // Keep it filesystem-friendly across OSes.
  return trimmed
    .replace(/[\\/\n\r\t]+/g, "-")
    .replace(/[:*?\"<>|]+/g, "-")
    .replace(/\s+/g, " ")
}

/**
 * Captures a DOM element into an A4 PDF and triggers a download.
 *
 * Notes:
 * - Uses raster capture (image). This works well with Recharts (SVG) in most cases.
 * - Large dashboards may span multiple pages.
 */
export async function exportElementToPdf(options: ExportElementToPdfOptions) {
  const {
    element,
    fileName,
    marginMm = 10,
    backgroundColor = "#ffffff",
    pixelRatio = 2,
  } = options

  const pngDataUrl = await htmlToImage.toPng(element, {
    cacheBust: true,
    backgroundColor,
    pixelRatio,
    filter: (node) => {
      if (!(node instanceof Element)) return true
      return node.getAttribute("data-export-ignore") !== "true"
    },
  })

  // A4 size in mm
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgProps = pdf.getImageProperties(pngDataUrl)

  const usableWidth = pageWidth - marginMm * 2
  const usableHeight = pageHeight - marginMm * 2

  // Scale image to fit page width.
  const imgWidth = usableWidth
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width

  const safeName = clampFileName(fileName)
  const finalName = safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`

  if (imgHeight <= usableHeight) {
    pdf.addImage(pngDataUrl, "PNG", marginMm, marginMm, imgWidth, imgHeight)
    pdf.save(finalName)
    return
  }

  // Multi-page: draw the same tall image, shifting it up each page.
  let remainingHeight = imgHeight
  let offsetY = 0

  while (remainingHeight > 0) {
    pdf.addImage(pngDataUrl, "PNG", marginMm, marginMm - offsetY, imgWidth, imgHeight)
    remainingHeight -= usableHeight
    offsetY += usableHeight
    if (remainingHeight > 0) pdf.addPage()
  }

  pdf.save(finalName)
}
