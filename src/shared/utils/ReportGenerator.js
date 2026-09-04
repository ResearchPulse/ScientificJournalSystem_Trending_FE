import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export class ReportGenerator {
  constructor(projectName, projectId) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.projectName = projectName;
    this.projectId = projectId;
    this.currentY = 20;
    this.primaryColor = [37, 99, 235]; // #2563EB
  }

  async addCoverPage() {
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, 0, 210, 297, 'F');
    this.doc.setTextColor(255, 255, 255);
    
    this.doc.setFontSize(32);
    this.doc.text('RESEARCH ANALYTICS REPORT', 105, 130, { align: 'center' });
    
    this.doc.setFontSize(20);
    this.doc.text(this.projectName, 105, 150, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.text(`Project ID: ${this.projectId}`, 105, 170, { align: 'center' });
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 180, { align: 'center' });
    
    this.doc.addPage();
    this.currentY = 20;
  }

  addSectionHeader(title) {
    if (this.currentY > 250) { this.doc.addPage(); this.currentY = 20; }
    this.doc.setFontSize(18);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title, 20, this.currentY);
    this.currentY += 15;
  }

  addTable(head, body, title) {
    if (title) this.addSectionHeader(title);
    autoTable(this.doc, {
      startY: this.currentY,
      head: [head],
      body: body,
      theme: 'striped',
      headStyles: { fillColor: this.primaryColor },
    });
    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  async addChart(chartSelector) {
    const element = document.querySelector(chartSelector);
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 3, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const width = 170;
    const height = (canvas.height * width) / canvas.width;
    
    if (this.currentY + height > 280) { this.doc.addPage(); this.currentY = 20; }
    this.doc.addImage(imgData, 'PNG', 20, this.currentY, width, height);
    this.currentY += height + 10;
  }

  save() {
    this.doc.save(`${this.projectName.replace(/\s+/g, '_')}_Analytics_Report.pdf`);
  }
}
