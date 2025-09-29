import { spawn } from 'child_process';
import path from 'path';
export async function get_latest_lsp_diagnostics(parameters) {
    console.log('🔍 LSP DIAGNOSTICS:', parameters);
    try {
        const { file_path } = parameters;
        const diagnostics = await checkTypeScriptErrors(file_path);
        return {
            diagnostics: diagnostics,
            filesChecked: file_path || 'project-wide',
            errors: diagnostics.filter(d => d.severity === 'error').length,
            warnings: diagnostics.filter(d => d.severity === 'warning').length,
            success: true
        };
    }
    catch (error) {
        console.error('❌ LSP DIAGNOSTICS ERROR:', error);
        return {
            diagnostics: [],
            filesChecked: 0,
            errors: 0,
            warnings: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
async function checkTypeScriptErrors(filePath) {
    return new Promise((resolve) => {
        const args = ['--noEmit', '--pretty', 'false'];
        if (filePath) {
            args.push(filePath);
        }
        const tsc = spawn('npx', ['tsc', ...args], {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
        });
        let output = '';
        let errorOutput = '';
        tsc.stdout.on('data', (data) => {
            output += data.toString();
        });
        tsc.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        tsc.on('close', (code) => {
            const diagnostics = parseTypeScriptErrors(output + errorOutput);
            resolve(diagnostics);
        });
        setTimeout(() => {
            tsc.kill('SIGTERM');
            resolve([]);
        }, 10000);
    });
}
function parseTypeScriptErrors(output) {
    const diagnostics = [];
    const lines = output.split('\n');
    for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/);
        if (match) {
            const [, file, lineNum, col, severity, code, message] = match;
            diagnostics.push({
                file: path.relative(process.cwd(), file),
                line: parseInt(lineNum),
                column: parseInt(col),
                severity: severity,
                code: `TS${code}`,
                message: message.trim()
            });
        }
    }
    return diagnostics;
}
//# sourceMappingURL=get_latest_lsp_diagnostics.js.map