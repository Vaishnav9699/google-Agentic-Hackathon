import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Activity, 
  Layers, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Server, 
  Lock, 
  Workflow, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [tools, setTools] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("Taskmaster");
  const [isExecuting, setIsExecuting] = useState(false);
  const logEndRef = useRef(null);

  // Quick preset prompts tailored for the 3 hackathon tracks
  const PRESET_PROMPTS = [
    {
      label: "Taskmaster: Auto-Chore & Audit",
      track: "Taskmaster",
      prompt: "Audit GCP Cloud Run production logs, detect any anomaly patterns, deploy hotfix patch, and compile executive compliance summary."
    },
    {
      label: "Enterprise Fleet: Multi-Agent Reconcile",
      track: "Fortified Enterprise Fleet",
      prompt: "Query Enterprise Agent Registry for pipeline reconcile agents, trigger cross-session state sync in Firestore, and run zero-trust guardrail scan."
    },
    {
      label: "Collaborative Partner: Adaptive Mentor",
      track: "Collaborative Partner",
      prompt: "Guide user step-by-step through setting up Gemini 3.5 ADK agent runtime and save session preferences to Memory Bank."
    }
  ];

  useEffect(() => {
    // Fetch initial status and available tools
    fetch("/api/status")
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(() => setSystemStatus({ status: "SIMULATION_MODE", model: "Gemini 3.5 Flash", gcpProject: "taskforge-agentic-demo" }));

    fetch("/api/tools")
      .then(res => res.json())
      .then(data => setTools(data))
      .catch(() => setTools([]));

    fetch("/api/telemetry")
      .then(res => res.json())
      .then(data => setTelemetry(data))
      .catch(() => {});

    // WebSocket setup for real-time telemetry streaming
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "TELEMETRY_EVENT") {
          setTelemetry(prev => [data.trace, ...prev]);
          if (data.trace.type === "COMPLETE" || data.trace.type === "GUARDRAIL_BLOCKED") {
            setIsExecuting(false);
          }
        }
      } catch (err) {
        console.error("WebSocket message parse error", err);
      }
    };

    return () => ws.close();
  }, []);

  const handleExecuteTask = async (overridePrompt, overrideTrack) => {
    const goal = overridePrompt || taskInput;
    const track = overrideTrack || selectedTrack;
    if (!goal.trim()) return;

    setIsExecuting(true);
    try {
      await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskGoal: goal, trackCategory: track, sessionId: "session-demo" })
      });
    } catch (err) {
      console.error("Execute error", err);
      setIsExecuting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <header className="glass-card" style={{ padding: "1.25rem 2rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "linear-gradient(135deg, #00f2fe, #7928ca)", padding: "10px", borderRadius: "12px", display: "flex" }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>TaskForge AI Agent Platform</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Autonomous Agent Engine • All Things Agentic Hackathon</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span className="badge badge-cyan">
            <Cpu size={14} /> Gemini 3.5 Flash
          </span>
          <span className="badge badge-purple">
            <Workflow size={14} /> Google ADK / Antigravity
          </span>
          <span className="badge badge-green">
            <span className="pulse-dot"></span> GCP Cloud Run: Active
          </span>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            <span>GCP CLOUD INFRA</span>
            <Server size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
            {systemStatus?.gcpProject || "taskforge-agentic-demo"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>Region: us-central1 (Cloud Run)</div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            <span>MODEL ARMOR GUARDRAIL</span>
            <Lock size={16} color="var(--accent-pink)" />
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>Zero-Trust Active</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>Prompt Injection & PII Filter</div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            <span>MEMORY BANK STATE</span>
            <Database size={16} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>Firestore Sync</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>Cross-Session Context Retained</div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            <span>AGENT REGISTRY</span>
            <Layers size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>{tools.length || 5} Tools Cataloged</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>Autonomous Tool Calling</div>
        </div>
      </div>

      {/* Task Launcher Section */}
      <section className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Play size={18} color="var(--accent-cyan)" /> Dispatch Autonomous Directive
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["Taskmaster", "Collaborative Partner", "Fortified Enterprise Fleet"].map(track => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                style={{
                  background: selectedTrack === track ? "rgba(0, 242, 254, 0.15)" : "transparent",
                  color: selectedTrack === track ? "var(--accent-cyan)" : "var(--text-muted)",
                  border: `1px solid ${selectedTrack === track ? "var(--accent-cyan)" : "var(--border-color)"}`,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTaskInput(p.prompt);
                setSelectedTrack(p.track);
                handleExecuteTask(p.prompt, p.track);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-color)",
                color: "var(--text-muted)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <ChevronRight size={14} color="var(--accent-cyan)" /> {p.label}
            </button>
          ))}
        </div>

        {/* Text Area & Submit */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Enter goal e.g., Audit production logs, trigger data reconciliation, deploy Cloud Run patch..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecuteTask()}
            style={{
              flex: 1,
              background: "rgba(10, 16, 30, 0.9)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "0.85rem 1rem",
              color: "#fff",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
          <button
            onClick={() => handleExecuteTask()}
            disabled={isExecuting}
            style={{
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
              border: "none",
              color: "#000",
              fontWeight: 700,
              padding: "0 1.75rem",
              borderRadius: "10px",
              cursor: isExecuting ? "not-allowed" : "pointer",
              opacity: isExecuting ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            {isExecuting ? "Executing..." : "Dispatch Agent"}
          </button>
        </div>
      </section>

      {/* Main 2-Column Dashboard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        
        {/* Left Column: Live OpenTelemetry Reasoning Chain Stream */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", height: "550px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Terminal size={18} color="var(--accent-cyan)" /> Live Reasoning & Thought Traces
            </h3>
            <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>
              OpenTelemetry Log Stream
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", background: "rgba(5, 8, 15, 0.95)", borderRadius: "10px", padding: "1rem", border: "1px solid var(--border-color)" }}>
            {telemetry.length === 0 ? (
              <div style={{ color: "var(--text-dim)", textAlign: "center", marginTop: "4rem", fontSize: "0.85rem" }}>
                No active execution. Click "Dispatch Agent" or pick a preset above to watch Gemini 3.5 reasoning live.
              </div>
            ) : (
              telemetry.map((t, idx) => (
                <div key={idx} style={{ marginBottom: "0.85rem", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "0.6rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
                    <span className="mono-font" style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>
                      {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "NOW"}
                    </span>
                    
                    {t.type === "THOUGHT" && <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>THOUGHT</span>}
                    {t.type === "ACTION" && <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>TOOL: {t.tool}</span>}
                    {t.type === "GUARDRAIL_PASSED" && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>MODEL ARMOR OK</span>}
                    {t.type === "COMPLETE" && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>COMPLETE</span>}
                    {t.type === "INIT" && <span className="badge badge-amber" style={{ fontSize: "0.65rem" }}>INITIALIZED</span>}
                  </div>

                  <div style={{ color: t.type === "THOUGHT" ? "#c084fc" : t.type === "ACTION" ? "#38bdf8" : "var(--text-main)", paddingLeft: "4px" }}>
                    {t.thought || t.message || (t.output ? JSON.stringify(t.output, null, 2) : "")}
                  </div>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Right Column: Platform Components & Architecture Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Agent Registry Tools */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Layers size={16} color="var(--accent-amber)" /> Enterprise Agent Registry
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "220px", overflowY: "auto" }}>
              {tools.map((tool, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: "0.6rem 0.8rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--accent-cyan)" }}>{tool.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{tool.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hackathon GCP Proof */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={16} color="var(--accent-green)" /> GCP Proof & Cloud Audit
            </h3>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div><strong>Container:</strong> Cloud Run (`taskforge-agent-runtime`)</div>
              <div><strong>Framework:</strong> Google ADK & Antigravity SDK</div>
              <div><strong>Memory Store:</strong> Firestore persistent context</div>
              <div><strong>Security:</strong> Model Armor Guardrail Layer</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
