import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black:   #0a0a0a;
      --white:   #f5f3ee;
      --green:   #00e676;
      --green2:  #00c853;
      --dark:    #111411;
      --card:    #161a16;
      --border:  #2a2e2a;
      --muted:   #6b7a6b;
      --text:    #d4d9d4;
      --font-display: 'Syne', sans-serif;
      --font-body:    'DM Sans', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--black);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.6;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: var(--green); border-radius: 2px; }

    /* Noise overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      opacity: 0.4;
    }

    /* Animations */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes scan     { 0% { top: 0%; } 100% { top: 100%; } }
    @keyframes blink    { 0%,100%{opacity:1}50%{opacity:0} }
    @keyframes slideIn  { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes glow     { 0%,100%{box-shadow:0 0 20px #00e67633} 50%{box-shadow:0 0 40px #00e67666} }

    .fade-up  { animation: fadeUp  0.6s ease both; }
    .fade-in  { animation: fadeIn  0.4s ease both; }

    /* Input / Button base */
    input, select, textarea {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--white);
      border-radius: 8px;
      padding: 12px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      width: 100%;
      outline: none;
      transition: border 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--green); }
    input::placeholder { color: var(--muted); }

    button { cursor: pointer; font-family: var(--font-body); }

    /* Scrollable tables */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 14px; color: var(--muted); font-weight: 500; border-bottom: 1px solid var(--border); }
    td { padding: 12px 14px; border-bottom: 1px solid #1e221e; }
    tr:hover td { background: #161a16; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════ */
const Btn = ({ children, variant = "primary", onClick, style = {}, disabled }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 24px", borderRadius: 8, fontWeight: 600,
    fontSize: 14, border: "none", transition: "all 0.2s", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, ...style
  };
  const variants = {
    primary:  { background: "var(--green)", color: "#000" },
    outline:  { background: "transparent", color: "var(--green)", border: "1px solid var(--green)" },
    ghost:    { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" },
    danger:   { background: "#ff1744", color: "#fff" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const Badge = ({ children, color = "green" }) => {
  const colors = {
    green:  { bg: "#00e67611", color: "#00e676" },
    yellow: { bg: "#ffd74011", color: "#ffd740" },
    red:    { bg: "#ff174411", color: "#ff4444" },
    blue:   { bg: "#448aff11", color: "#448aff" },
    muted:  { bg: "#ffffff11", color: "#888" },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>{children}</span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 14, padding: 24, ...style
  }}>{children}</div>
);

const StatCard = ({ label, value, icon, delta, color = "var(--green)" }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color }}>{value}</div>
        {delta && <div style={{ fontSize: 12, color: "var(--green)", marginTop: 6 }}>{delta}</div>}
      </div>
      <div style={{ fontSize: 28 }}>{icon}</div>
    </div>
  </Card>
);

const WaIcon = ({ size = 20, color = "#00e676" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Avatar = ({ name = "U", size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "linear-gradient(135deg, #00e676, #00c853)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: size * 0.38, color: "#000",
    flexShrink: 0, fontFamily: "var(--font-display)"
  }}>{name[0].toUpperCase()}</div>
);

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
const Navbar = ({ page, setPage, user, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!user;

  const navLinks = [
    { label: "Home", key: "home" },
    { label: "Pricing", key: "pricing" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: "1px solid var(--border)",
      background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <WaIcon size={24} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--white)" }}>
            WaFlow
          </span>
        </div>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navLinks.map(l => (
            <span key={l.key} onClick={() => setPage(l.key)} style={{
              cursor: "pointer", color: page === l.key ? "var(--green)" : "var(--muted)",
              fontWeight: 500, fontSize: 14, transition: "color 0.2s"
            }}>{l.label}</span>
          ))}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLoggedIn ? (
            <>
              <span onClick={() => setPage("dashboard")} style={{ cursor: "pointer" }}>
                <Avatar name={user.name} />
              </span>
              {user.role === "admin" && (
                <Btn variant="ghost" onClick={() => setPage("admin")} style={{ padding: "8px 16px", fontSize: 13 }}>
                  Admin
                </Btn>
              )}
              <Btn variant="outline" onClick={() => { setUser(null); setPage("home"); }} style={{ padding: "8px 16px", fontSize: 13 }}>
                Logout
              </Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" onClick={() => setPage("login")} style={{ padding: "8px 16px", fontSize: 13 }}>Login</Btn>
              <Btn onClick={() => setPage("signup")} style={{ padding: "8px 16px", fontSize: 13 }}>Get Started</Btn>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
const HomePage = ({ setPage }) => {
  const features = [
    { icon: "⚡", title: "Instant Auto-Reply", desc: "Keyword-based templates respond in milliseconds. Never miss a lead." },
    { icon: "🎯", title: "Smart Lead Capture", desc: "Every WhatsApp contact automatically becomes a tracked lead." },
    { icon: "📅", title: "Follow-up Scheduler", desc: "Auto follow-ups on Day 1, 3, 7 — fully customizable." },
    { icon: "📊", title: "Live Dashboard", desc: "Real-time analytics — leads, conversions, message logs." },
    { icon: "🔗", title: "Multi-Client Support", desc: "Manage multiple businesses from one admin panel." },
    { icon: "🔒", title: "Firebase Auth", desc: "Secure login, role-based access, data isolation per client." },
  ];

  const stats = [
    { value: "10x", label: "Faster Response" },
    { value: "3min", label: "Setup Time" },
    { value: "98%", label: "Delivery Rate" },
    { value: "∞", label: "Scalability" },
  ];

  const howItWorks = [
    { step: "01", title: "Connect WhatsApp", desc: "Link your Twilio WhatsApp number to WaFlow in 3 minutes." },
    { step: "02", title: "Create Templates", desc: "Set keyword triggers and auto-reply messages for your business." },
    { step: "03", title: "Watch Leads Flow", desc: "Sit back as leads are captured, replied to, and followed up — automatically." },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative", overflow: "hidden",
        padding: "120px 24px 80px",
      }}>
        {/* BG grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "60px 60px", opacity: 0.3,
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, #00e67614 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 800, textAlign: "center", position: "relative" }}>
          <div className="fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#00e67611", border: "1px solid #00e67633",
            borderRadius: 20, padding: "6px 16px", marginBottom: 32,
            color: "var(--green)", fontSize: 13, fontWeight: 500,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
            WhatsApp Automation Platform
          </div>

          <h1 className="fade-up" style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(42px, 7vw, 80px)", lineHeight: 1.05,
            color: "var(--white)", marginBottom: 24, animationDelay: "0.1s",
          }}>
            Automate Your<br />
            <span style={{
              background: "linear-gradient(90deg, #00e676, #69f0ae)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>WhatsApp Business</span>
          </h1>

          <p className="fade-up" style={{
            fontSize: 18, color: "var(--muted)", maxWidth: 560, margin: "0 auto 40px",
            lineHeight: 1.7, animationDelay: "0.2s",
          }}>
            Keyword-triggered replies, automatic lead capture, scheduled follow-ups — all connected to Firebase. Your business never sleeps.
          </p>

          <div className="fade-up" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.3s" }}>
            <Btn onClick={() => setPage("signup")} style={{ padding: "14px 32px", fontSize: 15, animation: "glow 3s ease infinite" }}>
              <WaIcon size={18} color="#000" /> Start Free Trial
            </Btn>
            <Btn variant="ghost" onClick={() => setPage("pricing")} style={{ padding: "14px 32px", fontSize: 15 }}>
              View Pricing →
            </Btn>
          </div>

          {/* Stats Row */}
          <div className="fade-up" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
            marginTop: 72, background: "var(--border)", borderRadius: 14, overflow: "hidden",
            animationDelay: "0.4s",
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: "var(--card)", padding: "24px 16px", textAlign: "center"
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--green)" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "var(--white)", marginBottom: 12 }}>
            Everything You Need
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16 }}>Built for Indian businesses. Powered by Twilio + Firebase.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <Card key={i} style={{ transition: "border 0.2s, transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--white)", marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 24px", background: "#0d110d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "var(--white)", marginBottom: 12 }}>
              Up & Running in Minutes
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {howItWorks.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 32, padding: "32px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800,
                  color: "#00e67622", lineHeight: 1, minWidth: 72,
                }}>{h.step}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--white)", marginBottom: 8 }}>{h.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 15 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto",
          background: "linear-gradient(135deg, #00e67611, #00e67605)",
          border: "1px solid #00e67633", borderRadius: 20, padding: "56px 40px",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--white)", marginBottom: 16 }}>
            Ready to Automate?
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: 16 }}>
            Join businesses already saving hours every day with WaFlow.
          </p>
          <Btn onClick={() => setPage("signup")} style={{ padding: "14px 40px", fontSize: 16 }}>
            Start for Free — No Card Needed
          </Btn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <WaIcon size={18} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)" }}>WaFlow</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>© 2025 WaFlow. WhatsApp Automation Platform.</p>
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   AUTH PAGES
═══════════════════════════════════════════════════════════ */
const AuthPage = ({ mode, setPage, setUser }) => {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", business: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    if (!form.email || !form.password) { setError("Please fill all fields."); setLoading(false); return; }
    // Demo: admin@waflow.com = admin
    const isAdmin = form.email === "admin@waflow.com";
    setUser({
      name: form.name || (isAdmin ? "Admin" : "Demo User"),
      email: form.email,
      role: isAdmin ? "admin" : "user",
      business: form.business || "Demo Business",
      phone: form.phone || "+919876543210",
      plan: "pro",
    });
    setPage(isAdmin ? "admin" : "dashboard");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "100px 24px 40px",
    }}>
      {/* BG */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 30% 50%, #00e67608 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div className="fade-up" style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Logo */}
        <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40, cursor: "pointer" }}>
          <WaIcon size={22} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--white)" }}>WaFlow</span>
        </div>

        <Card>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--white)", marginBottom: 6 }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>
            {isLogin ? "Login to your WaFlow dashboard." : "Start automating WhatsApp today."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isLogin && (
              <>
                <div>
                  <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block" }}>Full Name</label>
                  <input placeholder="Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block" }}>Business Name</label>
                  <input placeholder="My Company Pvt Ltd" value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block" }}>WhatsApp Number</label>
                  <input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block" }}>Email</label>
              <input type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block" }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {error && (
              <div style={{ background: "#ff174411", border: "1px solid #ff174433", borderRadius: 8, padding: "10px 14px", color: "#ff4444", fontSize: 13 }}>
                {error}
              </div>
            )}

            {isLogin && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: -6 }}>
                Demo: <span style={{ color: "var(--green)", cursor: "pointer" }} onClick={() => setForm({ ...form, email: "user@demo.com", password: "demo123" })}>user@demo.com</span>
                {" · "}
                <span style={{ color: "var(--green)", cursor: "pointer" }} onClick={() => setForm({ ...form, email: "admin@waflow.com", password: "admin123" })}>admin@waflow.com</span>
              </div>
            )}

            <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "13px" }}>
              {loading ? (
                <span style={{ width: 16, height: 16, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              ) : isLogin ? "Login →" : "Create Account →"}
            </Btn>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
            {isLogin ? "No account? " : "Already have one? "}
            <span style={{ color: "var(--green)", cursor: "pointer" }} onClick={() => setPage(isLogin ? "signup" : "login")}>
              {isLogin ? "Sign up" : "Login"}
            </span>
          </p>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRICING PAGE
═══════════════════════════════════════════════════════════ */
const PricingPage = ({ setPage }) => {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter", price: annual ? 799 : 999, color: "var(--muted)",
      desc: "Perfect for small businesses just starting out.",
      features: ["1 WhatsApp Number", "500 messages/month", "5 Templates", "Basic Lead Capture", "Email Support"],
      cta: "Get Started", variant: "ghost",
    },
    {
      name: "Pro", price: annual ? 1999 : 2499, color: "var(--green)", popular: true,
      desc: "For growing businesses that need more power.",
      features: ["3 WhatsApp Numbers", "5,000 messages/month", "Unlimited Templates", "Advanced Lead Management", "Follow-up Scheduler", "Analytics Dashboard", "Priority Support"],
      cta: "Start Pro Trial", variant: "primary",
    },
    {
      name: "Enterprise", price: annual ? 4999 : 5999, color: "#448aff",
      desc: "For agencies managing multiple clients.",
      features: ["Unlimited Numbers", "Unlimited Messages", "Multi-Client Admin", "Custom Integrations", "White-label Option", "Dedicated Support", "SLA Guarantee"],
      cta: "Contact Sales", variant: "outline",
    },
  ];

  const faqs = [
    { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime. Changes apply from next billing cycle." },
    { q: "Do I need a Twilio account?", a: "Yes, you need a Twilio account with a WhatsApp-enabled number. We guide you through setup." },
    { q: "Is there a free trial?", a: "Yes! 14-day free trial on Pro plan. No credit card required." },
    { q: "What happens if I exceed message limit?", a: "We'll notify you. Messages are queued. You can upgrade or buy top-up credits." },
  ];

  return (
    <div style={{ padding: "100px 24px 60px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800, color: "var(--white)", marginBottom: 16 }}>
            Simple Pricing
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 28 }}>
            No hidden fees. Cancel anytime.
          </p>
          {/* Toggle */}
          <div style={{ display: "inline-flex", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 30, padding: 4, gap: 4 }}>
            {["Monthly", "Annual"].map((t, i) => (
              <button key={t} onClick={() => setAnnual(i === 1)} style={{
                padding: "8px 20px", borderRadius: 24, border: "none", fontSize: 13, fontWeight: 600,
                background: annual === (i === 1) ? "var(--green)" : "transparent",
                color: annual === (i === 1) ? "#000" : "var(--muted)",
                transition: "all 0.2s",
              }}>{t} {i === 1 && <span style={{ fontSize: 11, color: annual ? "#000" : "var(--green)" }}>−20%</span>}</button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 72 }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: "var(--card)", border: `1px solid ${plan.popular ? plan.color : "var(--border)"}`,
              borderRadius: 16, padding: 28, position: "relative",
              transform: plan.popular ? "scale(1.02)" : "scale(1)",
              transition: "transform 0.2s",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--green)", color: "#000", fontSize: 11, fontWeight: 700,
                  padding: "4px 14px", borderRadius: 20, letterSpacing: 1,
                }}>MOST POPULAR</div>
              )}
              <div style={{ color: plan.color, fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, color: "var(--white)" }}>₹{plan.price.toLocaleString()}</span>
                <span style={{ color: "var(--muted)", marginBottom: 8 }}>/mo</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>{plan.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <span style={{ color: "var(--green)", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "var(--text)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Btn variant={plan.variant} onClick={() => setPage("signup")} style={{ width: "100%", justifyContent: "center" }}>
                {plan.cta}
              </Btn>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--white)", textAlign: "center", marginBottom: 40 }}>
            FAQs
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ padding: "20px 0", borderBottom: i < faqs.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontWeight: 600, color: "var(--white)", marginBottom: 8 }}>{f.q}</div>
                <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   USER DASHBOARD
═══════════════════════════════════════════════════════════ */
const Dashboard = ({ user, setPage }) => {
  const [tab, setTab] = useState("overview");
  const [waStatus, setWaStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [templates, setTemplates] = useState([
    { id: 1, name: "Price Inquiry", keywords: ["price", "cost", "rate"], body: "Hi {name}! Our pricing starts at ₹999/month. Want a demo?", active: true },
    { id: 2, name: "Demo Request", keywords: ["demo", "trial"], body: "Hey {name}! Let's schedule a demo for {business}. Reply CONFIRM!", active: true },
    { id: 3, name: "Default Reply", keywords: [], body: "Hi {name}! Thanks for reaching out to {business}. How can we help?", active: true, isDefault: true },
  ]);
  const [leads, setLeads] = useState([
    { id: 1, name: "Priya Sharma", phone: "+91 98765 43210", status: "qualified", time: "2 min ago", msg: "price?" },
    { id: 2, name: "Amit Kumar", phone: "+91 87654 32109", status: "new", time: "15 min ago", msg: "demo please" },
    { id: 3, name: "Sneha Patel", phone: "+91 76543 21098", status: "converted", time: "1 hr ago", msg: "how much" },
    { id: 4, name: "Raj Mehta", phone: "+91 65432 10987", status: "contacted", time: "3 hr ago", msg: "info needed" },
  ]);
  const [newTemplate, setNewTemplate] = useState({ name: "", keywords: "", body: "" });
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [messages] = useState([
    { dir: "in", text: "What is the price?", time: "10:32" },
    { dir: "out", text: "Hi Priya! Our pricing starts at ₹999/month. Want a demo?", time: "10:32" },
    { dir: "in", text: "Yes please!", time: "10:35" },
    { dir: "out", text: "Great! Let's schedule a demo for your business. Reply CONFIRM!", time: "10:35" },
  ]);

  const connectWA = () => {
    setWaStatus("connecting");
    setTimeout(() => setWaStatus("connected"), 3000);
  };

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "whatsapp", label: "💬 WhatsApp" },
    { key: "templates", label: "📋 Templates" },
    { key: "leads", label: "👥 Leads" },
    { key: "messages", label: "✉️ Messages" },
    { key: "settings", label: "⚙️ Settings" },
  ];

  const statusColor = { new: "blue", contacted: "yellow", qualified: "green", converted: "green", lost: "red" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", paddingTop: 64 }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "var(--dark)", borderRight: "1px solid var(--border)",
        padding: "24px 0", position: "fixed", top: 64, bottom: 0, overflowY: "auto",
      }}>
        <div style={{ padding: "0 16px 20px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={user.name} size={36} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--white)" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{user.plan?.toUpperCase()} plan</div>
            </div>
          </div>
        </div>
        {tabs.map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "11px 20px", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t.key ? "#00e67611" : "transparent",
            borderLeft: tab === t.key ? "3px solid var(--green)" : "3px solid transparent",
            color: tab === t.key ? "var(--green)" : "var(--muted)",
            transition: "all 0.15s",
          }}>{t.label}</div>
        ))}
        <div style={{ padding: "20px 16px", marginTop: "auto" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>WhatsApp Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: waStatus === "connected" ? "var(--green)" : waStatus === "connecting" ? "#ffd740" : "#ff4444",
              animation: waStatus === "connecting" ? "pulse 1s infinite" : "none",
            }} />
            <span style={{ fontSize: 12, color: "var(--text)", textTransform: "capitalize" }}>{waStatus}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: 28, minWidth: 0 }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="fade-in">
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--white)" }}>
                Good morning, {user.name.split(" ")[0]}! 👋
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>{user.business}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard label="Total Leads" value="247" icon="👥" delta="↑ 12 today" />
              <StatCard label="Messages Sent" value="1,832" icon="✉️" delta="↑ 43 today" />
              <StatCard label="Conversions" value="38" icon="🎯" delta="15.4% rate" color="#ffd740" />
              <StatCard label="Pending Follow-ups" value="12" icon="📅" color="#448aff" />
            </div>

            {/* Recent Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Recent Leads</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {leads.slice(0, 3).map(l => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={l.name} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{l.time}</div>
                      </div>
                      <Badge color={statusColor[l.status]}>{l.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Btn variant="outline" onClick={() => setTab("whatsapp")} style={{ justifyContent: "flex-start", width: "100%" }}>
                    <WaIcon size={16} /> Connect WhatsApp
                  </Btn>
                  <Btn variant="ghost" onClick={() => setTab("templates")} style={{ justifyContent: "flex-start", width: "100%" }}>
                    📋 Add Template
                  </Btn>
                  <Btn variant="ghost" onClick={() => setTab("leads")} style={{ justifyContent: "flex-start", width: "100%" }}>
                    👥 View All Leads
                  </Btn>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* WHATSAPP CONNECTION */}
        {tab === "whatsapp" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 24 }}>WhatsApp Connection</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
                    background: waStatus === "connected" ? "#00e67622" : "#ff174422",
                    border: `2px solid ${waStatus === "connected" ? "var(--green)" : "#ff4444"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: waStatus === "connecting" ? "glow 1.5s infinite" : "none",
                  }}>
                    <WaIcon size={36} color={waStatus === "connected" ? "var(--green)" : "#ff4444"} />
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--white)", marginBottom: 8 }}>
                    {waStatus === "connected" ? "Connected ✓" : waStatus === "connecting" ? "Connecting..." : "Not Connected"}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>
                    {waStatus === "connected" ? user.phone : "Connect your WhatsApp Business number via Twilio"}
                  </div>
                  {waStatus !== "connected" && (
                    <Btn onClick={connectWA} disabled={waStatus === "connecting"}>
                      {waStatus === "connecting" ? "Connecting..." : "Connect Now"}
                    </Btn>
                  )}
                  {waStatus === "connected" && (
                    <Btn variant="danger" onClick={() => setWaStatus("disconnected")}>Disconnect</Btn>
                  )}
                </div>
              </Card>

              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Twilio Configuration</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Account SID</label>
                    <input placeholder="ACxxxxxxxxxxxxxxxxxx" defaultValue="ACxxxxx...demo" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Auth Token</label>
                    <input type="password" placeholder="••••••••••••" defaultValue="demo_token" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>WhatsApp Number</label>
                    <input placeholder="whatsapp:+14155238886" value={user.phone} onChange={() => {}} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Webhook URL (copy this to Twilio)</label>
                    <div style={{
                      background: "#0d110d", border: "1px solid var(--border)", borderRadius: 8,
                      padding: "10px 14px", fontSize: 12, color: "var(--green)", fontFamily: "monospace",
                    }}>
                      https://api.waflow.in/webhook/twilio
                    </div>
                  </div>
                  <Btn style={{ marginTop: 4 }}>Save Configuration</Btn>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TEMPLATES */}
        {tab === "templates" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)" }}>Templates</h2>
              <Btn onClick={() => setShowAddTemplate(!showAddTemplate)}>+ Add Template</Btn>
            </div>

            {showAddTemplate && (
              <Card style={{ marginBottom: 20, borderColor: "var(--green)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>New Template</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Template Name</label>
                    <input placeholder="e.g. Price Inquiry" value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Trigger Keywords (comma separated)</label>
                    <input placeholder="price, cost, rate" value={newTemplate.keywords} onChange={e => setNewTemplate({ ...newTemplate, keywords: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Message Body — use {"{name}"}, {"{business}"}</label>
                  <textarea rows={3} placeholder="Hi {name}! Thanks for reaching out..." value={newTemplate.body} onChange={e => setNewTemplate({ ...newTemplate, body: e.target.value })} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn onClick={() => {
                    if (newTemplate.name && newTemplate.body) {
                      setTemplates([...templates, { id: Date.now(), ...newTemplate, keywords: newTemplate.keywords.split(",").map(k => k.trim()), active: true }]);
                      setNewTemplate({ name: "", keywords: "", body: "" }); setShowAddTemplate(false);
                    }
                  }}>Save Template</Btn>
                  <Btn variant="ghost" onClick={() => setShowAddTemplate(false)}>Cancel</Btn>
                </div>
              </Card>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {templates.map(t => (
                <Card key={t.id} style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", fontSize: 15 }}>{t.name}</span>
                        {t.isDefault && <Badge color="blue">Default</Badge>}
                        <Badge color={t.active ? "green" : "muted"}>{t.active ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {t.keywords.map((k, i) => (
                          <span key={i} style={{ background: "#00e67611", color: "var(--green)", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{k}</span>
                        ))}
                        {t.keywords.length === 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>No keywords (default trigger)</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="ghost" style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => setTemplates(templates.map(tt => tt.id === t.id ? { ...tt, active: !tt.active } : tt))}>
                        {t.active ? "Disable" : "Enable"}
                      </Btn>
                      <Btn variant="danger" style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => setTemplates(templates.filter(tt => tt.id !== t.id))}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                  <div style={{
                    background: "#0d110d", borderRadius: 8, padding: "10px 14px",
                    fontSize: 13, color: "var(--text)", lineHeight: 1.5,
                  }}>"{t.body}"</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* LEADS */}
        {tab === "leads" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)" }}>Leads</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Search leads..." style={{ width: 200, padding: "8px 14px" }} />
                <select style={{ width: 140 }}>
                  <option>All Status</option>
                  <option>new</option><option>contacted</option><option>qualified</option><option>converted</option>
                </select>
              </div>
            </div>
            <Card style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Phone</th><th>Status</th><th>Last Message</th><th>Time</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={l.name} size={28} />
                            <span style={{ fontWeight: 600, color: "var(--white)" }}>{l.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--muted)" }}>{l.phone}</td>
                        <td>
                          <select value={l.status} onChange={e => setLeads(leads.map(ll => ll.id === l.id ? { ...ll, status: e.target.value } : ll))}
                            style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}>
                            <option>new</option><option>contacted</option><option>qualified</option><option>converted</option><option>lost</option>
                          </select>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>"{l.msg}"</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{l.time}</td>
                        <td>
                          <Btn variant="ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setTab("messages")}>View Chat</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 24 }}>Message Log</h2>
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
              <Card style={{ padding: 0 }}>
                {leads.map(l => (
                  <div key={l.id} style={{
                    padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: l.id === 1 ? "#00e67608" : "transparent",
                    borderLeft: l.id === 1 ? "3px solid var(--green)" : "3px solid transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={l.name} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--white)" }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>"{l.msg}"</div>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{l.time}</div>
                    </div>
                  </div>
                ))}
              </Card>
              <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 8, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  Chat — Priya Sharma
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.dir === "out" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "70%", background: m.dir === "out" ? "var(--green)" : "#1e221e",
                        color: m.dir === "out" ? "#000" : "var(--text)",
                        padding: "10px 14px", borderRadius: m.dir === "out" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        fontSize: 13, lineHeight: 1.5,
                      }}>
                        {m.text}
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right" }}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <input placeholder="Type a message..." style={{ flex: 1 }} />
                  <Btn><WaIcon size={16} color="#000" /> Send</Btn>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 24 }}>Settings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Profile</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Full Name</label><input defaultValue={user.name} /></div>
                  <div><label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Email</label><input defaultValue={user.email} /></div>
                  <div><label style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, display: "block" }}>Business Name</label><input defaultValue={user.business} /></div>
                  <Btn>Save Changes</Btn>
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Follow-up Schedule</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[1, 3, 7].map((day, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00e67611", border: "1px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{i + 1}</div>
                      <input defaultValue={`Day ${day} follow-up`} style={{ flex: 1 }} />
                      <span style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>after {day}d</span>
                    </div>
                  ))}
                  <Btn>Update Schedule</Btn>
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Plan & Billing</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ color: "var(--white)", fontWeight: 600 }}>Pro Plan</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>₹2,499/month · Renews Mar 1</div>
                  </div>
                  <Badge color="green">Active</Badge>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="outline">Upgrade</Btn>
                  <Btn variant="ghost">Billing History</Btn>
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Danger Zone</div>
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>These actions are irreversible. Please proceed carefully.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Btn variant="danger" style={{ width: "fit-content" }}>Delete All Leads</Btn>
                  <Btn variant="danger" style={{ width: "fit-content" }}>Delete Account</Btn>
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
const AdminDashboard = ({ user, setPage }) => {
  const [tab, setTab] = useState("overview");
  const [clients] = useState([
    { id: 1, name: "Priya Enterprises", email: "priya@ent.com", plan: "Pro", leads: 147, status: "active", number: "+91 98765 43210", joined: "Jan 12, 2025" },
    { id: 2, name: "Raj Motors", email: "raj@motors.com", plan: "Starter", leads: 43, status: "active", number: "+91 87654 32109", joined: "Feb 3, 2025" },
    { id: 3, name: "Sneha Fashion", email: "sneha@fashion.com", plan: "Enterprise", leads: 892, status: "active", number: "+91 76543 21098", joined: "Jan 5, 2025" },
    { id: 4, name: "Kumar Tech", email: "kumar@tech.com", plan: "Pro", leads: 0, status: "trial", number: "Not connected", joined: "Mar 20, 2025" },
    { id: 5, name: "Delhi Travels", email: "travel@delhi.com", plan: "Starter", leads: 28, status: "suspended", number: "+91 65432 10987", joined: "Dec 1, 2024" },
  ]);

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "clients", label: "🏢 Clients" },
    { key: "messages", label: "✉️ All Messages" },
    { key: "revenue", label: "💰 Revenue" },
    { key: "system", label: "⚙️ System" },
  ];

  const statusColor = { active: "green", trial: "blue", suspended: "red" };
  const planColor = { Starter: "muted", Pro: "green", Enterprise: "blue" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", paddingTop: 64 }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#090c09", borderRight: "1px solid var(--border)",
        padding: "24px 0", position: "fixed", top: 64, bottom: 0,
      }}>
        <div style={{ padding: "0 16px 20px 16px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Admin Panel</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={user.name} size={32} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--white)" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "#ff9800" }}>Super Admin</div>
            </div>
          </div>
        </div>
        {tabs.map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "11px 20px", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t.key ? "#00e67611" : "transparent",
            borderLeft: tab === t.key ? "3px solid var(--green)" : "3px solid transparent",
            color: tab === t.key ? "var(--green)" : "var(--muted)",
            transition: "all 0.15s",
          }}>{t.label}</div>
        ))}
        <div style={{ padding: "16px", marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setPage("home")} style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "8px" }}>
            ← Back to Home
          </Btn>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: 28 }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--white)" }}>Admin Overview</h1>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>WaFlow Platform — All Clients</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard label="Total Clients" value="24" icon="🏢" delta="↑ 3 this month" />
              <StatCard label="Active Numbers" value="31" icon="📱" delta="4 pending" color="#ffd740" />
              <StatCard label="Total Leads" value="12.4K" icon="👥" delta="↑ 847 this week" />
              <StatCard label="Messages Today" value="8,291" icon="✉️" delta="↑ 12% vs yesterday" color="#448aff" />
              <StatCard label="MRR" value="₹84K" icon="💰" delta="↑ ₹12K vs last month" color="#ff9800" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Top Clients by Leads</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {clients.filter(c => c.status === "active").sort((a, b) => b.leads - a.leads).map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={c.name} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{c.name}</div>
                        <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: 4 }}>
                          <div style={{ height: "100%", background: "var(--green)", borderRadius: 2, width: `${Math.min(c.leads / 10, 100)}%`, transition: "width 1s" }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", minWidth: 40, textAlign: "right" }}>{c.leads}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Plan Distribution</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[{ plan: "Enterprise", count: 3, color: "#448aff" }, { plan: "Pro", count: 14, color: "var(--green)" }, { plan: "Starter", count: 7, color: "var(--muted)" }].map(p => (
                    <div key={p.plan}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>{p.plan}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.count}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
                        <div style={{ height: "100%", background: p.color, borderRadius: 3, width: `${(p.count / 24) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {tab === "clients" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)" }}>All Clients</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Search clients..." style={{ width: 200, padding: "8px 14px" }} />
                <Btn>+ Add Client</Btn>
              </div>
            </div>
            <Card style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Business</th><th>Email</th><th>Plan</th><th>Leads</th><th>WA Number</th><th>Status</th><th>Joined</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={c.name} size={28} />
                            <span style={{ fontWeight: 600, color: "var(--white)" }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>{c.email}</td>
                        <td><Badge color={planColor[c.plan]}>{c.plan}</Badge></td>
                        <td style={{ fontWeight: 700, color: "var(--green)" }}>{c.leads.toLocaleString()}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{c.number}</td>
                        <td><Badge color={statusColor[c.status]}>{c.status}</Badge></td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{c.joined}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Btn variant="ghost" style={{ padding: "4px 10px", fontSize: 11 }}>View</Btn>
                            <Btn variant={c.status === "suspended" ? "outline" : "danger"} style={{ padding: "4px 10px", fontSize: 11 }}>
                              {c.status === "suspended" ? "Restore" : "Suspend"}
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* REVENUE */}
        {tab === "revenue" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 24 }}>Revenue</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard label="MRR" value="₹84,000" icon="📈" delta="↑ 17% MoM" />
              <StatCard label="ARR" value="₹10.1L" icon="💎" color="#ffd740" />
              <StatCard label="Churn Rate" value="2.1%" icon="📉" color="#ff4444" delta="↓ 0.3% vs last month" />
            </div>
            <Card>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 20 }}>Monthly Revenue Trend</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, paddingBottom: 16 }}>
                {[42, 55, 48, 63, 58, 71, 84].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>₹{v}K</span>
                    <div style={{
                      width: "100%", height: `${(v / 84) * 120}px`,
                      background: i === 6 ? "var(--green)" : "#00e67633",
                      borderRadius: "4px 4px 0 0", transition: "height 1s",
                    }} />
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SYSTEM */}
        {tab === "system" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 24 }}>System Status</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Services</div>
                {[
                  { name: "FastAPI Backend", status: "running" },
                  { name: "Firebase Firestore", status: "running" },
                  { name: "Twilio Webhook", status: "running" },
                  { name: "Follow-up Scheduler", status: "running" },
                  { name: "Firebase Auth", status: "running" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: 14, color: "var(--text)" }}>{s.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
                      <span style={{ fontSize: 12, color: "var(--green)" }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Btn variant="outline" style={{ justifyContent: "flex-start" }}>🔄 Trigger Follow-up Batch</Btn>
                  <Btn variant="ghost" style={{ justifyContent: "flex-start" }}>📤 Export All Leads (CSV)</Btn>
                  <Btn variant="ghost" style={{ justifyContent: "flex-start" }}>🧹 Clear Message Logs</Btn>
                  <Btn variant="ghost" style={{ justifyContent: "flex-start" }}>📧 Send System Announcement</Btn>
                  <Btn variant="danger" style={{ justifyContent: "flex-start" }}>🚨 Pause All Automations</Btn>
                </div>
              </Card>
              <Card style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Live Logs</div>
                <div style={{ background: "#050805", borderRadius: 8, padding: 16, fontFamily: "monospace", fontSize: 12, color: "var(--green)", maxHeight: 200, overflowY: "auto", lineHeight: 1.8 }}>
                  {[
                    "[10:32:14] ✅ Message received from whatsapp:+919876543210 → client: priya_ent",
                    "[10:32:14] 🎯 Keyword matched: 'price' → template: Price Inquiry",
                    "[10:32:15] ✅ Reply sent | SID: SM1234abcd",
                    "[10:32:15] 👤 Lead captured: Priya Sharma",
                    "[10:32:15] 📅 3 follow-ups scheduled",
                    "[10:33:01] ✅ Message received from whatsapp:+918765432109 → client: raj_motors",
                    "[10:33:01] 🎯 Keyword matched: 'demo' → template: Demo Request",
                    "[10:33:02] ✅ Reply sent | SID: SM5678efgh",
                    "[10:45:00] 🔄 Follow-up batch: 3 messages processed",
                  ].map((l, i) => <div key={i}>{l}</div>)}
                  <div style={{ display: "inline-block", animation: "blink 1s infinite" }}>█</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 24 }}>All Platform Messages</h2>
            <Card style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Client</th><th>Lead</th><th>Direction</th><th>Message</th><th>Time</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      { client: "Priya Enterprises", lead: "+91 98765", dir: "in", msg: "What is the price?", time: "10:32", status: "received" },
                      { client: "Priya Enterprises", lead: "+91 98765", dir: "out", msg: "Hi! Our pricing starts at ₹999...", time: "10:32", status: "delivered" },
                      { client: "Raj Motors", lead: "+91 87654", dir: "in", msg: "demo please", time: "10:33", status: "received" },
                      { client: "Raj Motors", lead: "+91 87654", dir: "out", msg: "Let's schedule a demo!", time: "10:33", status: "delivered" },
                      { client: "Sneha Fashion", lead: "+91 76543", dir: "in", msg: "how much does it cost", time: "10:41", status: "received" },
                    ].map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 13, color: "var(--white)", fontWeight: 600 }}>{m.client}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{m.lead}</td>
                        <td><Badge color={m.dir === "in" ? "blue" : "green"}>{m.dir === "in" ? "↓ IN" : "↑ OUT"}</Badge></td>
                        <td style={{ color: "var(--text)", fontSize: 13, maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>"{m.msg}"</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{m.time}</td>
                        <td><Badge color={m.status === "delivered" ? "green" : "muted"}>{m.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  const renderPage = () => {
    switch (page) {
      case "home":     return <HomePage setPage={setPage} />;
      case "login":    return <AuthPage mode="login" setPage={setPage} setUser={setUser} />;
      case "signup":   return <AuthPage mode="signup" setPage={setPage} setUser={setUser} />;
      case "pricing":  return <PricingPage setPage={setPage} />;
      case "dashboard": return user ? <Dashboard user={user} setPage={setPage} /> : <AuthPage mode="login" setPage={setPage} setUser={setUser} />;
      case "admin":    return user?.role === "admin" ? <AdminDashboard user={user} setPage={setPage} /> : <AuthPage mode="login" setPage={setPage} setUser={setUser} />;
      default:         return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <Navbar page={page} setPage={setPage} user={user} setUser={setUser} />
      {renderPage()}
    </>
  );
}
