import { useState, useMemo } from "react";
import { HardHat, Eye, EyeOff, ShieldAlert, Check, X } from "lucide-react";
import { AuthUser } from "../types";

// ─── Password policy ──────────────────────────────────────────────────────────

export const PASSWORD_RULES = [
  { id: "length",    label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { id: "upper",     label: "One uppercase letter (A–Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",     label: "One lowercase letter (a–z)",      test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "One number (0–9)",                test: (p: string) => /[0-9]/.test(p) },
  { id: "special",   label: "One special character (!@#$…)",   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function validatePassword(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.label;
  }
  return null;
}

const STRENGTH_LEVELS = [
  { label: "Weak",   bar: "w-1/5", color: "bg-red-500",    text: "text-red-600"    },
  { label: "Weak",   bar: "w-2/5", color: "bg-red-400",    text: "text-red-500"    },
  { label: "Fair",   bar: "w-3/5", color: "bg-amber-400",  text: "text-amber-600"  },
  { label: "Good",   bar: "w-4/5", color: "bg-emerald-400",text: "text-emerald-600"},
  { label: "Strong", bar: "w-full",color: "bg-emerald-500", text: "text-emerald-600"},
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ChangePasswordScreen({ user, onSave }: { user: AuthUser; onSave: (newPassword: string) => void }) {
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [error,       setError]       = useState("");

  const ruleResults = useMemo(() => PASSWORD_RULES.map(r => ({ ...r, met: r.test(newPass) })), [newPass]);
  const metCount    = ruleResults.filter(r => r.met).length;
  const strength    = newPass.length === 0 ? null : STRENGTH_LEVELS[metCount - 1] ?? STRENGTH_LEVELS[0];
  const allMet      = metCount === PASSWORD_RULES.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword(newPass);
    if (err) { setError(err); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match."); return; }
    onSave(newPass);
  };

  const inputCls = "w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all";

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
        <div className="px-7 py-5 border-t border-white/10">
          <p className="text-white/30 text-xs" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>One more step before you continue</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-card border-b border-border px-4 md:px-6 py-3 md:py-3.5 flex items-center">
          <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>Set your password</h1>
        </header>

        <main className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <ShieldAlert size={14} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium">Signed in as <span className="font-bold">{user.email}</span></p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => { setNewPass(e.target.value); setError(""); }}
                      placeholder="Create a strong password"
                      required
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPass.length > 0 && strength && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.color}`} />
                        </div>
                        <span className={`text-xs font-semibold ${strength.text}`} style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}>
                          {strength.label}
                        </span>
                      </div>
                      {/* Requirements checklist */}
                      <div className="space-y-1 pt-0.5">
                        {ruleResults.map(r => (
                          <div key={r.id} className="flex items-center gap-1.5">
                            {r.met
                              ? <Check size={11} className="text-emerald-500 flex-shrink-0" />
                              : <X    size={11} className="text-muted-foreground/40 flex-shrink-0" />}
                            <span className={`text-xs transition-colors ${r.met ? "text-emerald-600" : "text-muted-foreground/60"}`} style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.72rem" }}>
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConf ? "text" : "password"}
                      value={confirmPass}
                      onChange={(e) => { setConfirmPass(e.target.value); setError(""); }}
                      placeholder="Re-enter new password"
                      required
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setShowConf(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPass.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {newPass === confirmPass
                        ? <><Check size={11} className="text-emerald-500" /><span className="text-xs text-emerald-600" style={{ fontSize: "0.72rem" }}>Passwords match</span></>
                        : <><X    size={11} className="text-red-400" />    <span className="text-xs text-red-500"     style={{ fontSize: "0.72rem" }}>Passwords do not match</span></>}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-xs font-semibold text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!allMet || newPass !== confirmPass}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Set password &amp; continue
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
