import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

/**
 * 导出指定元素为PDF
 * @param elementId - 要导出的元素ID
 * @param options - 导出选项
 */
export const exportToPDF = async (
  elementId: string, 
  options: PDFExportOptions = {}
): Promise<void> => {
  const {
    filename = 'career-profile-analysis.pdf',
    quality = 1.0,
    format = 'a4',
    orientation = 'portrait'
  } = options;

  try {
    console.log('🔄 [PDF Export] Starting PDF export process...');
    
    // 获取要导出的元素
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    console.log('📸 [PDF Export] Capturing element as canvas...');
    
    // 使用html2canvas将元素转换为canvas
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });

    console.log('📄 [PDF Export] Creating PDF document...');
    
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    // 获取PDF页面尺寸
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 计算图片尺寸以适应PDF页面
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    
    // 居中放置
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    // 将canvas转换为图片数据
    const imgData = canvas.toDataURL('image/png');
    
    // 添加图片到PDF
    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    
    console.log('💾 [PDF Export] Saving PDF file...');
    
    // 保存PDF
    pdf.save(filename);
    
    console.log('✅ [PDF Export] PDF exported successfully!');
    
  } catch (error) {
    console.error('❌ [PDF Export] Error exporting PDF:', error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * 导出整个职业画像分析为PDF
 */
export const exportCareerProfileToPDF = async (): Promise<void> => {
  return exportToPDF('career-profile-export-content', {
    filename: `career-profile-analysis-${new Date().toISOString().split('T')[0]}.pdf`,
    quality: 1.2,
    format: 'a4',
    orientation: 'portrait'
  });
};

/**
 * 导出左侧面板（自我认知部分）为PDF
 */
export const exportSelfCognitionToPDF = async (): Promise<void> => {
  return exportToPDF('self-cognition-panel', {
    filename: `self-cognition-analysis-${new Date().toISOString().split('T')[0]}.pdf`,
    quality: 1.2,
    format: 'a4',
    orientation: 'portrait'
  });
};
