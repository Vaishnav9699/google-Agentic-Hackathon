/**
 * TaskForge Agent Runtime Engine (Zero Dependencies)
 * Dynamic Gemini 3.5 Reasoning Loop & Tool Execution Engine.
 */

import { AVAILABLE_TOOLS } from "./agentTools.js";
import { ModelArmor } from "./modelArmor.js";
import { globalMemoryBank } from "./memoryBank.js";

export class AgentRuntime {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  async executeTask({ taskGoal, trackCategory = "Taskmaster", sessionId = "default-session", onTelemetryUpdate }) {
    const traceId = `trace-${Date.now()}`;
    const emitter = (step) => {
      const trace = globalMemoryBank.logTelemetry({ traceId, sessionId, ...step });
      if (onTelemetryUpdate) onTelemetryUpdate(trace);
    };

    emitter({ type: "INIT", message: `Agent Runtime initialized for directive: "${taskGoal}"`, trackCategory });

    // Step 1: Security Inspection via Model Armor
    emitter({ type: "GUARDRAIL_CHECK", message: "Inspecting input prompt via Model Armor guardrails..." });
    const armorCheck = ModelArmor.inspectPrompt(taskGoal);
    
    if (!armorCheck.isSafe) {
      emitter({ type: "GUARDRAIL_BLOCKED", flags: armorCheck.flags, message: "Model Armor blocked execution due to security policy flags." });
      return { success: false, reason: "Security Policy Blocked", flags: armorCheck.flags };
    }
    
    emitter({ type: "GUARDRAIL_PASSED", message: "Model Armor zero-trust verification complete. Inputs clear." });

    // Step 2: Query Enterprise Agent Registry for context
    emitter({ type: "THOUGHT", thought: `Analyzing directive: "${armorCheck.sanitizedPrompt}"...` });
    
    // Check if user clicked a specific tool directly
    let targetToolName = null;
    for (const tool of AVAILABLE_TOOLS) {
      if (taskGoal.toLowerCase().includes(tool.name.toLowerCase())) {
        targetToolName = tool.name;
        break;
      }
    }

    // Step 3: Call Gemini API if Key is present
    let geminiReasoning = "";
    if (this.apiKey) {
      try {
        emitter({ type: "THOUGHT", thought: "Consulting Gemini 3.5 Flash for autonomous task planning..." });
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are TaskForge Autonomous Agent. Analyze this goal and output a 1-sentence action plan: ${armorCheck.sanitizedPrompt}` }] }]
          })
        });
        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          geminiReasoning = data.candidates[0].content.parts[0].text.trim();
          emitter({ type: "THOUGHT", thought: `Gemini 3.5 Plan: "${geminiReasoning}"` });
        }
      } catch (err) {
        emitter({ type: "WARNING", message: `Gemini API note: ${err.message}` });
      }
    }

    // Step 4: Execute Specific Tool dynamically
    let executionSteps = [];

    if (targetToolName) {
      // Execute the exact tool requested by the user
      const toolObj = AVAILABLE_TOOLS.find(t => t.name === targetToolName);
      emitter({ type: "THOUGHT", thought: `Executing requested tool: ${targetToolName}...` });
      const result = await toolObj.execute({ category: "all", targetSystem: "gcp-cloud-run-production", pipelineId: "pipe-v2", serviceName: "taskforge-agent-runtime" });
      emitter({ type: "ACTION", tool: targetToolName, output: result });
      executionSteps.push({ tool: targetToolName, result });
    } else {
      // Dynamic execution routing based on prompt intent
      const lowerGoal = taskGoal.toLowerCase();

      if (lowerGoal.includes("audit") || lowerGoal.includes("security") || lowerGoal.includes("log") || trackCategory === "Enterprise Fleet") {
        emitter({ type: "THOUGHT", thought: "Scanning GCP Cloud Run production logs for security anomalies..." });
        const secTool = AVAILABLE_TOOLS.find(t => t.name === "audit_security_logs");
        const secRes = await secTool.execute({ targetSystem: "gcp-cloud-run-production", logLines: 250 });
        emitter({ type: "ACTION", tool: "audit_security_logs", output: secRes });
        executionSteps.push({ tool: "audit_security_logs", result: secRes });

        emitter({ type: "THOUGHT", thought: "Applying hotfix patch to Cloud Run infrastructure..." });
        const patchTool = AVAILABLE_TOOLS.find(t => t.name === "deploy_patch_job");
        const patchRes = await patchTool.execute({ serviceName: "taskforge-agent-runtime", patchVersion: "v1.0.5-hotfix" });
        emitter({ type: "ACTION", tool: "deploy_patch_job", output: patchRes });
        executionSteps.push({ tool: "deploy_patch_job", result: patchRes });
      } else if (lowerGoal.includes("reconcile") || lowerGoal.includes("pipeline") || lowerGoal.includes("data")) {
        emitter({ type: "THOUGHT", thought: "Reconciling Firestore and Cloud SQL data pipelines..." });
        const dataTool = AVAILABLE_TOOLS.find(t => t.name === "reconcile_data_pipeline");
        const dataRes = await dataTool.execute({ pipelineId: "pipe-analytics-v2", autoFixDiscrepancies: true });
        emitter({ type: "ACTION", tool: "reconcile_data_pipeline", output: dataRes });
        executionSteps.push({ tool: "reconcile_data_pipeline", result: dataRes });
      } else {
        emitter({ type: "THOUGHT", thought: "Discovering enterprise agents catalog..." });
        const regTool = AVAILABLE_TOOLS.find(t => t.name === "query_enterprise_registry");
        const regRes = await regTool.execute({ category: "all" });
        emitter({ type: "ACTION", tool: "query_enterprise_registry", output: regRes });
        executionSteps.push({ tool: "query_enterprise_registry", result: regRes });
      }
    }

    // Step 5: Executive Digest Generation & Memory Commit
    emitter({ type: "THOUGHT", thought: "Generating compliance digest & committing state to Firestore Memory Bank..." });
    const digestTool = AVAILABLE_TOOLS.find(t => t.name === "generate_executive_digest");
    const digestRes = await digestTool.execute({ summaryTitle: `Report: ${taskGoal.substring(0, 45)}...`, findingsCount: executionSteps.length });
    emitter({ type: "ACTION", tool: "generate_executive_digest", output: digestRes });

    globalMemoryBank.saveSessionMemory(sessionId, {
      taskGoal,
      traceId,
      executionSteps,
      geminiReasoning,
      status: "SUCCESS"
    });

    emitter({ type: "COMPLETE", message: `Task directive completed successfully. State saved under Trace ID: ${traceId}`, traceId });

    return {
      success: true,
      traceId,
      digest: digestRes,
      executionSteps
    };
  }
}
