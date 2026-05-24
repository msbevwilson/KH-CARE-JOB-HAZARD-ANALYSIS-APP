import { useState } from "react";
import { HardHat, Eye, EyeOff } from "lucide-react";
import * as api from "../../utils/api";
import { AuthUser } from "../types";

export function LoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const isReturning = typeof window !== "undefined" && localStorage.getItem("khcare_returning") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.login(email, password);
      localStorage.setItem("khcare_returning", "true");
      onLogin(user as AuthUser);
    } catch (err: any) {
      setError(err?.message ?? "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-background overflow-hidden" style={{ height: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      <aside className="hidden md:flex flex-col h-full bg-primary flex-shrink-0" style={{ width: 280 }}>
        <div className="px-7 py-7 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-white/30 flex items-center justify-center flex-shrink-0">
              <HardHat size={22} className="text-white" />
            </div>
            <p className="text-white text-xl font-bold leading-tight" style={{ fontFamily: "Roboto Slab, serif" }}>
              KH <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, color: "#e67e22" }}>CARE</span>
            </p>
          </div>
          <div className="space-y-3">
            {[
              { letter: "C", text: "Check the environment" },
              { letter: "A", text: "Analyze the task steps" },
              { letter: "R", text: "Remove or control hazards" },
              { letter: "E", text: "Ensure everyone is safe" },
            ].map(({ letter, text }) => (
              <div key={letter} className="flex items-baseline gap-3">
                <span className="w-5 flex-shrink-0 text-right leading-none" style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.25rem", color: "#e67e22" }}>{letter}</span>
                <span style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontWeight: 400, fontSize: "0.95rem", color: "white", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <div className="px-5 py-5 border-t border-white/10">
          <p className="text-white/30 text-xs" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>Log in to access your workspace</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="hidden md:flex flex-shrink-0 bg-card border-b border-border px-6 py-3.5 items-center">
          <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>Log in</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Mobile banner — HardHat strip + KH CARE content as one seamless block */}
          <div className="md:hidden bg-primary flex">
            {/* Left strip column */}
            <div className="w-14 flex-shrink-0 flex flex-col items-center pt-4 pb-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <HardHat size={18} className="text-white" />
              </div>
            </div>
            {/* KH CARE content */}
            <div className="flex-1 pt-5 pb-4 pr-4">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-widest pl-14" style={{ fontFamily: "Roboto Slab, serif" }}>
                KH <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, color: "#e67e22", letterSpacing: "0.2em" }}>CARE</span>
              </h2>
              <div className="space-y-2.5">
                {[
                  { letter: "C", text: "Check the environment" },
                  { letter: "A", text: "Analyze the task steps" },
                  { letter: "R", text: "Remove or control hazards" },
                  { letter: "E", text: "Ensure everyone is safe" },
                ].map(({ letter, text }) => (
                  <div key={letter} className="flex items-center gap-4">
                    <span className="w-7 flex-shrink-0 text-right" style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.4rem", color: "#e67e22", lineHeight: 1 }}>{letter}</span>
                    <span style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontWeight: 400, fontSize: "0.9rem", color: "white", lineHeight: 1.3 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm space-y-5">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-7">
              <h2 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: "Roboto Slab, serif" }}>{"Log in"}</h2>
              <p className="text-xs text-muted-foreground mb-6" style={{ fontFamily: "DM Mono, monospace" }}>Enter your credentials to continue</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-semibold text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {loading ? "Logging in…" : "Log in"}
                </button>
              </form>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
