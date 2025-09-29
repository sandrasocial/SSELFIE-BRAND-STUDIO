class LiveSessionsManager {
    sessionStates = new Map();
    reactionCounts = new Map();
    initialize(server) {
        console.log('🔄 Live Sessions Manager initialized (stub mode)');
    }
    getSessionState(sessionId) {
        return this.sessionStates.get(sessionId) || null;
    }
    updateState(sessionId, state) {
        this.sessionStates.set(sessionId, state);
    }
    getReactionCounts(sessionId) {
        return this.reactionCounts.get(sessionId) || {};
    }
    updateReactionCounts(sessionId, reactions) {
        this.reactionCounts.set(sessionId, reactions);
    }
    removeSession(sessionId) {
        this.sessionStates.delete(sessionId);
        this.reactionCounts.delete(sessionId);
    }
    getActiveSessions() {
        return Array.from(this.sessionStates.keys());
    }
    clearAllSessions() {
        this.sessionStates.clear();
        this.reactionCounts.clear();
    }
}
export const liveSessionsManager = new LiveSessionsManager();
//# sourceMappingURL=live-sessions.js.map