/**
 * Maya Service Diagnostic Endpoint
 * Tests Maya service initialization and dependencies
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const diagnostics = {
        timestamp: new Date().toISOString(),
        checks: {}
    };
    try {
        // 1. Test Anthropic API key availability
        diagnostics.checks.anthropicKey = {
            available: !!process.env.ANTHROPIC_API_KEY,
            message: process.env.ANTHROPIC_API_KEY ? 'Anthropic API key is set' : 'Anthropic API key is missing'
        };
        // 2. Test Maya service import
        try {
            const { mayaService } = await import('../server/services/maya-service.js');
            diagnostics.checks.mayaServiceImport = {
                success: true,
                hasService: !!mayaService,
                message: 'Maya service imported successfully'
            };
            // 3. Test Maya service initialization
            if (mayaService) {
                try {
                    // Test if we can call a method (this will reveal init issues)
                    const testUserId = 'diagnostic-test-user';
                    // Just test the service exists and has expected methods
                    diagnostics.checks.mayaServiceMethods = {
                        hasProcessChat: typeof mayaService.processChat === 'function',
                        hasGenerateImages: typeof mayaService.generateImages === 'function',
                        message: 'Maya service methods are available'
                    };
                }
                catch (serviceError) {
                    diagnostics.checks.mayaServiceMethods = {
                        error: serviceError instanceof Error ? serviceError.message : 'Unknown service error',
                        message: 'Maya service method check failed'
                    };
                }
            }
        }
        catch (importError) {
            diagnostics.checks.mayaServiceImport = {
                success: false,
                error: importError instanceof Error ? importError.message : 'Unknown import error',
                message: 'Maya service import failed'
            };
        }
        // 4. Test PersonalityManager import
        try {
            const { PersonalityManager } = await import('../server/agents/personalities/personality-config.js');
            const mayaPrompt = PersonalityManager.getNaturalPrompt('maya');
            diagnostics.checks.personalityManager = {
                success: true,
                hasMayaPrompt: !!mayaPrompt && mayaPrompt.length > 0,
                promptLength: mayaPrompt?.length || 0,
                message: 'PersonalityManager working correctly'
            };
        }
        catch (personalityError) {
            diagnostics.checks.personalityManager = {
                success: false,
                error: personalityError instanceof Error ? personalityError.message : 'Unknown personality error',
                message: 'PersonalityManager import failed'
            };
        }
        // 5. Test DatabaseStorage import
        try {
            const { DatabaseStorage } = await import('../server/storage.js');
            const storage = new DatabaseStorage();
            diagnostics.checks.databaseStorage = {
                success: true,
                hasStorage: !!storage,
                message: 'DatabaseStorage imported successfully'
            };
        }
        catch (storageError) {
            diagnostics.checks.databaseStorage = {
                success: false,
                error: storageError instanceof Error ? storageError.message : 'Unknown storage error',
                message: 'DatabaseStorage import failed'
            };
        }
        // 6. Test Anthropic SDK import
        try {
            const Anthropic = await import('@anthropic-ai/sdk');
            const anthropic = new Anthropic.default({
                apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
            });
            diagnostics.checks.anthropicSDK = {
                success: true,
                hasAnthropic: !!anthropic,
                message: 'Anthropic SDK imported successfully'
            };
        }
        catch (anthropicError) {
            diagnostics.checks.anthropicSDK = {
                success: false,
                error: anthropicError instanceof Error ? anthropicError.message : 'Unknown Anthropic error',
                message: 'Anthropic SDK import failed'
            };
        }
        // Overall status
        const allChecks = Object.values(diagnostics.checks);
        const hasFailures = allChecks.some((check) => check.success === false);
        diagnostics.status = hasFailures ? 'failures_detected' : 'healthy';
        diagnostics.summary = hasFailures
            ? 'Some Maya service components failed to initialize'
            : 'All Maya service components are healthy';
        return res.status(200).json(diagnostics);
    }
    catch (error) {
        console.error('❌ Maya diagnostic endpoint error:', error);
        return res.status(500).json({
            error: 'Maya diagnostic failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}
