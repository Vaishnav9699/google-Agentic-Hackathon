/**
 * Memory Bank Module
 * Manages persistent cross-session memory snapshots and execution traces.
 * Emulates Firestore persistent context.
 */

export class MemoryBank {
  constructor() {
    this.sessions = new Map();
    this.auditLogs = [];
  }

  saveSessionMemory(sessionId, memoryData) {
    const existing = this.sessions.get(sessionId) || { history: [], createdAt: new Date().toISOString() };
    existing.history.push({
      timestamp: new Date().toISOString(),
      ...memoryData
    });
    existing.lastUpdated = new Date().toISOString();
    this.sessions.set(sessionId, existing);
  }

  getSessionMemory(sessionId) {
    return this.sessions.get(sessionId) || { history: [], createdAt: new Date().toISOString() };
  }

  logTelemetry(event) {
    const traceRecord = {
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.auditLogs.unshift(traceRecord);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop(); // Keep last 200 traces
    }
    return traceRecord;
  }

  getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }
}

export const globalMemoryBank = new MemoryBank();
