import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Lenis from "lenis";

const COLORS = {
  cream: "#FFF8D6",
  darkGreen: "#0D3B2A",
  yellow: "#F6BE00",
  borderGreen: "#88A96B",
};

const EXAMPLE_PROMPTS = [
  "Build a CRM for real estate with WhatsApp notifications",
  "Task manager for engineering teams with Slack alerts",
  "E-commerce store with Stripe payments",
  "Project tracker synced to Notion",
];

const LANGUAGES = [
  { code: "en", name: "🇬🇧 English" },
  { code: "hi", name: "🇮🇳 हिंदी" },
  { code: "zh", name: "🇨🇳 中文" },
  { code: "fr", name: "🇫🇷 Français" },
  { code: "es", name: "🇪🇸 Español" },
  { code: "ja", name: "🇯🇵 日本語" },
  { code: "ko", name: "🇰🇷 한국어" },
  { code: "it", name: "🇮🇹 Italiano" },
];

const INTEGRATIONS = [
  { id: "slack", type: "Slack", icon: "💬", desc: "Send notifications to Slack channels and DMs" },
  { id: "gmail", type: "Gmail", icon: "📧", desc: "Send emails automatically from your app" },
  { id: "stripe", type: "Stripe", icon: "💳", desc: "Accept payments and manage subscriptions" },
  { id: "notion", type: "Notion", icon: "📝", desc: "Sync data with Notion databases" },
  { id: "airtable", type: "Airtable", icon: "📊", desc: "Store and manage data in Airtable" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 2000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent, prompt?: string) => {
    e.preventDefault();
    const finalInput = prompt || input;
    if (!finalInput.trim()) return;

    setLoading(true);
    setSpec(null);

    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: finalInput }),
      });

      if (!prompt) setInput("");

      setTimeout(() => {
        const mockSpec = {
          name: "Your App is Ready to Explore",
          description: finalInput.substring(0, 100),
          pages: [
            { id: "1", name: "List View", type: "list" },
            { id: "2", name: "Detail View", type: "detail" },
            { id: "3", name: "Create Form", type: "form" },
          ],
          components: [
            { id: "c1", label: "Title Input", type: "text-input" },
            { id: "c2", label: "Description", type: "textarea" },
            { id: "c3", label: "Status", type: "select" },
            { id: "c4", label: "Save Button", type: "button" },
            { id: "c5", label: "Delete Button", type: "button" },
          ],
          integrations: [
            { id: "slack", type: "Slack" },
            { id: "gmail", type: "Gmail" },
          ],
        };

        setSpec(mockSpec);
        setLoading(false);

        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }, 1000);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
      showToast("Copied to Clipboard!");
    } catch (err) {
      showToast("Failed to copy");
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(spec, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appspec-config.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded JSON");
  };

  const downloadYAML = () => {
    const yaml = convertToYAML(spec);
    const dataBlob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appspec-config.yaml";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded YAML");
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(spec, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appspec.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Config exported");
  };

  const convertToYAML = (obj: any, indent = 0): string => {
    let yaml = "";
    const pad = " ".repeat(indent);

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        yaml += `${pad}- ${typeof item === "object" ? "\n" + convertToYAML(item, indent + 2) : item}\n`;
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          yaml += `${pad}${key}:\n${convertToYAML(value, indent + 2)}`;
        } else {
          yaml += `${pad}${key}: ${value}\n`;
        }
      });
    } else {
      yaml += `${pad}${obj}\n`;
    }

    return yaml;
  };

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        * { scrollbar-width: thin; scrollbar-color: ${COLORS.borderGreen} transparent; }
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${COLORS.borderGreen}; border-radius: 4px; }
        *::-webkit-scrollbar-thumb:hover { background: ${COLORS.darkGreen}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .toast-enter { animation: slideUp 0.3s ease-out; }
      `}</style>

      {/* Toast Notification */}
      {toast.visible && (
        <div
          className="toast-enter"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: COLORS.darkGreen,
            color: COLORS.cream,
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Integration Modal */}
      {selectedIntegration && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setSelectedIntegration(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "400px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "32px", marginBottom: "15px" }}>{selectedIntegration.icon}</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "10px" }}>
              {selectedIntegration.type}
            </h3>
            <p style={{ fontSize: "13px", color: COLORS.borderGreen, marginBottom: "20px", lineHeight: 1.6 }}>
              {selectedIntegration.desc}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  showToast(`${selectedIntegration.type} added to your config`);
                  setSelectedIntegration(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: COLORS.yellow,
                  color: COLORS.darkGreen,
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Add to Config
              </button>
              <button
                onClick={() => setSelectedIntegration(null)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: COLORS.cream,
                  color: COLORS.darkGreen,
                  border: `1px solid ${COLORS.borderGreen}`,
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "white",
          borderBottom: `1px solid ${COLORS.borderGreen}30`,
          padding: "12px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 700 }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: COLORS.darkGreen,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.cream,
              fontSize: "14px",
            }}
          >
            ✨
          </div>
          <span style={{ color: COLORS.darkGreen, fontSize: "15px" }}>AppSpec</span>
          {loading && (
            <div
              style={{
                width: "14px",
                height: "14px",
                border: `2px solid ${COLORS.borderGreen}`,
                borderTop: `2px solid ${COLORS.yellow}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <button
            onClick={() => scrollToSection("features")}
            style={{
              color: COLORS.darkGreen,
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = COLORS.yellow)}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = COLORS.darkGreen)}
          >
            Product
          </button>
          <button
            onClick={() => scrollToSection("howitworks")}
            style={{
              color: COLORS.darkGreen,
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = COLORS.yellow)}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = COLORS.darkGreen)}
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("footer")}
            style={{
              color: COLORS.darkGreen,
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = COLORS.yellow)}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = COLORS.darkGreen)}
          >
            Resources
          </button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: COLORS.darkGreen,
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              🌐
            </button>
            {showLanguageMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  backgroundColor: "white",
                  border: `1px solid ${COLORS.borderGreen}30`,
                  borderRadius: "8px",
                  padding: "8px",
                  minWidth: "160px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 1000,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: COLORS.darkGreen,
                      borderRadius: "4px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = COLORS.cream)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                  >
                    {lang.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            style={{
              padding: "8px 18px",
              backgroundColor: COLORS.yellow,
              color: COLORS.darkGreen,
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(246, 190, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            Start Building
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ padding: "60px 40px 80px", backgroundColor: COLORS.cream }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: COLORS.borderGreen,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "16px",
            }}
          >
            AppSpec
          </p>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: COLORS.darkGreen,
              marginBottom: "20px",
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            Turn your ideas into apps
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: COLORS.borderGreen,
              marginBottom: "50px",
              lineHeight: 1.6,
            }}
          >
            AppSpec Generator transforms your natural language descriptions into fully structured, machine-readable application blueprints in seconds.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "40px",
              maxWidth: "600px",
              margin: "0 auto 40px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Build me a CRM for real estate..."
              style={{
                flex: 1,
                height: "56px",
                padding: "14px 16px",
                fontSize: "14px",
                borderRadius: "10px",
                border: `1.5px solid ${COLORS.borderGreen}`,
                backgroundColor: "white",
                fontFamily: "inherit",
                resize: "none",
                color: COLORS.darkGreen,
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = COLORS.yellow;
                (e.target as HTMLTextAreaElement).style.boxShadow = `0 0 0 3px ${COLORS.yellow}20`;
              }}
              onBlur={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = COLORS.borderGreen;
                (e.target as HTMLTextAreaElement).style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                padding: "14px 28px",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: loading ? COLORS.borderGreen : COLORS.yellow,
                color: COLORS.darkGreen,
                border: "none",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(246, 190, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {loading ? "Building..." : "Generate"}
            </button>
          </form>

          <div>
            <p style={{ color: COLORS.borderGreen, fontSize: "11px", marginBottom: "12px", textTransform: "uppercase" }}>
              Try one of these:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSubmit(e, prompt)}
                  disabled={loading}
                  style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                    backgroundColor: "white",
                    color: COLORS.darkGreen,
                    border: `1px solid ${COLORS.borderGreen}`,
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    opacity: loading ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = COLORS.cream;
                    (e.target as HTMLButtonElement).style.borderColor = COLORS.yellow;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = "white";
                    (e.target as HTMLButtonElement).style.borderColor = COLORS.borderGreen;
                  }}
                >
                  {prompt.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: "80px 40px", backgroundColor: "white", borderTop: `1px solid ${COLORS.borderGreen}30` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "50px", textAlign: "center" }}>
            Why AppSpec?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
            {[
              { icon: "⚡", title: "Instant Generation", desc: "Create complete app specs in seconds, not hours" },
              { icon: "🔒", title: "Type Safe", desc: "Fully typed schemas and validated structures" },
              { icon: "🔗", title: "Integrations", desc: "Built-in support for Slack, Gmail, Stripe & more" },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: "30px",
                  backgroundColor: COLORS.cream,
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.borderGreen}20`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "15px" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "10px" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "13px", color: COLORS.borderGreen, lineHeight: 1.5 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" style={{ padding: "80px 40px", backgroundColor: COLORS.cream }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "50px", textAlign: "center" }}>
            How It Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { step: "01", title: "Describe", desc: "Tell us what you want to build in plain English" },
              { step: "02", title: "Analyze", desc: "Our AI extracts features, entities, and integrations" },
              { step: "03", title: "Generate", desc: "Get a complete, validated app specification" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "30px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.borderGreen}30`,
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: 700, color: COLORS.yellow, marginBottom: "15px" }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "10px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "13px", color: COLORS.borderGreen, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENERATOR SECTION */}
      {spec && (
        <section id="results" style={{ padding: "80px 40px", backgroundColor: "white" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "40px" }}>
              {spec.name}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              {/* LEFT SIDE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* UI */}
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: COLORS.darkGreen }}>UI</h3>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: COLORS.yellow }}>{spec.pages?.length || 0}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {spec.pages?.map((p: any) => (
                      <span
                        key={p.id}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: COLORS.darkGreen,
                          border: `1px solid ${COLORS.borderGreen}20`,
                        }}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Components */}
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: COLORS.darkGreen }}>Components</h3>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: COLORS.yellow }}>{spec.components?.length || 0}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {spec.components?.slice(0, 5).map((c: any) => (
                      <span
                        key={c.id}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: COLORS.darkGreen,
                          border: `1px solid ${COLORS.borderGreen}20`,
                        }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Database */}
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                  }}
                >
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "15px" }}>Database</h3>
                  <div style={{ fontSize: "12px", color: COLORS.borderGreen }}>
                    PostgreSQL • Optimized Schemas • Indexes
                  </div>
                </div>

                {/* Authentication */}
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                  }}
                >
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "15px" }}>Authentication</h3>
                  <div style={{ fontSize: "12px", color: COLORS.borderGreen }}>
                    JWT • Role-Based Access • Secure Sessions
                  </div>
                </div>

                {/* Schemas */}
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                  }}
                >
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "15px" }}>Integrations</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {INTEGRATIONS.map((int) => (
                      <button
                        key={int.id}
                        onClick={() => setSelectedIntegration(int)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "white",
                          color: COLORS.darkGreen,
                          border: `1px solid ${COLORS.borderGreen}`,
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = COLORS.yellow;
                          (e.target as HTMLButtonElement).style.borderColor = COLORS.yellow;
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = "white";
                          (e.target as HTMLButtonElement).style.borderColor = COLORS.borderGreen;
                        }}
                      >
                        {int.icon} {int.type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Full Config */}
                <div
                  style={{
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "15px 20px",
                      backgroundColor: COLORS.darkGreen,
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>Full Configuration</span>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: COLORS.yellow,
                        color: COLORS.darkGreen,
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.transform = "scale(1)";
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre
                    style={{
                      padding: "20px",
                      fontSize: "11px",
                      color: COLORS.darkGreen,
                      maxHeight: "300px",
                      overflowY: "auto",
                      margin: 0,
                      fontFamily: "'Fira Code', monospace",
                      lineHeight: 1.5,
                    }}
                  >
                    {JSON.stringify(spec, null, 2)}
                  </pre>
                </div>

                {/* Download Section */}
                <div
                  style={{
                    backgroundColor: COLORS.cream,
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.borderGreen}20`,
                    padding: "20px",
                  }}
                >
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: COLORS.darkGreen, marginBottom: "15px" }}>
                    Export Config
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      onClick={downloadJSON}
                      style={{
                        padding: "10px",
                        backgroundColor: "white",
                        color: COLORS.darkGreen,
                        border: `1px solid ${COLORS.borderGreen}`,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = COLORS.yellow;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = "white";
                      }}
                    >
                      📄 JSON
                    </button>
                    <button
                      onClick={downloadYAML}
                      style={{
                        padding: "10px",
                        backgroundColor: "white",
                        color: COLORS.darkGreen,
                        border: `1px solid ${COLORS.borderGreen}`,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = COLORS.yellow;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = "white";
                      }}
                    >
                      ⚙️ YAML
                    </button>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        padding: "10px",
                        backgroundColor: "white",
                        color: COLORS.darkGreen,
                        border: `1px solid ${COLORS.borderGreen}`,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = COLORS.yellow;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = "white";
                      }}
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={exportConfig}
                      style={{
                        padding: "10px",
                        backgroundColor: "white",
                        color: COLORS.darkGreen,
                        border: `1px solid ${COLORS.borderGreen}`,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = COLORS.yellow;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = "white";
                      }}
                    >
                      💾 Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer id="footer" style={{ padding: "60px 40px", backgroundColor: COLORS.darkGreen, color: "white", textAlign: "center" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "15px", lineHeight: 1.8 }}>
            AppSpec Generator is the AI-powered platform that lets you build fully functioning apps in minutes. Using nothing but natural language, AppSpec enables anyone to turn words into productivity apps, back-office tools, customer portals, or complete enterprise products—ready to use, no integrations required.
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "20px" }}>
            © 2026 AppSpec. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}