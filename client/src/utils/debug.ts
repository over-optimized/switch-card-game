// Debug logging utility for Switch Card Game

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory =
  | 'game'
  | 'network'
  | 'ui'
  | 'validation'
  | 'turn'
  | 'cards'
  | 'debug';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private enabledCategories: Set<LogCategory> = new Set([
    'game',
    'network',
    'validation',
    'turn',
  ]);
  private logLevel: LogLevel = 'debug';

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    return (
      levelPriority[level] >= levelPriority[this.logLevel] &&
      this.enabledCategories.has(category)
    );
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
  ) {
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with formatting
    const prefix = `[${category.toUpperCase()}]`;
    const timestamp = entry.timestamp.toISOString().slice(11, 23);
    const logMessage = `${timestamp} ${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.log(`🔍 ${logMessage}`, data || '');
        break;
      case 'info':
        console.info(`ℹ️ ${logMessage}`, data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${logMessage}`, data || '');
        break;
      case 'error':
        console.error(`❌ ${logMessage}`, data || '');
        break;
    }
  }

  debug(category: LogCategory, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  info(category: LogCategory, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: LogCategory, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: LogCategory, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  // Game-specific logging helpers
  logTurn(playerId: string, action: string, data?: any) {
    this.info('turn', `Player ${playerId}: ${action}`, data);
  }

  logCardPlay(
    playerId: string,
    cards: string[],
    success: boolean,
    reason?: string,
  ) {
    this.info(
      'cards',
      `Card play - Player: ${playerId}, Cards: [${cards.join(', ')}], Success: ${success}`,
      {
        reason,
        cardCount: cards.length,
      },
    );
  }

  logNetworkAction(
    action: string,
    status: 'pending' | 'success' | 'error',
    data?: any,
  ) {
    const level =
      status === 'error' ? 'error' : status === 'pending' ? 'debug' : 'info';
    this.log(level, 'network', `${action} - ${status}`, data);
  }

  logValidation(type: string, result: boolean, details?: any) {
    const level = result ? 'debug' : 'warn';
    this.log(
      level,
      'validation',
      `${type} validation: ${result ? 'PASS' : 'FAIL'}`,
      details,
    );
  }

  // Configuration
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
    this.info('debug', `Log level set to: ${level}`);
  }

  enableCategory(category: LogCategory) {
    this.enabledCategories.add(category);
    this.info('debug', `Enabled logging for category: ${category}`);
  }

  disableCategory(category: LogCategory) {
    this.enabledCategories.delete(category);
    this.info('debug', `Disabled logging for category: ${category}`);
  }

  // Export logs for debugging
  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.info('debug', 'Debug logs cleared');
  }

  // Get recent logs for UI display
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logs.slice(-count);
  }
}

// Global debug instance
export const debugLogger = new DebugLogger();

// Convenience exports
export const logGame = (message: string, data?: any) =>
  debugLogger.info('game', message, data);
export const logTurn = (playerId: string, action: string, data?: any) =>
  debugLogger.logTurn(playerId, action, data);
export const logCardPlay = (
  playerId: string,
  cards: string[],
  success: boolean,
  reason?: string,
) => debugLogger.logCardPlay(playerId, cards, success, reason);
export const logNetwork = (
  action: string,
  status: 'pending' | 'success' | 'error',
  data?: any,
) => debugLogger.logNetworkAction(action, status, data);
export const logValidation = (type: string, result: boolean, details?: any) =>
  debugLogger.logValidation(type, result, details);
