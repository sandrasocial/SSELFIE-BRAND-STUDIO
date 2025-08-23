import { getLspDiagnostics } from '../tools/lsp-tools';

interface ErrorCheck {
  hasError: boolean;
  type?: string;
  message?: string;
}

export class SmartErrorDetector {
  static async checkCode(fileContent: string): Promise<ErrorCheck[]> {
    const checks = [
      this.checkSyntax(fileContent),
      this.checkUndefinedVars(fileContent),
      this.checkAsyncAwait(fileContent),
      this.checkNullChecks(fileContent)
    ];

    const lspDiagnostics = await getLspDiagnostics({ file_path: 'temp.ts' });
    return [...checks, ...this.convertLspDiagnostics(lspDiagnostics)];
  }

  private static checkSyntax(content: string): ErrorCheck {
    try {
      Function('return ' + content);
      return { hasError: false };
    } catch (e) {
      return {
        hasError: true,
        type: 'SyntaxError',
        message: e.message
      };
    }
  }

  private static checkAsyncAwait(content: string): ErrorCheck {
    const missingAwait = content.includes('async') && 
      !content.match(/await\s+[\w.]+/g);
    return {
      hasError: missingAwait,
      type: 'AsyncError',
      message: missingAwait ? 'Async function missing await' : ''
    };
  }

  private static checkUndefinedVars(content: string): ErrorCheck {
    // Basic check for undefined variables
    return {
      hasError: false // Implement more sophisticated check
    };
  }

  private static checkNullChecks(content: string): ErrorCheck {
    // Check for potential null pointer issues
    return {
      hasError: false // Implement more sophisticated check
    };
  }

  private static convertLspDiagnostics(diagnostics: any[]): ErrorCheck[] {
    return diagnostics.map(d => ({
      hasError: true,
      type: 'LSPError',
      message: d.message
    }));
  }
}