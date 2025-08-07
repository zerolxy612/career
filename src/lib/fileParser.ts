import mammoth from 'mammoth';

export interface ParsedFileContent {
  fileName: string;
  fileType: string;
  originalSize: number;
  extractedText: string;
  extractedTextLength: number;
  parseSuccess: boolean;
  parseError?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    parsingMethod?: 'mammoth' | 'pdf-parse' | 'pdfjs-dist' | 'pdf-extraction' | 'pdf-extraction-failed' | 'text' | 'fallback';
  };
}

/**
 * 解析上传的文件并提取文本内容
 */
export async function parseFile(file: File): Promise<ParsedFileContent> {
  console.log('📄 [PARSER] === 开始文件解析流程 ===');
  console.log('📄 [PARSER] 输入文件信息:', {
    name: file?.name || 'undefined',
    type: file?.type || 'undefined',
    size: file?.size || 'undefined',
    sizeKB: file?.size ? (file.size / 1024).toFixed(1) + 'KB' : 'undefined',
    lastModified: file?.lastModified || 'undefined',
    isValidFile: !!(file && file.name && file.type)
  });

  const result: ParsedFileContent = {
    fileName: file?.name || 'unknown',
    fileType: file?.type || 'unknown',
    originalSize: file?.size || 0,
    extractedText: '',
    extractedTextLength: 0,
    parseSuccess: false
  };

  try {
    // 检查文件是否有效
    if (!file || !file.type || !file.name) {
      console.error('❌ [PARSER] 无效文件对象:', {
        file: file,
        hasFile: !!file,
        hasName: !!(file?.name),
        hasType: !!(file?.type),
        hasSize: !!(file?.size)
      });
      result.extractedText = '[无效文件 - 文件对象为空或缺少必要属性]';
      result.extractedTextLength = result.extractedText.length;
      result.parseSuccess = false;
      result.parseError = 'Invalid file object';
      return result;
    }

    console.log('✅ [PARSER] 文件有效性检查通过，开始解析');

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
      result.metadata = {
        parsingMethod: 'mammoth',
        wordCount: result.extractedText.split(/\s+/).filter(word => word.length > 0).length
      };

      console.log(`✅ Word解析成功: ${file.name}`, {
        文本长度: result.extractedTextLength,
        词数: result.metadata.wordCount,
        文本预览: result.extractedText.substring(0, 200) + (result.extractedText.length > 200 ? '...' : '')
      });

      if (mammothResult.messages && mammothResult.messages.length > 0) {
        console.log('📋 Word解析消息:', mammothResult.messages);
      }
      
    } else if (file.type.includes('application/pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      // 解析PDF文档
      console.log(`📄 [PARSER] 检测到PDF文件，开始PDF解析: ${file.name}`);

      try {
        console.log('📦 [PARSER] 动态导入pdf-extraction库...');
        // 动态导入pdf-extraction库 - 使用default导出
        const pdfExtraction = await import('pdf-extraction');
        const extract = pdfExtraction.default;

        console.log('✅ [PARSER] pdf-extraction库导入成功:', {
          hasDefault: !!pdfExtraction.default,
          extractFunction: typeof extract,
          allExports: Object.keys(pdfExtraction)
        });

        // 验证extract函数是否可用
        if (typeof extract !== 'function') {
          throw new Error(`extract不是函数，类型为: ${typeof extract}`);
        }

        console.log('🔄 [PARSER] 转换文件为Buffer...');
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log('✅ [PARSER] Buffer转换完成，大小:', buffer.length, 'bytes');

        console.log('🔍 [PARSER] 开始提取PDF文本内容...');
        console.log('🔍 [PARSER] Buffer信息:', {
          bufferLength: buffer.length,
          bufferType: typeof buffer,
          isBuffer: Buffer.isBuffer(buffer)
        });

        // 提取PDF文本 - pdf-extraction只接受buffer参数
        const data = await extract(buffer);

        console.log('📊 [PARSER] PDF提取完成，原始数据:', {
          hasData: !!data,
          dataType: typeof data,
          hasText: !!data?.text,
          textLength: data?.text?.length || 0,
          pages: data?.numpages || 'unknown',
          rawDataKeys: Object.keys(data || {}),
          rawDataPreview: data ? JSON.stringify(data).substring(0, 200) : 'null'
        });

        // 清理PDF文本中的控制字符和乱码
        let cleanedText = data.text?.trim() || '';

        // 移除控制字符和不可见字符，但保留换行符和制表符
        cleanedText = cleanedText
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符，保留\t\n\r
          .replace(/\x00/g, '') // 移除null字符
          .replace(/[\uFEFF\uFFFE\uFFFF]/g, '') // 移除BOM和其他特殊字符
          .replace(/\s+/g, ' ') // 合并多个空格为单个空格
          .trim();

        // 检查清理后的文本质量
        const totalChars = cleanedText.length;
        const printableChars = cleanedText.replace(/[^\x20-\x7E\u4e00-\u9fff]/g, '').length;
        const textQuality = totalChars > 0 ? printableChars / totalChars : 0;

        console.log('🧹 [PARSER] PDF文本清理结果:', {
          原始长度: data.text?.length || 0,
          清理后长度: cleanedText.length,
          可打印字符比例: (textQuality * 100).toFixed(1) + '%',
          文本质量: textQuality > 0.7 ? '良好' : textQuality > 0.3 ? '一般' : '较差'
        });

        result.extractedText = cleanedText;
        result.extractedTextLength = result.extractedText.length;
        result.parseSuccess = true;
        result.metadata = {
          parsingMethod: 'pdf-extraction',
          pageCount: data.numpages || 1,
          wordCount: result.extractedText.split(/\s+/).filter(word => word.length > 0).length
        };

        console.log(`✅ [PARSER] PDF解析成功: ${file.name}`, {
          页数: data.numpages || 1,
          文本长度: result.extractedTextLength,
          词数: result.metadata?.wordCount || 0,
          文本预览: result.extractedText.substring(0, 200) + (result.extractedText.length > 200 ? '...' : ''),
          解析成功: result.parseSuccess
        });

        // 检查文本质量和内容
        if (result.extractedTextLength === 0) {
          console.warn(`⚠️ [PARSER] PDF文档为空: ${file.name}`);
          result.extractedText = '[PDF文档已解析但未提取到文本内容，可能包含图片或扫描文档]';
          result.extractedTextLength = result.extractedText.length;
          result.parseSuccess = false;
          result.parseError = 'PDF contains no extractable text';
        } else if (textQuality < 0.3) {
          console.warn(`⚠️ [PARSER] PDF文本质量较差，可能包含大量乱码: ${file.name}`);
          console.warn('⚠️ [PARSER] 文本质量详情:', {
            文本质量: (textQuality * 100).toFixed(1) + '%',
            原始文本预览: data.text?.substring(0, 200) || 'null',
            清理后文本预览: result.extractedText.substring(0, 200)
          });

          // 提供更有用的备用内容
          result.extractedText = `PDF文件: ${file.name}
文件大小: ${(file.size / 1024).toFixed(1)}KB
解析状态: 文本质量较差，可能包含编码问题

建议: 此PDF文件可能存在以下问题：
1. 文档是扫描版本，包含图片而非文本
2. 文档使用了特殊字体或编码
3. 文档结构复杂，文本提取不完整

为了获得最佳效果，建议您：
1. 使用Word文档格式(.docx)重新上传
2. 将PDF内容复制粘贴到文本文件中上传
3. 在后续步骤中手动补充关键信息

原始提取内容（供参考）：
${result.extractedText.substring(0, 300)}${result.extractedText.length > 300 ? '...' : ''}`;

          result.extractedTextLength = result.extractedText.length;
          result.parseSuccess = false;
          result.parseError = 'PDF text quality too low (possible encoding issues)';
          result.metadata!.parsingMethod = 'pdf-extraction-failed';
        }

      } catch (pdfError) {
        console.error(`❌ [PARSER] PDF解析失败: ${file.name}`);
        console.error('❌ [PARSER] PDF错误详情:', {
          errorType: pdfError?.constructor?.name || 'unknown',
          errorMessage: pdfError instanceof Error ? pdfError.message : String(pdfError),
          errorStack: pdfError instanceof Error ? pdfError.stack?.substring(0, 500) : 'no stack',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });

        // 尝试备用方案：提供有用的占位符内容
        console.log('🔄 [PARSER] 尝试PDF备用处理方案...');
        result.extractedText = `PDF文件: ${file.name}
文件大小: ${(file.size / 1024).toFixed(1)}KB
解析状态: 解析失败，但文件已接收
建议: 请手动提供此PDF文件中的关键信息，如工作经历、教育背景、技能等

注意: 系统检测到这是一个PDF文件，但由于技术限制无法自动提取文本内容。
为了获得最佳的经验卡片生成效果，建议您：
1. 将PDF内容复制粘贴到文本文件中重新上传
2. 或使用Word文档格式(.docx)重新上传
3. 或在后续步骤中手动补充关键信息`;

        result.extractedTextLength = result.extractedText.length;
        result.parseSuccess = false; // 标记为失败，但提供有用信息
        result.parseError = pdfError instanceof Error ? pdfError.message : String(pdfError);
        result.metadata = {
          parsingMethod: 'pdf-extraction-failed',
          wordCount: result.extractedText.split(/\s+/).filter(word => word.length > 0).length
        };

        console.log('📝 [PARSER] PDF备用方案已应用，提供引导信息');
      }
      
    } else if (file.type.includes('text/') || 
               file.name.toLowerCase().endsWith('.txt') ||
               file.name.toLowerCase().endsWith('.md')) {
      // 纯文本文件
      console.log(`📄 解析文本文件: ${file.name}`);
      
      result.extractedText = await file.text();
      result.extractedTextLength = result.extractedText.length;
      result.parseSuccess = true;
      result.metadata = {
        parsingMethod: 'text',
        wordCount: result.extractedText.split(/\s+/).filter(word => word.length > 0).length
      };

      console.log(`✅ 文本文件解析成功: ${file.name}`, {
        文本长度: result.extractedTextLength,
        词数: result.metadata.wordCount
      });
      
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
        result.metadata = {
          parsingMethod: 'fallback',
          wordCount: result.extractedText.split(/\s+/).filter(word => word.length > 0).length
        };

        console.log(`✅ Fallback解析成功: ${file.name}`, {
          文本长度: result.extractedTextLength,
          词数: result.metadata.wordCount
        });
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

  // 过滤掉无效的文件
  const validFiles = files.filter(file => file && file.name && file.type);

  if (validFiles.length === 0) {
    console.log('📁 没有有效的文件需要解析');
    return results;
  }

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    console.log(`📁 解析文件 ${i + 1}/${validFiles.length}: ${file.name}`);

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
    formattedContent += `解析方法: ${parsed.metadata?.parsingMethod || '未知'}\n`;

    if (parsed.metadata?.pageCount) {
      formattedContent += `页数: ${parsed.metadata.pageCount}\n`;
    }

    if (parsed.metadata?.wordCount) {
      formattedContent += `词数: ${parsed.metadata.wordCount}\n`;
    }

    formattedContent += `文本长度: ${parsed.extractedTextLength}字符\n`;

    if (parsed.parseError) {
      formattedContent += `解析错误: ${parsed.parseError}\n`;
    }

    formattedContent += `提取的文本内容:\n${parsed.extractedText}\n`;
    formattedContent += `=== 文件 ${parsed.fileName} 结束 ===\n`;
  });
  
  return formattedContent;
}
