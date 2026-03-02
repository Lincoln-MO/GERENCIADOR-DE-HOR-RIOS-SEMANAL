'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph } from 'docx';
import { TaskEvent } from '@/mvc/models/task.model';

async function captureElement(element: HTMLElement) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0b132b',
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight
  });
}

export async function exportAsPdf(element: HTMLElement) {
  try {
    const canvas = await captureElement(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 5;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 5;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
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