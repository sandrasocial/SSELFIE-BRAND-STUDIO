import { readFile, unlink, writeFile } from 'fs/promises';
export function setupRollbackRoutes(app) {
    app.post('/api/admin/rollback-file', async (req, res) => {
        try {
            const { filePath } = req.body;
            const adminToken = req.headers['x-admin-token'] || req.body.adminToken;
            if (adminToken !== 'sandra-admin-2025') {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const backupPath = filePath.replace('.tsx', '.backup.tsx');
            const backupContent = await readFile(backupPath, 'utf8');
            await writeFile(filePath, backupContent, 'utf8');
            await unlink(backupPath);
            console.log(`🔄 Rolled back file: ${filePath}`);
            res.json({
                success: true,
                message: `File ${filePath} rolled back successfully`,
                filePath,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Rollback failed:', error);
            res.status(500).json({
                error: 'Rollback failed',
                details: error.message
            });
        }
    });
    app.get('/api/admin/backups', async (req, res) => {
        try {
            const { glob } = await import('glob');
            const backupFiles = await glob('client/src/components/**/*.backup.tsx');
            const backups = backupFiles.map(backup => ({
                backupPath: backup,
                originalPath: backup.replace('.backup.tsx', '.tsx'),
                fileName: backup.split('/').pop()?.replace('.backup.tsx', '') || 'Unknown'
            }));
            res.json({ backups });
        }
        catch (error) {
            console.error('Failed to list backups:', error);
            res.status(500).json({ error: 'Failed to list backups' });
        }
    });
}
//# sourceMappingURL=rollback.js.map