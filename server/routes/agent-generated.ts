// BUILD Feature API Routes - Added to server/routes.ts

// POST /api/build/onboarding - Save user onboarding data
app.post("/api/build/onboarding", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const {
      businessName,
      industry,
      targetAudience,
      brandPersonality,
      goals,
      currentWebsite,
      preferredColors,
      designStyle,
      contentNeeds
    } = req.body;

    // Validate required fields
    if (!businessName || !industry || !targetAudience) {
      return res.status(400).json({ 
        error: "Business name, industry, and target audience are required" 
      });
    }

    // Check if onboarding already exists
    const existingOnboarding = await db
      .select()
      .from(buildOnboarding)
      .where(eq(buildOnboarding.userId, userId))
      .limit(1);

    let result;
    
    if (existingOnboarding.length > 0) {
      // Update existing onboarding
      result = await db
        .update(buildOnboarding)
        .set({
          businessName,
          industry,
          targetAudience,
          brandPersonality,
          goals,
          currentWebsite,
          preferredColors,
          designStyle,
          contentNeeds,
          updatedAt: new Date()
        })
        .where(eq(buildOnboarding.userId, userId))
        .returning();
    } else {
      // Create new onboarding
      result = await db
        .insert(buildOnboarding)
        .values({
          userId,
          businessName,
          industry,
          targetAudience,
          brandPersonality,
          goals,
          currentWebsite,
          preferredColors,
          designStyle,
          contentNeeds
        })
        .returning();
    }

    res.json({ 
      success: true, 
      onboarding: result[0],
      message: "Onboarding data saved successfully"
    });
  } catch (error) {
    console.error("Build onboarding error:", error);
    res.status(500).json({ 
      error: "Failed to save onboarding data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/build/onboarding - Get existing onboarding
app.get("/api/build/onboarding", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const onboarding = await db
      .select()
      .from(buildOnboarding)
      .where(eq(buildOnboarding.userId, userId))
      .limit(1);

    if (onboarding.length === 0) {
      return res.json({ 
        success: true, 
        onboarding: null,
        message: "No onboarding data found"
      });
    }

    res.json({ 
      success: true, 
      onboarding: onboarding[0]
    });
  } catch (error) {
    console.error("Get build onboarding error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve onboarding data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/build/conversation - Get or create chat conversation
app.get("/api/build/conversation", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check for existing conversation
    let conversation = await db
      .select()
      .from(buildConversations)
      .where(eq(buildConversations.userId, userId))
      .limit(1);

    if (conversation.length === 0) {
      // Create new conversation
      const newConversation = await db
        .insert(buildConversations)
        .values({
          userId,
          title: "Website Build Chat",
          status: "active"
        })
        .returning();
      
      conversation = newConversation;
    }

    // Get conversation messages
    const messages = await db
      .select()
      .from(buildMessages)
      .where(eq(buildMessages.conversationId, conversation[0].id))
      .orderBy(asc(buildMessages.createdAt));

    res.json({ 
      success: true, 
      conversation: conversation[0],
      messages: messages
    });
  } catch (error) {
    console.error("Build conversation error:", error);
    res.status(500).json({ 
      error: "Failed to get conversation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/build/chat - Handle Victoria website chat messages
app.post("/api/build/chat", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { message, conversationId } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({ 
        error: "Message and conversation ID are required" 
      });
    }

    // Verify conversation belongs to user
    const conversation = await db
      .select()
      .from(buildConversations)
      .where(
        and(
          eq(buildConversations.id, conversationId),
          eq(buildConversations.userId, userId)
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Save user message
    const userMessage = await db
      .insert(buildMessages)
      .values({
        conversationId,
        role: "user",
        content: message
      })
      .returning();

    // Get user's onboarding data for context
    const onboarding = await db
      .select()
      .from(buildOnboarding)
      .where(eq(buildOnboarding.userId, userId))
      .limit(1);

    // Generate Victoria's response based on onboarding context
    let victoriaResponse = "I understand you want to discuss your website. ";
    
    if (onboarding.length > 0) {
      const data = onboarding[0];
      victoriaResponse += `For your ${data.businessName} business in ${data.industry}, `;
      
      if (message.toLowerCase().includes("color")) {
        victoriaResponse += `I recommend staying with your preferred ${data.preferredColors} color scheme. This aligns with your ${data.designStyle} design style.`;
      } else if (message.toLowerCase().includes("content")) {
        victoriaResponse += `let's focus on content that resonates with ${data.targetAudience}. Based on your ${data.brandPersonality} brand personality, we should emphasize ${data.goals}.`;
      } else if (message.toLowerCase().includes("design")) {
        victoriaResponse += `your ${data.designStyle} design preference will work beautifully. We can create a luxury editorial style that reflects your brand's sophistication.`;
      } else {
        victoriaResponse += `let's create something that speaks to ${data.targetAudience} while showcasing your ${data.brandPersonality} brand personality.`;
      }
    } else {
      victoriaResponse += "Let me help you create a stunning website. Would you like to start with your business goals or design preferences?";
    }

    // Save Victoria's response
    const assistantMessage = await db
      .insert(buildMessages)
      .values({
        conversationId,
        role: "assistant",
        content: victoriaResponse
      })
      .returning();

    // Update conversation timestamp
    await db
      .update(buildConversations)
      .set({ updatedAt: new Date() })
      .where(eq(buildConversations.id, conversationId));

    res.json({ 
      success: true, 
      userMessage: userMessage[0],
      assistantMessage: assistantMessage[0],
      message: "Chat message processed successfully"
    });
  } catch (error) {
    console.error("Build chat error:", error);
    res.status(500).json({ 
      error: "Failed to process chat message",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});