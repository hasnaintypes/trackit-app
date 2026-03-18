import { Logger as BetterStackLogger } from "@logtail/next";

// Use process.env directly so this module is safe to import in client components.
// The T3 `env` helper restricts server-only vars and would throw on the client.
const isProd = process.env.NODE_ENV === "production";

type LogMeta = Record<string, unknown>;

export class Logger {
  private source: string;
  private bsLogger?: BetterStackLogger;
  private context: LogMeta;

  /**
   * @param source - string identifier for log source (e.g. 'app', 'api', 'middleware')
   * @param context - initial context metadata
   */
  constructor(source = "app", context: LogMeta = {}) {
    this.source = source;
    this.context = context;
    if (isProd) {
      this.bsLogger = new BetterStackLogger({
        source: this.source,
        // Only valid config properties for BetterStackLogger
      });
    }
  }

  /**
   * Returns a new Logger with merged context
   */
  withContext(ctx: LogMeta) {
    return new Logger(this.source, { ...this.context, ...ctx });
  }

  /**
   * Formats log message and metadata
   */
  private formatMsg(msg: string, meta?: LogMeta) {
    const combined = { ...this.context, ...meta };
    if (isProd) return combined;
    // Format for console: timestamp, source, level, message, meta
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      source: this.source,
      msg,
      ...combined,
    };
  }

  /**
   * Log at debug level
   */
  debug(msg: string, meta?: LogMeta) {
    if (isProd) {
      this.bsLogger?.debug(msg, this.formatMsg(msg, meta));
    } else {
      const log = this.formatMsg(msg, meta);
      // Cyan for debug
      console.debug(
        `\x1b[36m[DEBUG]\x1b[0m [${String(log.timestamp)}] [${String(log.source)}]`,
        String(log.msg),
        this._prettyMeta(log),
      );
    }
  }

  /**
   * Log at info level
   */
  info(msg: string, meta?: LogMeta) {
    if (isProd) {
      this.bsLogger?.info(msg, this.formatMsg(msg, meta));
    } else {
      const log = this.formatMsg(msg, meta);
      // Green for info
      console.info(
        `\x1b[32m[INFO]\x1b[0m [${String(log.timestamp)}] [${String(log.source)}]`,
        String(log.msg),
        this._prettyMeta(log),
      );
    }
  }

  /**
   * Log at warn level
   */
  warn(msg: string, meta?: LogMeta) {
    if (isProd) {
      this.bsLogger?.warn(msg, this.formatMsg(msg, meta));
    } else {
      const log = this.formatMsg(msg, meta);
      // Yellow for warn
      console.warn(
        `\x1b[33m[WARN]\x1b[0m [${String(log.timestamp)}] [${String(log.source)}]`,
        String(log.msg),
        this._prettyMeta(log),
      );
    }
  }

  /**
   * Log at error level
   */
  error(msg: string, meta?: LogMeta) {
    if (isProd) {
      this.bsLogger?.error(msg, this.formatMsg(msg, meta));
    } else {
      const log = this.formatMsg(msg, meta);
      // Red for error
      console.error(
        `\x1b[31m[ERROR]\x1b[0m [${String(log.timestamp)}] [${String(log.source)}]`,
        String(log.msg),
        this._prettyMeta(log),
      );
    }
  }

  /**
   * Flush logs to Better Stack (server only)
   */
  async flush() {
    if (isProd && this.bsLogger) {
      await this.bsLogger.flush();
    }
  }

  /**
   * Pretty-print meta for console logs
   */
  private _prettyMeta(log: Record<string, unknown>) {
    // Remove known keys
    // Remove known keys
    const meta = { ...log };
    delete meta.timestamp;
    delete meta.source;
    delete meta.msg;
    return Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
  }
}

/**
 * Helper to create a logger instance
 */
export const createLogger = (source?: string) => new Logger(source);
