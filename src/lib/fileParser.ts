import * as mammoth from 'mammoth';

export interface ParsedFileContent {
  fileName: string;
  fileType: string;
  originalSize: number;
  extractedText: string;
  extractedTextLength: number;
  parseSuccess: boolean;
  parseError?: string;
}

/**
 * 解析上传的文件并提取文本内容
 */
export async function parseFile(file: File): Promise<ParsedFileContent> {
  const result: ParsedFileContent = {
    fileName: file.name,
    fileType: file.type,
    originalSize: file.size,
    extractedText: '',
    extractedTextLength: 0,
    parseSuccess: false
  };

  try {
    if (file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
        file.name.toLowerCase().endsWith('.docx')) {
      // 解析Word文档
      console.log(`📄 解析Word文档: ${file.name}`);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mammothResult = await mammoth.extractRawText({ buffer });

      result.extractedText = mammothResult.value.trim();
      result.extractedTextLength = result.extractedText.length;
      result.parseSuccess = true;

      if (mammothResult.messages && mammothResult.messages.length > 0) {
        console.log('📋 Word解析消息:', mammothResult.messages);
      }
      
    } else if (file.type.includes('application/pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      // PDF文件暂时不支持解析，但可以扩展
      console.log(`📄 PDF文件暂不支持解析: ${file.name}`);
      result.extractedText = '[PDF文件内容 - 暂不支持自动解析，请手动输入关键信息]';
      result.extractedTextLength = result.extractedText.length;
      result.parseSuccess = false;
      result.parseError = 'PDF parsing not implemented';
      
    } else if (file.type.includes('text/') || 
               file.name.toLowerCase().endsWith('.txt') ||
               file.name.toLowerCase().endsWith('.md')) {
      // 纯文本文件
      console.log(`📄 解析文本文件: ${file.name}`);
      
      result.extractedText = await file.text();
      result.extractedTextLength = result.extractedText.length;
      result.parseSuccess = true;
      
    } else {
      // 其他文件类型，尝试作为文本读取
      console.log(`📄 尝试作为文本读取: ${file.name}`);
      
      const text = await file.text();
      
      // 检查是否包含大量二进制字符
      const binaryCharCount = (text.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length;
      const binaryRatio = binaryCharCount / text.length;
      
      if (binaryRatio > 0.3) {
        // 可能是二进制文件
        result.extractedText = '[二进制文件 - 无法解析文本内容，请上传文本文件或Word文档]';
        result.extractedTextLength = result.extractedText.length;
        result.parseSuccess = false;
        result.parseError = 'Binary file detected';
      } else {
        // 可能是文本文件
        result.extractedText = text.trim();
        result.extractedTextLength = result.extractedText.length;
        result.parseSuccess = true;
      }
    }
    
  } catch (error) {
    console.error(`❌ 文件解析失败 ${file.name}:`, error);
    result.extractedText = `[文件解析失败: ${error instanceof Error ? error.message : String(error)}]`;
    result.extractedTextLength = result.extractedText.length;
    result.parseSuccess = false;
    result.parseError = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * 批量解析文件
 */
export async function parseFiles(files: File[]): Promise<ParsedFileContent[]> {
  const results: ParsedFileContent[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`📁 解析文件 ${i + 1}/${files.length}: ${file.name}`);
    
    const result = await parseFile(file);
    results.push(result);
    
    // 显示解析结果摘要
    console.log(`✅ 文件解析完成: ${file.name}`, {
      解析成功: result.parseSuccess,
      提取文本长度: result.extractedTextLength,
      文本预览: result.extractedText.substring(0, 200) + (result.extractedText.length > 200 ? '...' : '')
    });
  }
  
  return results;
}

/**
 * 将解析结果格式化为AI可读的文本
 */
export function formatParsedContentForAI(parsedFiles: ParsedFileContent[]): string {
  if (parsedFiles.length === 0) {
    return 'No files uploaded';
  }
  
  let formattedContent = '';
  
  parsedFiles.forEach((parsed, index) => {
    formattedContent += `\n=== 文件 ${index + 1}: ${parsed.fileName} ===\n`;
    formattedContent += `文件类型: ${parsed.fileType}\n`;
    formattedContent += `文件大小: ${(parsed.originalSize / 1024).toFixed(1)}KB\n`;
    formattedContent += `解析状态: ${parsed.parseSuccess ? '成功' : '失败'}\n`;
    
    if (parsed.parseError) {
      formattedContent += `解析错误: ${parsed.parseError}\n`;
    }
    
    formattedContent += `提取的文本内容:\n${parsed.extractedText}\n`;
    formattedContent += `=== 文件 ${parsed.fileName} 结束 ===\n`;
  });
  
  return formattedContent;
}
