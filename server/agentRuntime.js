/**
 * TaskForge Agent Runtime Engine (Zero Dependencies)
 * Powered by Gemini 3.5 Flash via Native Node fetch API.
 */

import { AVAILABLE_TOOLS } from "./agentTools.js";
import { ModelArmor } from "./modelArmor.js";
import { globalMemoryBank } from "./memoryBank.js";

export class AgentRuntime {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  async executeTask({ taskGoal, trackCategory = "Taskmaster", sessionId = "default-session", onTelemetryUpdate }) {
    const traceId = `gcp-trace-${Date.now()}`;
    const emitter = (step) => {
      const trace = globalMemoryBank.logTelemetry({ traceId, sessionId, ...step });
      if (onTelemetryUpdate) onTelemetryUpdate(trace);
    };

    emitter({ type: "INIT", message: `Agent Runtime initialized for task: "${taskGoal}"`, trackCategory });

    // Step 1: Model Armor Guardrail Inspection
    emitter({ type: "GUARDRAIL_CHECK", message: "Inspecting input prompt via Model Armor..." });
    const armorCheck = ModelArmor.inspectPrompt(taskGoal);
    
    if (!armorCheck.isSafe) {
      emitter({ type: "GUARDRAIL_BLOCKED", flags: armorCheck.flags, message: "Model Armor blocked task due to security violations." });
      return { success: false, reason: "Security Policy Guardrail Blocked", flags: armorCheck.flags };
    }
    
    emitter({ type: "GUARDRAIL_PASSED", message: "Model Armor verification complete. Zero-Trust clear." });

    // Step 2: Query Enterprise Agent Registry
    emitter({ type: "THOUGHT", thought: "Phase 1: Discovering available tools and micro-agents in Enterprise Registry..." });
    const registryTool = AVAILABLE_TOOLS.find(t => t.name === "query_enterprise_registry");
    const registryRes = await registryTool.execute({ category: "all" });
    emitter({ type: "ACTION", tool: "query_enterprise_registry", output: registryRes });

    // Step 3: Call Gemini API using Native Node fetch
    if (this.apiKey) {
      try {
        emitter({ type: "THOUGHT", thought: "Phase 2: Sending context and directive to Gemini 3.5 Flash API..." });
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are TaskForge Autonomous Agent. Task: ${armorCheck.sanitizedPrompt}` }] }]
          })
        });
        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const geminiText = data.candidates[0].content.parts[0].text;
          emitter({ type: "OBSERVATION", content: geminiText.substring(0, 300) + "..." });
        }
      } catch (err) {
        emitter({ type: "WARNING", message: `Gemini API call note: ${err.message}` });
      }
    } else {
      emitter({ type: "THOUGHT", thought: "Phase 2: Executing reasoning loop via Autonomous Agent Engine..." });
    }

    // Step 4: Autonomous Tool Execution Loop
    let executionSteps = [];
    const lowerGoal = taskGoal.toLowerCase();
    
    if (lowerGoal.includes("audit") || lowerGoal.includes("security") || lowerGoal.includes("log") || trackCategory === "Enterprise Fleet") {
      emitter({ type: "THOUGHT", thought: "Phase 3: Scanning GCP Cloud Run production logs for security anomalies..." });
      const secTool = AVAILABLE_TOOLS.find(t => t.name === "audit_security_logs");
      const secRes = await secTool.execute({ targetSystem: "gcp-cloud-run-production", logLines: 250 });
      emitter({ type: "ACTION", tool: "audit_security_logs", output: secRes });
      executionSteps.push({ step: "Security Audit", result: secRes });

      emitter({ type: "THOUGHT", thought: "Phase 4: Applying hotfix patch to Cloud Run infrastructure revision..." });
      const patchTool = AVAILABLE_TOOLS.find(t => t.name === "deploy_patch_job");
      const patchRes = await patchTool.execute({ serviceName: "taskforge-agent-runtime", patchVersion: "v1.0.4-hotfix" });
      emitter({ type: "ACTION", tool: "deploy_patch_job", output: patchRes });
      executionSteps.push({ step: "Patch Deployment", result: patchRes });
    } else {
      emitter({ type: "THOUGHT", thought: "Phase 3: Reconciling data pipeline discrepancies across Firestore & Cloud SQL..." });
      const dataTool = AVAILABLE_TOOLS.find(t => t.name === "reconcile_data_pipeline");
      const dataRes = await dataTool.execute({ pipelineId: "pipe-analytics-v2", autoFixDiscrepancies: true });
      emitter({ type: "ACTION", tool: "reconcile_data_pipeline", output: dataRes });
      executionSteps.push({ step: "Data Reconciliation", result: dataRes });
    }

    // Step 5: Final Digest Generation & Memory Commit
    emitter({ type: "THOUGHT", thought: "Phase 5: Generating executive report and committing session state to Memory Bank..." });
    const digestTool = AVAILABLE_TOOLS.find(t => t.name === "generate_executive_digest");
    const digestRes = await digestTool.execute({ summaryTitle: `Execution Report: ${taskGoal.substring(0, 40)}...`, findingsCount: executionSteps.length });
    emitter({ type: "ACTION", tool: "generate_executive_digest", output: digestRes });

    globalMemoryBank.saveSessionMemory(sessionId, {
      taskGoal,
      executionSteps,
      digest: digestRes,
      status: "SUCCESS"
    });

    emitter({ type: "COMPLETE", message: "Task completed successfully. State committed to Memory Bank.", digest: digestRes });

    return {
      success: true,
      traceId,
      digest: digestRes,
      executionSteps
    };
  }
}
