'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph } from 'docx';
import { TaskEvent } from '@/mvc/models/task.model';

export async function exportAsPdf(element: HTMLElement) {
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('landscape');
  pdf.addImage(imgData, 'PNG', 10, 10, 270, 160);
  pdf.save('timeplanner.pdf');
}

export async function exportAsPng(element: HTMLElement) {
  const canvas = await html2canvas(element);
  const link = document.createElement('a');
  link.download = 'timeplanner.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function exportAsExcel(tasks: TaskEvent[]) {
  const sheet = XLSX.utils.json_to_sheet(tasks);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Schedule');
  XLSX.writeFile(workbook, 'timeplanner.xlsx');
}

export async function exportAsDocx(tasks: TaskEvent[]) {
  const doc = new Document({
    sections: [{
      children: tasks.map((task) => new Paragraph(`${task.title} (${task.start} - ${task.end})`))
    }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.download = 'timeplanner.docx';
  link.href = URL.createObjectURL(blob);
  link.click();
}