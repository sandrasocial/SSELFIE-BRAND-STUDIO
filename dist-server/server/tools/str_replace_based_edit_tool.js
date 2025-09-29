import fs from 'fs/promises';
import path from 'path';
export async function str_replace_based_edit_tool(parameters) {
    console.log('✏️ FILE EDIT TOOL:', parameters);
    try {
        const { command, path: filePath, file_text, old_str, new_str, view_range, insert_line, insert_text } = parameters;
        if (!command) {
            throw new Error('Command parameter is required');
        }
        const workspaceRoot = process.cwd().endsWith('/server') ? path.resolve(process.cwd(), '..') : process.cwd();
        const resolvedPath = path.resolve(workspaceRoot, filePath || '');
        switch (command) {
            case 'view':
                return await handleView(resolvedPath, view_range);
            case 'create':
                return await handleCreate(resolvedPath, file_text || '');
            case 'str_replace':
                return await handleStringReplace(resolvedPath, old_str, new_str);
            case 'insert':
                return await handleInsert(resolvedPath, insert_line, insert_text);
            default:
                throw new Error(`Unknown command: ${command}`);
        }
    }
    catch (error) {
        console.error('❌ FILE EDIT ERROR:', error);
        throw error;
    }
}
async function handleView(filePath, viewRange) {
    try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            const entries = await fs.readdir(filePath, { withFileTypes: true });
            const fileList = entries
                .slice(0, 100)
                .map(entry => entry.isDirectory() ? `${entry.name}/` : entry.name)
                .join('\n');
            return `Directory listing for ${filePath}:\n${fileList}`;
        }
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        if (viewRange) {
            const [start, end] = viewRange;
            const actualEnd = end === -1 ? lines.length : Math.min(end, lines.length);
            const actualStart = Math.max(1, start);
            const selectedLines = lines.slice(actualStart - 1, actualEnd);
            const numberedLines = selectedLines.map((line, index) => `${(actualStart + index).toString().padStart(4, ' ')}\t${line}`).join('\n');
            return `Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${numberedLines}`;
        }
        else {
            const maxLines = getSmartLineLimit(filePath, lines.length);
            if (lines.length <= maxLines) {
                const numberedLines = lines.map((line, index) => `${(index + 1).toString().padStart(4, ' ')}\t${line}`).join('\n');
                return `Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${numberedLines}`;
            }
            else {
                const startLines = Math.ceil(maxLines * 0.6);
                const endLines = maxLines - startLines;
                const topContent = lines.slice(0, startLines).map((line, index) => `${(index + 1).toString().padStart(4, ' ')}\t${line}`).join('\n');
                const bottomContent = lines.slice(-endLines).map((line, index) => `${(lines.length - endLines + index + 1).toString().padStart(4, ' ')}\t${line}`).join('\n');
                return `Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${topContent}\n\n... (${lines.length - maxLines} lines truncated) ...\n\n${bottomContent}`;
            }
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File ${filePath} not found`);
        }
        throw error;
    }
}
async function handleCreate(filePath, content) {
    try {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`✅ FILE CREATED: ${filePath}`);
        return `File created successfully at: ${relativePath || filePath}`;
    }
    catch (error) {
        throw new Error(`Failed to create file: ${error.message}`);
    }
}
async function handleStringReplace(filePath, oldStr, newStr = '') {
    try {
        if (!oldStr) {
            throw new Error('old_str parameter is required for str_replace');
        }
        const content = await fs.readFile(filePath, 'utf-8');
        if (!content.includes(oldStr)) {
            throw new Error(`String not found in file. The exact string to replace was not found.`);
        }
        const occurrences = (content.match(new RegExp(escapeRegExp(oldStr), 'g')) || []).length;
        if (occurrences > 1) {
            throw new Error(`Multiple occurrences found (${occurrences}). The string to replace must be unique.`);
        }
        const newContent = content.replace(oldStr, newStr);
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ STRING REPLACED in ${filePath}`);
        return `The file ${filePath} has been edited. Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n` +
            newContent.split('\n').slice(0, 10).map((line, i) => `${(i + 1).toString().padStart(4, ' ')}\t${line}`).join('\n');
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File ${filePath} not found`);
        }
        throw error;
    }
}
async function handleInsert(filePath, insertLine, insertText) {
    try {
        if (insertLine === undefined || insertText === undefined) {
            throw new Error('insert_line and insert_text parameters are required for insert');
        }
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const actualLine = Math.max(0, Math.min(insertLine, lines.length));
        lines.splice(actualLine, 0, insertText);
        const newContent = lines.join('\n');
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ TEXT INSERTED in ${filePath} at line ${actualLine}`);
        return `Text inserted at line ${actualLine} in ${filePath}`;
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File ${filePath} not found`);
        }
        throw error;
    }
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getSmartLineLimit(filePath, totalLines) {
    const extension = path.extname(filePath).toLowerCase();
    if (['.json', '.md', '.txt', '.yml', '.yaml'].includes(extension)) {
        return Math.min(500, totalLines);
    }
    if (['.ts', '.tsx', '', '.jsx', '.py', '.css'].includes(extension)) {
        return Math.min(300, totalLines);
    }
    if (['.csv', '.log', '.sql'].includes(extension)) {
        return Math.min(100, totalLines);
    }
    return Math.min(200, totalLines);
}
//# sourceMappingURL=str_replace_based_edit_tool.js.map