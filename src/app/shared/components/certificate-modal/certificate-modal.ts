import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { jsPDF } from 'jspdf';
import { 
  LucideAward, 
  LucideDownload, 
  LucideShare2, 
  LucideCheckCircle2, 
  LucideX, 
  LucideSparkles, 
  LucideLoader2,
  LucideExternalLink
} from '@lucide/angular';

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completedDate: string;
  certificateId: string;
  durationHours?: number;
}

@Component({
  selector: 'app-certificate-modal',
  imports: [
    LucideAward,
    LucideDownload,
    LucideShare2,
    LucideCheckCircle2,
    LucideX,
    LucideSparkles,
    LucideLoader2,
    LucideExternalLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certificate-modal.html'
})
export class CertificateModalComponent {
  readonly data = input.required<CertificateData>();
  readonly close = output<void>();

  protected readonly isGeneratingPdf = signal<boolean>(false);
  protected readonly isCopied = signal<boolean>(false);

  protected readonly verificationUrl = computed(() => {
    return `${window.location.origin}/catalog`;
  });

  copyCertificateLink(): void {
    const text = `¡Completé exitosamente el curso "${this.data().courseTitle}" en TokiDev Learning! 🚀 Certificado: ${this.data().certificateId}`;
    navigator.clipboard.writeText(text);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2500);
  }

  shareOnLinkedIn(): void {
    const title = encodeURIComponent(`Certificación: ${this.data().courseTitle}`);
    const summary = encodeURIComponent(`Acabo de completar el curso de ${this.data().courseTitle} en TokiDev Learning. Código de certificación: ${this.data().certificateId}`);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  }

  shareOnTwitter(): void {
    const text = encodeURIComponent(`¡Orgulloso de completar "${this.data().courseTitle}" en @TokiDev Learning! 🎓🚀 #TokiDev #Angular #DesarrolloWeb`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  async downloadPdf(): Promise<void> {
    if (this.isGeneratingPdf()) return;
    this.isGeneratingPdf.set(true);

    try {
      // Create landscape A4 PDF: 297mm x 210mm
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const width = 297;
      const height = 210;

      // 1. Fondo elegante oscuro TokiDev
      doc.setFillColor(11, 10, 23); // #0B0A17
      doc.rect(0, 0, width, height, 'F');

      // 2. Marco interior con borde gradiente estilizado
      doc.setDrawColor(164, 6, 233); // #A406E9
      doc.setLineWidth(1.5);
      doc.roundedRect(12, 12, width - 24, height - 24, 6, 6, 'D');

      doc.setDrawColor(218, 41, 132); // #DA2984
      doc.setLineWidth(0.6);
      doc.roundedRect(15, 15, width - 30, height - 30, 4, 4, 'D');

      // 3. Encabezado de la Plataforma
      doc.setTextColor(250, 116, 63); // #FA743F
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOKIDEV LEARNING • CERTIFICADO DE CULMINACIÓN', width / 2, 32, { align: 'center' });

      // 4. Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.text('CERTIFICADO DE RECONOCIMIENTO', width / 2, 48, { align: 'center' });

      // 5. Otorgado a
      doc.setTextColor(160, 165, 185);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('Por haber completado satisfactoriamente la totalidad de los módulos y lecciones de:', width / 2, 60, { align: 'center' });

      // 6. Nombre del Estudiante (Grande y Destacado)
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(this.data().studentName.toUpperCase(), width / 2, 78, { align: 'center' });

      // Línea divisoria decorativa bajo el nombre
      doc.setDrawColor(218, 41, 132);
      doc.setLineWidth(0.8);
      doc.line(width / 2 - 45, 83, width / 2 + 45, 83);

      // 7. En el curso
      doc.setTextColor(160, 165, 185);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('En el programa de especialización:', width / 2, 94, { align: 'center' });

      // 8. Título del Curso
      doc.setTextColor(218, 41, 132); // #DA2984
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(`"${this.data().courseTitle}"`, width / 2, 108, { align: 'center' });

      // 9. Duración y descripción
      if (this.data().durationHours) {
        doc.setTextColor(160, 165, 185);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Carga horaria acreditada: ${this.data().durationHours} horas de formación práctica y proyectos aplicados.`, width / 2, 118, { align: 'center' });
      }

      // 10. Bloque Inferior: Instructor, Fecha y Sello
      const bottomY = 160;

      // Columna Izquierda: Instructor
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(35, bottomY, 105, bottomY);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(this.data().instructorName, 70, bottomY + 6, { align: 'center' });
      doc.setTextColor(140, 145, 165);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Instructor Titular TokiDev', 70, bottomY + 11, { align: 'center' });

      // Columna Centro: Sello Digital TokiDev
      doc.setDrawColor(164, 6, 233);
      doc.setFillColor(22, 20, 53);
      doc.circle(width / 2, bottomY + 2, 14, 'FD');
      doc.setTextColor(250, 116, 63);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TOKIDEV', width / 2, bottomY, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('VERIFICADO', width / 2, bottomY + 5, { align: 'center' });

      // Columna Derecha: Fecha y Código de Validación
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(width - 105, bottomY, width - 35, bottomY);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(this.data().completedDate, width - 70, bottomY + 6, { align: 'center' });
      doc.setTextColor(140, 145, 165);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`ID: ${this.data().certificateId}`, width - 70, bottomY + 11, { align: 'center' });

      // 11. Footer pequeño
      doc.setTextColor(90, 95, 115);
      doc.setFontSize(8);
      doc.text('Verificación oficial disponible en tokidev.la/learning • Emitido por TokiDev Learning', width / 2, height - 8, { align: 'center' });

      // Guardar archivo PDF
      const sanitizedName = this.data().courseTitle.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Certificado_TokiDev_${sanitizedName}.pdf`);
    } catch (err) {
      console.error('Error generando certificado PDF:', err);
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }
}
