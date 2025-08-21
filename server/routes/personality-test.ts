/**
 * PERSONALITY ENHANCEMENT TEST - Show actual personality vs generic responses
 */

import express from 'express';
import { PersonalityManager, PURE_PERSONALITIES } from '../agents/personalities/personality-config';

const router = express.Router();

/**
 * Test endpoint to show enhanced personality prompts
 */
router.get('/test-personality/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Get agent configuration
    const agentConfig = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent "${agentId}" not found`,
        availableAgents: Object.keys(PURE_PERSONALITIES)
      });
    }

    // Generate enhanced personality prompt
    const enhancedPrompt = PersonalityManager.getNaturalPrompt(agentId);
    
    // Show comparison
    const basicPrompt = `You are ${agentConfig.name}, a helpful AI assistant.`;
    
    res.json({
      success: true,
      agent: agentId,
      agentName: agentConfig.name,
      personalityData: {
        role: agentConfig.role,
        description: agentConfig.description,
        traits: agentConfig.traits,
        voice: agentConfig.voice,
        expertise: agentConfig.expertise?.specializations?.slice(0, 3) || [],
        samplePhrases: agentConfig.voice?.samplePhrases?.slice(0, 3) || []
      },
      promptComparison: {
        basic: {
          prompt: basicPrompt,
          length: basicPrompt.length,
          personality: "Generic"
        },
        enhanced: {
          prompt: enhancedPrompt.substring(0, 500) + '...',
          fullLength: enhancedPrompt.length,
          personality: "Rich & Detailed"
        }
      },
      expectedResponse: {
        withoutPersonality: "Hello! I'm doing great - focused and ready to help!",
        withPersonality: agentConfig.voice?.samplePhrases?.[0] || agentConfig.voice?.tone || "Personality-driven response"
      }
    });

  } catch (error) {
    console.error('Personality test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test all agents personality data
 */
router.get('/test-all-personalities', async (req, res) => {
  try {
    const allAgents = Object.keys(PURE_PERSONALITIES).map(agentId => {
      const config = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
      const prompt = PersonalityManager.getNaturalPrompt(agentId);
      
      return {
        id: agentId,
        name: config.name,
        role: config.role,
        promptLength: prompt.length,
        hasPersonalityPhrases: !!config.voice?.samplePhrases?.length,
        samplePhrase: config.voice?.samplePhrases?.[0] || 'No sample phrases',
        traits: config.traits?.primary || []
      };
    });

    res.json({
      success: true,
      totalAgents: allAgents.length,
      agents: allAgents,
      summary: {
        avgPromptLength: Math.round(allAgents.reduce((sum, agent) => sum + agent.promptLength, 0) / allAgents.length),
        agentsWithPhrases: allAgents.filter(a => a.hasPersonalityPhrases).length,
        personalityStrength: allAgents.length > 10 ? "STRONG" : "WEAK"
      }
    });

  } catch (error) {
    console.error('All personalities test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;