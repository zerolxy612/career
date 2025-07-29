interface LogEntry {
  timestamp: string;
  type: 'USER_INPUT' | 'AI_REQUEST' | 'AI_RESPONSE' | 'ERROR' | 'INFO';
  source: string;
  data: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(type: LogEntry['type'], source: string, data: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      type,
      source,
      data
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Enhanced console output with clear formatting
    const emoji = {
      'USER_INPUT': '👤',
      'AI_REQUEST': '🤖➡️',
      'AI_RESPONSE': '🤖⬅️',
      'ERROR': '❌',
      'INFO': 'ℹ️'
    }[type];

    console.group(`${emoji} [${type}] ${source} - ${this.formatTimestamp()}`);
    console.log(data);
    console.groupEnd();
  }

  // Log user input from homepage
  logUserInput(source: string, data: {
    userGoal?: string;
    userInput?: string;
    selectedIndustry?: string;
    files?: { name: string; size: number; type: string }[];
    [key: string]: unknown;
  }) {
    this.addLog('USER_INPUT', source, {
      ...data,
      filesInfo: data.files?.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
  }

  // Log AI request (what we send to AI)
  logAIRequest(source: string, data: {
    prompt: string;
    promptType?: string;
    requestBody?: Record<string, unknown>;
    [key: string]: unknown;
  }) {
    this.addLog('AI_REQUEST', source, {
      ...data,
      promptPreview: data.prompt.substring(0, 500) + (data.prompt.length > 500 ? '...' : ''),
      promptLength: data.prompt.length
    });
  }

  // Log AI response (what we get from AI)
  logAIResponse(source: string, data: {
    rawResponse: string;
    parsedResponse?: Record<string, unknown>;
    responseTime?: number;
    [key: string]: unknown;
  }) {
    this.addLog('AI_RESPONSE', source, {
      ...data,
      rawResponsePreview: data.rawResponse.substring(0, 500) + (data.rawResponse.length > 500 ? '...' : ''),
      rawResponseLength: data.rawResponse.length
    });
  }

  // Log errors
  logError(source: string, error: Error | unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.addLog('ERROR', source, {
      message: errorObj.message,
      stack: errorObj.stack,
      error: error
    });
  }

  // Log general info
  logInfo(source: string, message: string, data?: Record<string, unknown>) {
    this.addLog('INFO', source, { message, ...data });
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by type
  getLogsByType(type: LogEntry['type']): LogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.log('🧹 Logger: All logs cleared');
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Print detailed log summary
  printSummary() {
    console.log('\n📊 === LOGGER SUMMARY ===');
    console.log(`Total logs: ${this.logs.length}`);
    
    const typeCounts = this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    console.log('=========================\n');
  }
}

// Create singleton instance
export const logger = new Logger();

// Enhanced console logging functions
export const consoleLog = {
  // Log user input with clear formatting
  userInput: (source: string, userInput: string, files: File[] = []) => {
    console.group('👤 用户输入 - ' + source);
    console.log('📝 用户输入内容:', userInput);
    if (files.length > 0) {
      console.log('📁 上传文件:', files.map(f => ({
        文件名: f.name,
        大小: `${(f.size / 1024).toFixed(1)}KB`,
        类型: f.type
      })));
    }
    console.groupEnd();

    // Also log to our system
    logger.logUserInput(source, {
      userInput,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
  },

  // Log AI request with full prompt
  aiRequest: (source: string, prompt: string, type: string, additionalInfo: Record<string, unknown> = {}) => {
    console.group('🤖➡️ AI请求 - ' + source);
    console.log('📋 请求类型:', type);
    console.log('📄 完整Prompt:');
    console.log(prompt);
    if (Object.keys(additionalInfo).length > 0) {
      console.log('ℹ️ 附加信息:', additionalInfo);
    }
    console.groupEnd();

    // Also log to our system
    logger.logAIRequest(source, { prompt, promptType: type, ...additionalInfo });
  },

  // Log AI response with full data
  aiResponse: (source: string, rawResponse: string, parsedData: Record<string, unknown>, responseTime: number) => {
    console.group('🤖⬅️ AI响应 - ' + source);
    console.log('⏱️ 响应时间:', responseTime + 'ms');
    console.log('📄 原始响应:');
    console.log(rawResponse);
    console.log('📊 解析后数据:');
    console.log(parsedData);
    console.groupEnd();

    // Also log to our system
    logger.logAIResponse(source, { rawResponse, parsedResponse: parsedData, responseTime });
  }
};

// Helper function to log complete user flow
export const logUserFlow = {
  // Homepage confirm action
  homepageConfirm: (userInput: string, files: File[]) => {
    consoleLog.userInput('首页确认', userInput, files);
  },

  // Experience page generation
  experienceGeneration: (userGoal: string, selectedIndustry: string, files: File[]) => {
    consoleLog.userInput('经验卡片生成', `目标: ${userGoal}, 行业: ${selectedIndustry}`, files);
  }
};

export default logger;
