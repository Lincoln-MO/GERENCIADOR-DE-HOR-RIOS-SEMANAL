'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph } from 'docx';
import { TaskEvent } from '@/mvc/models/task.model';

async function captureElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(Math.max(element.scrollWidth, rect.width));
  const height = Math.ceil(Math.max(element.scrollHeight, rect.height));

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0b132b',
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: -window.scrollY
  });
}


export async function exportAsPdf(element: HTMLElement) {
  try {
    const canvas = await captureElement(element);
    const imgData = canvas.toDataURL('image/png');

    const isLandscape = canvas.width >= canvas.height;
    const pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    pdf.save('planejador-semanal.pdf');
  } catch {
    window.alert('Não foi possível exportar para PDF. Tente novamente.');
  }
}

export async function exportAsPng(element: HTMLElement) {
  try {
    const canvas = await captureElement(element);
    const link = document.createElement('a');
    link.download = 'planejador-semanal.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch {
    window.alert('Não foi possível exportar para PNG. Tente novamente.');
  }
}

export function exportAsExcel(tasks: TaskEvent[]) {
  const sheet = XLSX.utils.json_to_sheet(tasks);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Planejamento');
  XLSX.writeFile(workbook, 'planejador-semanal.xlsx');
}

export async function exportAsDocx(tasks: TaskEvent[]) {
  const doc = new Document({
    sections: [{
      children: tasks.map((task) => new Paragraph(`${task.title} (${task.start} - ${task.end})`))
    }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.download = 'planejador-semanal.docx';
  link.href = URL.createObjectURL(blob);
  link.click();
}