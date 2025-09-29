export async function search_filesystem(parameters) {
    console.log('🔍 PROJECT SEARCH:', parameters);
    try {
        const { query_description, class_names = [], function_names = [], code = [], search_paths = ['.'] } = parameters;
        let results = '';
        console.log('🔍 AGENT WORKING DIRECTORY:', process.cwd());
        const workspaceRoot = process.cwd().endsWith('/server') ? '..' : '.';
        const adjustedPaths = search_paths.map(path => {
            if (path === '.')
                return workspaceRoot;
            if (path.startsWith('./'))
                return path.replace('./', `${workspaceRoot}/`);
            if (path.startsWith('/'))
                return path;
            return `${workspaceRoot}/${path}`;
        });
        console.log('🔍 PATH ADJUSTMENT:', { original: search_paths, adjusted: adjustedPaths });
        if (code.length > 0) {
            for (const codeSnippet of code) {
                const grepResult = await executeGrep(codeSnippet, adjustedPaths);
                results += `\n=== Searching for code: "${codeSnippet}" ===\n${grepResult}`;
            }
        }
        if (class_names.length > 0) {
            for (const className of class_names) {
                const grepResult = await executeGrep(`class ${className}`, adjustedPaths);
                results += `\n=== Searching for class: "${className}" ===\n${grepResult}`;
            }
        }
        if (function_names.length > 0) {
            for (const funcName of function_names) {
                const grepResult = await executeGrep(`function ${funcName}\\|${funcName}\\s*[=:]`, adjustedPaths);
                results += `\n=== Searching for function: "${funcName}" ===\n${grepResult}`;
            }
        }
        if (query_description) {
            const searchTerms = extractSearchTerms(query_description);
            console.log('🔍 SEARCH TERMS EXTRACTED:', searchTerms);
            for (const term of searchTerms.slice(0, 3)) {
                const grepResult = await executeGrep(term, adjustedPaths);
                if (grepResult && grepResult !== 'No matches found') {
                    results += `\n=== Found "${term}" ===\n${grepResult.substring(0, 1200)}\n`;
                }
            }
            if (query_description.length > 20 && !query_description.includes(' ')) {
                const exactResult = await executeGrep(query_description, adjustedPaths);
                if (exactResult && exactResult !== 'No matches found') {
                    results += `\n=== Exact Match: "${query_description}" ===\n${exactResult.substring(0, 1200)}\n`;
                }
            }
        }
        console.log('🔍 SEARCH RESULTS LENGTH:', results.length);
        return results || 'No results found for the search criteria.';
    }
    catch (error) {
        console.error('❌ FILESYSTEM SEARCH ERROR:', error);
        throw error;
    }
}
async function executeGrep(searchTerm, searchPaths) {
    const { spawn } = await import('child_process');
    return new Promise((resolve) => {
        const pathArgs = searchPaths.length > 0 ? searchPaths : ['.'];
        console.log('🔍 GREP COMMAND:', `grep -r -n -i --include=*.ts --include=*.js --include=*.tsx --include=*.jsx --include=*.md "${searchTerm}" ${pathArgs.join(' ')}`);
        const cmd = spawn('grep', [
            '-r', '-n', '-i',
            '--include=*.ts', '--include=*', '--include=*.tsx', '--include=*.jsx',
            '--include=*.md', '--include=*.json',
            searchTerm,
            ...pathArgs
        ], {
            cwd: process.cwd()
        });
        let output = '';
        let errorOutput = '';
        cmd.stdout.on('data', (data) => {
            output += data.toString();
        });
        cmd.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        cmd.on('close', (code) => {
            console.log('🔍 GREP EXIT CODE:', code);
            console.log('🔍 GREP OUTPUT LENGTH:', output.length);
            if (output) {
                console.log('🔍 GREP SAMPLE:', output.substring(0, 300));
            }
            resolve(output || 'No matches found');
        });
        setTimeout(() => {
            cmd.kill();
            resolve('Search timed out');
        }, 10000);
    });
}
async function getProjectOverview() {
    console.log('🔍 LOADING BUSINESS DOCS...');
    console.log('🔍 CURRENT WORKING DIR:', process.cwd());
    const businessDocs = await getBusinessModelDocumentation();
    console.log('📄 BUSINESS DOCS LENGTH:', businessDocs.length);
    return `🚀 SSELFIE STUDIO - COMPLETE PROJECT & BUSINESS MODEL ACCESS:

📋 SANDRA'S BUSINESS MODEL & LAUNCH STRATEGY:
${businessDocs}

✅ ROOT DIRECTORIES (what agents can access):
./server/ - Express.js backend, API routes, agent tools, services
./client/ - Frontend React application (CONTAINS src/ subdirectory)  
./client/src/ - Main React source code (components, pages, hooks)
./shared/ - TypeScript schemas (database models, types)
./config/ - Configuration files
./_architecture/ - Architecture documentation
./attached_assets/ - User uploads and project assets
./admin-development/ - Admin agent development files
./infrastructure/ - Infrastructure and deployment configurations

📋 KEY BUSINESS & PROJECT FILES:
./replit.md - COMPLETE project documentation and business architecture
./SANDRA_LAUNCH_STRATEGY.md - Launch strategy and business plans
./MEMBER_WORKSPACE_REDESIGN_PLAN.md - User experience and features
./ARCHITECTURE_OVERVIEW.md - Technical architecture documentation  
./PROJECT_GUIDE.md - Development and business guidelines
./package.json - Dependencies (React, Express, PostgreSQL, Drizzle, etc.)
./server/index.ts - Main server entry point
./shared/schema.ts - Database schema (PostgreSQL + Drizzle ORM)

🎯 CRITICAL LOCATIONS FOR AGENTS:
- Business Strategy: ./SANDRA_LAUNCH_STRATEGY.md, ./replit.md
- User Experience: ./MEMBER_WORKSPACE_REDESIGN_PLAN.md  
- React Components: ./client/src/components/
- React Pages: ./client/src/pages/ (including pricing, workspace, etc.)
- API Routes: ./server/routes/
- Database: PostgreSQL with Drizzle ORM in ./shared/schema.ts
- Agent Tools: ./server/tools/

🔧 Tech Stack: React 18 + TypeScript + Express + PostgreSQL + Drizzle + Tailwind CSS
💰 Revenue Model: €39 Single Mom Starter + Premium subscriptions
🎯 Business Focus: AI Personal Branding Platform for immediate income generation

✅ PROJECT STATUS: READY FOR SIMPLIFIED LAUNCH WITH REVENUE GENERATION`;
}
async function getBasicDirectoryListing() {
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const workspaceRoot = process.cwd().endsWith('/server') ? '..' : '.';
        const rootItems = await fs.readdir(workspaceRoot, { withFileTypes: true });
        let listing = 'ROOT DIRECTORY CONTENTS:\n';
        for (const item of rootItems) {
            const type = item.isDirectory() ? 'DIR' : 'FILE';
            const name = item.name;
            if (!['node_modules', '.git'].includes(name)) {
                listing += `${type}: ${name}\n`;
                if (item.isDirectory() && ['server', 'client', 'src', 'components', 'pages', 'shared', 'config', '_architecture', 'attached_assets', 'admin-development', 'infrastructure'].includes(name)) {
                    try {
                        const subItems = await fs.readdir(name, { withFileTypes: true });
                        for (const subItem of subItems) {
                            const subType = subItem.isDirectory() ? 'DIR' : 'FILE';
                            listing += `  └─ ${subType}: ${name}/${subItem.name}\n`;
                            if (name === 'client' && subItem.isDirectory() && subItem.name === 'src') {
                                try {
                                    const srcItems = await fs.readdir(`${name}/${subItem.name}`, { withFileTypes: true });
                                    for (const srcSubItem of srcItems) {
                                        const srcType = srcSubItem.isDirectory() ? 'DIR' : 'FILE';
                                        listing += `    └─ ${srcType}: ${name}/${subItem.name}/${srcSubItem.name}\n`;
                                        if (srcSubItem.isDirectory() && srcSubItem.name === 'pages') {
                                            try {
                                                const pageItems = await fs.readdir(`${name}/${subItem.name}/${srcSubItem.name}`, { withFileTypes: true });
                                                for (const pageItem of pageItems) {
                                                    listing += `      └─ FILE: ${name}/${subItem.name}/${srcSubItem.name}/${pageItem.name}\n`;
                                                }
                                            }
                                            catch { }
                                        }
                                    }
                                }
                                catch { }
                            }
                        }
                    }
                    catch (error) {
                        listing += `  └─ (access restricted)\n`;
                    }
                }
            }
        }
        return listing;
    }
    catch (error) {
        const { spawn } = await import('child_process');
        return new Promise((resolve) => {
            const cmd = spawn('ls', ['-la']);
            let output = '';
            cmd.stdout.on('data', (data) => {
                output += data.toString();
            });
            cmd.on('close', () => {
                resolve(output || 'Directory listing unavailable');
            });
            setTimeout(() => {
                cmd.kill();
                resolve('Directory listing timed out');
            }, 10000);
        });
    }
}
async function getBusinessModelDocumentation() {
    console.log('🔍 GETTING BUSINESS DOCS...');
    let businessInfo = '';
    const keyBusinessFiles = [
        'replit.md',
        'SANDRA_LAUNCH_STRATEGY.md',
        'MEMBER_WORKSPACE_REDESIGN_PLAN.md',
        'ARCHITECTURE_OVERVIEW.md',
        'PROJECT_GUIDE.md'
    ];
    for (const filename of keyBusinessFiles) {
        try {
            const fs = await import('fs/promises');
            const workspaceRoot = process.cwd().endsWith('/server') ? '..' : '.';
            console.log(`🔍 TRYING TO READ: ${workspaceRoot}/${filename}`);
            const content = await fs.readFile(`${workspaceRoot}/${filename}`, 'utf-8');
            console.log(`✅ READ ${filename}: ${content.length} characters`);
            businessInfo += `\n📄 ${filename.toUpperCase()}:\n`;
            if (filename === 'SANDRA_LAUNCH_STRATEGY.md') {
                businessInfo += content.substring(0, 4000);
                if (content.length > 4000) {
                    businessInfo += '\n... (file continues - agents can access full file via str_replace_based_edit_tool)';
                }
            }
            else if (filename === 'replit.md') {
                businessInfo += content.substring(0, 3000);
                if (content.length > 3000) {
                    businessInfo += '\n... (file continues)';
                }
            }
            else {
                businessInfo += content.substring(0, 1500);
                if (content.length > 1500) {
                    businessInfo += '\n... (file continues)';
                }
            }
            businessInfo += '\n\n';
        }
        catch (error) {
            console.log(`❌ FAILED TO READ ${filename}:`, error instanceof Error ? error.message : 'Unknown error');
            businessInfo += `\n📄 ${filename}: File not accessible - ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        }
    }
    console.log('📄 FINAL BUSINESS INFO LENGTH:', businessInfo.length);
    return businessInfo || '📄 Business documentation access limited - check file permissions';
}
function extractSearchTerms(description) {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why', 'show', 'find', 'search', 'get', 'look', 'see', 'view', 'read', 'content', 'file', 'page'];
    const cleanDescription = description
        .toLowerCase()
        .replace(/[^\w\s'-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
    return cleanDescription
        .sort((a, b) => b.length - a.length)
        .slice(0, 5);
}
function oldExtractSearchTerms(description) {
    const words = description.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 2 &&
        !['find', 'search', 'look', 'locate', 'get', 'show', 'display', 'any', 'all'].includes(word)).slice(0, 3);
}
//# sourceMappingURL=search_filesystem.js.map