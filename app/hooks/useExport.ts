import { useCallback } from 'react';
import type { Project } from '../types';
import { gridToCanvas, downloadCanvas, getStitchCounts } from '../utils/exportUtils';

export function useExport() {
  const exportPNG = useCallback((project: Project) => {
    const canvas = gridToCanvas(project.grid, 20);
    downloadCanvas(canvas, `${project.name}.png`);
  }, []);

  const exportPDF = useCallback(async (project: Project) => {
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: project.cols > project.rows ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    pdf.setFontSize(20);
    pdf.text(project.name, margin, margin + 5);

    pdf.setFontSize(12);
    pdf.text(`${project.cols} × ${project.rows} stitches`, margin, margin + 12);

    const canvas = gridToCanvas(project.grid, 10);
    const imgData = canvas.toDataURL('image/png');

    const maxImgWidth = pageWidth - margin * 2;
    const maxImgHeight = pageHeight - margin * 2 - 40;

    const imgAspect = canvas.width / canvas.height;
    let imgWidth = maxImgWidth;
    let imgHeight = imgWidth / imgAspect;

    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = imgHeight * imgAspect;
    }

    const imgX = (pageWidth - imgWidth) / 2;
    pdf.addImage(imgData, 'PNG', imgX, margin + 18, imgWidth, imgHeight);

    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Stitch Count', margin, margin + 5);

    const counts = getStitchCounts(project.grid);
    const sortedCounts = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

    let yPos = margin + 15;
    const swatchSize = 6;
    const rowHeight = 10;

    pdf.setFontSize(10);
    pdf.text('Color', margin, yPos);
    pdf.text('Hex', margin + 15, yPos);
    pdf.text('Count', margin + 50, yPos);
    yPos += 5;

    for (const [hexColor, count] of sortedCounts) {
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin + 10;
      }

      pdf.setFillColor(hexColor);
      pdf.rect(margin, yPos - 4, swatchSize, swatchSize, 'F');

      pdf.setTextColor(0, 0, 0);
      pdf.text(hexColor.toUpperCase(), margin + 15, yPos);
      pdf.text(count.toString(), margin + 50, yPos);

      yPos += rowHeight;
    }

    const totalStitches = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    yPos += 5;
    pdf.setFontSize(12);
    pdf.text(`Total: ${totalStitches} stitches`, margin, yPos);

    pdf.save(`${project.name}.pdf`);
  }, []);

  return { exportPNG, exportPDF };
}
