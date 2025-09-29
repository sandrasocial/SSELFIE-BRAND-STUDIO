import { spawn } from 'child_process';
export async function bash(parameters) {
    console.log('⚡ BASH TOOL:', parameters);
    const { command, restart } = parameters;
    if (restart) {
        console.log('🔄 BASH: Restart flag detected, ignoring command');
        return 'Bash tool restarted';
    }
    if (!command) {
        throw new Error('Command parameter is required');
    }
    console.log(`🔧 EXECUTING BASH: ${command}`);
    if (!command || typeof command !== 'string') {
        throw new Error('Invalid command format');
    }
    const dangerousPatterns = [/[;`$()]/g, /\brm\s+-rf\b/, /\bsudo\b/, /\bsu\b/, />/g];
    const hasDangerousChars = dangerousPatterns.some(pattern => pattern.test(command));
    if (hasDangerousChars) {
        throw new Error('Command contains unsafe characters or patterns');
    }
    const allowedCommands = [
        /^ls\b/, /^cat\b/, /^grep\b/, /^find\b/, /^echo\b/,
        /^npm\s+/, /^node\b/, /^curl\s+/, /^ps\b/, /^pwd/, /^whoami$/,
        /^mkdir\b/, /^cp\b/, /^mv\b/, /^chmod\b/, /^head\b/, /^tail\b/,
        /^pwd\s+&&/, /^ls.*&&/, /^pwd.*\|/, /^ps.*\|/
    ];
    const isCommandAllowed = allowedCommands.some(pattern => pattern.test(command.trim()));
    if (!isCommandAllowed) {
        throw new Error('Command not in allowed list for security');
    }
    if (command.includes('&&')) {
        return new Promise((resolve, reject) => {
            const child = spawn('sh', ['-c', command], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd()
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Compound command failed: ${stderr}`));
                    return;
                }
                resolve(stdout || stderr || 'Command completed');
            });
            child.on('error', (error) => {
                reject(error);
            });
        });
    }
    if (command.includes('|')) {
        return new Promise((resolve, reject) => {
            const child = spawn('sh', ['-c', command], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd()
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Pipe command failed: ${stderr}`));
                    return;
                }
                resolve(stdout || stderr || 'Command completed');
            });
            child.on('error', (error) => {
                reject(error);
            });
        });
    }
    return new Promise((resolve, reject) => {
        const commandParts = command.trim().split(/\s+/);
        const baseCommand = commandParts[0];
        const args = commandParts.slice(1).filter(arg => arg.length < 200 && !/[;`$()]/.test(arg));
        const isFileOperation = ['ls', 'find', 'cat', 'grep', 'head', 'tail'].includes(baseCommand);
        const workingDir = isFileOperation && process.cwd().includes('/server')
            ? process.cwd().replace('/server', '')
            : process.cwd();
        if (isFileOperation && workingDir !== process.cwd()) {
            console.log('🔧 AGENT NAVIGATION: Running from project root:', workingDir);
        }
        const child = spawn(baseCommand, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: workingDir,
            env: { ...process.env, PATH: process.env.PATH }
        });
        let stdout = '';
        let stderr = '';
        const timeoutMs = getCommandTimeout(command);
        const timeoutId = setTimeout(() => {
            child.kill('SIGTERM');
            reject(new Error(`Command timeout after ${Math.floor(timeoutMs / 1000)} seconds. Consider breaking down complex commands or using faster alternatives.`));
        }, timeoutMs);
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        child.on('close', (code) => {
            clearTimeout(timeoutId);
            if (code !== 0) {
                const errorOutput = stderr || 'Command failed with no error output';
                const suggestion = getErrorSuggestion(command, code, errorOutput);
                console.log(`❌ BASH FAILED: Exit code ${code}`);
                reject(new Error(`Command failed (exit code ${code}): ${errorOutput}\n\nSuggestion: ${suggestion}`));
                return;
            }
            const output = stdout || stderr || 'Command completed';
            const truncatedOutput = truncateOutput(output, command);
            console.log(`✅ BASH COMPLETED: Exit code ${code}`);
            resolve(truncatedOutput);
        });
        child.on('error', (error) => {
            clearTimeout(timeoutId);
            console.error(`❌ BASH ERROR:`, error);
            reject(new Error(`Bash execution failed: ${error.message}`));
        });
    });
}
function truncateOutput(output, command) {
    const maxLength = getOutputLimit(command);
    if (output.length <= maxLength) {
        return output;
    }
    const beginLength = Math.ceil(maxLength * 0.7);
    const endLength = maxLength - beginLength - 100;
    const beginning = output.substring(0, beginLength);
    const ending = output.substring(output.length - endLength);
    return `${beginning}\n\n... [Output truncated - ${output.length} total characters] ...\n\n${ending}`;
}
function getOutputLimit(command) {
    if (command.includes('find') || command.includes('grep') || command.includes('ls -la')) {
        return 2000;
    }
    if (command.includes('cat') || command.includes('head') || command.includes('tail')) {
        return 3000;
    }
    if (command.includes('npm') || command.includes('build') || command.includes('install')) {
        return 1500;
    }
    return 4000;
}
function getCommandTimeout(command) {
    if (command.includes('npm install') || command.includes('git clone') || command.includes('download')) {
        return 120000;
    }
    if (command.includes('psql') || command.includes('database') || command.includes('migration')) {
        return 60000;
    }
    if (command.includes('find') && command.includes('-exec')) {
        return 45000;
    }
    return 30000;
}
function getErrorSuggestion(command, exitCode, errorOutput) {
    if (errorOutput.includes('Permission denied') || exitCode === 126) {
        return 'Try using relative paths or check file permissions. Avoid operations requiring sudo.';
    }
    if (errorOutput.includes('No such file') || exitCode === 127) {
        return 'Check if the file/command exists. Use `ls` to verify paths or `which` to check if commands are available.';
    }
    if (errorOutput.includes('Connection refused') || errorOutput.includes('timeout')) {
        return 'Network issue detected. Check if services are running or try again later.';
    }
    if (errorOutput.includes('syntax error') || exitCode === 2) {
        return 'Command syntax issue. Check command format and escape special characters.';
    }
    if (errorOutput.includes('No space left') || errorOutput.includes('out of memory')) {
        return 'Resource constraint detected. Try cleaning up temporary files or simplifying the operation.';
    }
    return 'Try breaking the command into smaller parts or use an alternative approach. Check the error output for specific details.';
}
//# sourceMappingURL=bash.js.map