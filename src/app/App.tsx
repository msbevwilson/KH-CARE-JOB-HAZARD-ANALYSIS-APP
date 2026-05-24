import { useState, useEffect, useCallback, useMemo } from "react";
import * as api from "../utils/api";
import {
  NavKey, AuthUser, KingdomHall, JHARecord, JHAFilter, JHAStatus, PrintData,
  AppNotification, canCreateJHA, canManageUsers, PAGE_TITLES, PAGE_SUBS,
} from "./types";
import { Sidebar, MobileLeftNav } from "./components/Sidebar";
import { StatCard } from "./components/StatCard";
import { HazardBarChart } from "./components/HazardBarChart";
import { RecentJHAsSection } from "./components/JHAList";
import { NewJHAForm } from "./components/JHAForm";
import { JHADetailView } from "./components/JHADetailView";
import { PrintCardModal } from "./components/PrintCardModal";
import { LoginScreen } from "./screens/LoginScreen";
import { ChangePasswordScreen } from "./screens/ChangePasswordScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { HallsScreen } from "./screens/HallsScreen";
import { AdminScreen } from "./screens/UserScreen";
import { ProfileModal } from "./components/ProfileModal";
import { NotificationsPanel } from "./components/NotificationsPanel";
import {
  ShieldCheck, Clock, OctagonAlert, MapPin, Bell, Plus, HardHat,
} from "lucide-react";

export default function App() {
  const [users,       setUsers]       = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [halls,       setHalls]       = useState<KingdomHall[]>([]);
  const [activeNav,   setActiveNav]   = useState<NavKey>("dashboard");
  const [showNewJHA,  setShowNewJHA]  = useState(false);
  const [viewingJHA,  setViewingJHA]  = useState<JHARecord | null>(null);
  const [editRecord,  setEditRecord]  = useState<JHARecord | null>(null);
  const [printData,   setPrintData]   = useState<PrintData | null>(null);
  const [jhas,        setJhas]        = useState<JHARecord[]>([]);
  const [jhaFilter,   setJhaFilter]   = useState<JHAFilter>({});
  const [appLoading,        setAppLoading]        = useState(false);
  const [showProfile,       setShowProfile]       = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds,           setReadIds]           = useState<string[]>([]);

  const refreshHalls = useCallback(async () => {
    try { setHalls((await api.getHalls()) as KingdomHall[]); } catch {}
  }, []);

  const refreshJHAs = useCallback(async () => {
    try { setJhas((await api.getJHAs()) as JHARecord[]); } catch {}
  }, []);

  const refreshUsers = useCallback(async () => {
    try { setUsers((await api.getUsers()) as AuthUser[]); } catch {}
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setAppLoading(true);
    Promise.all([refreshHalls(), refreshJHAs(), refreshUsers()]).finally(() => setAppLoading(false));
  }, [currentUser?.id]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveNav("dashboard");
    setJhas([]);
    setHalls([]);
    setUsers([]);
  };

  const handleLogin = (u: AuthUser) => {
    setCurrentUser(u);
    if (u.role === "Worker") setActiveNav("jhas");
  };

  const handlePasswordChanged = async (newPassword: string) => {
    if (!currentUser) return;
    try {
      await api.updateUser(currentUser.id, { password: newPassword, mustChangePassword: false });
      const updated = { ...currentUser, mustChangePassword: false };
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    } catch (err: any) {
      alert(err?.message ?? "Failed to update password");
    }
  };

  const notifications = useMemo<AppNotification[]>(() => {
    if (!currentUser) return [];
    const isWorker = currentUser.role === "Worker";
    const userHall = halls.find(h => h.id === currentUser.hallId);
    const scoped = currentUser.role === "Admin" ? jhas : jhas.filter(j => j.site === userHall?.name);
    const out: AppNotification[] = [];
    for (const j of scoped) {
      if (!isWorker) {
        if (j.status === "Pending")
          out.push({ id: `pending-${j.ref}`,   type: "pending",   title: "JHA Awaiting Approval", body: `${j.ref} · ${j.job} · ${j.site}`, jhaRef: j.ref, timestamp: j.isoDate ?? j.date });
        if (j.risk === "High")
          out.push({ id: `highrisk-${j.ref}`,  type: "high_risk", title: "High-Risk JHA",          body: `${j.ref} · ${j.job} · ${j.site}`, jhaRef: j.ref, timestamp: j.isoDate ?? j.date });
      } else {
        if (j.submittedBy === currentUser.name && j.status === "Approved")
          out.push({ id: `approved-${j.ref}`,  type: "approved",  title: "JHA Approved",           body: `${j.ref} · ${j.job}`,             jhaRef: j.ref, timestamp: j.isoDate ?? j.date });
        if (j.submittedBy === currentUser.name && j.status === "Rejected")
          out.push({ id: `rejected-${j.ref}`,  type: "rejected",  title: "JHA Rejected",           body: `${j.ref} · ${j.job}`,             jhaRef: j.ref, timestamp: j.isoDate ?? j.date });
      }
    }
    return out.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [jhas, halls, currentUser]);

  if (!currentUser && appLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/35 flex items-center justify-center animate-pulse">
            <HardHat size={16} className="text-white" />
          </div>
          <p className="text-xs text-muted-foreground font-semibold" style={{ fontFamily: "DM Mono, monospace" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;
  if (currentUser.mustChangePassword) return <ChangePasswordScreen user={currentUser} onSave={handlePasswordChanged} />;

  if (appLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/35 flex items-center justify-center animate-pulse">
            <HardHat size={16} className="text-white" />
          </div>
          <p className="text-xs text-muted-foreground font-semibold" style={{ fontFamily: "DM Mono, monospace" }}>Loading…</p>
        </div>
      </div>
    );
  }

  // ─── JHA mutations ───────────────────────────────────────────────────────────

  const handleApiError = (err: any, fallback: string) => {
    alert(err?.message ?? fallback);
  };

  const addJHA = async (r: JHARecord) => {
    try {
      const created = await api.createJHA(r as any);
      setJhas(prev => [created as JHARecord, ...prev]);
    } catch (err: any) { handleApiError(err, "Failed to save JHA"); }
  };

  const updateJHA = async (r: JHARecord) => {
    try {
      const updated = await api.updateJHA(r.ref, r as any);
      setJhas(prev => prev.map(j => j.ref === r.ref ? (updated as JHARecord) : j));
    } catch (err: any) { handleApiError(err, "Failed to update JHA"); }
  };

  const deleteJHA = async (ref: string) => {
    try {
      await api.deleteJHA(ref);
      setJhas(prev => prev.filter(j => j.ref !== ref));
    } catch (err: any) { handleApiError(err, "Failed to delete JHA"); }
  };

  const updateStatus = async (ref: string, s: JHAStatus) => {
    try {
      await api.updateJHA(ref, { status: s });
      setJhas(prev => prev.map(j => j.ref === ref ? { ...j, status: s } : j));
    } catch (err: any) { handleApiError(err, "Failed to update status"); }
  };

  // ─── User mutations ──────────────────────────────────────────────────────────

  const addUser = async (u: AuthUser) => {
    try {
      const created = await api.createUser({ name: u.name, email: u.email, role: u.role, password: u.password ?? "", mustChangePassword: u.mustChangePassword ?? true, hallId: u.hallId, congregation: u.congregation, phoneNumbers: u.phoneNumbers, gender: u.gender });
      setUsers(prev => [...prev, created as AuthUser]);
    } catch (err: any) { handleApiError(err, "Failed to create user"); }
  };

  const updateUser = async (u: AuthUser) => {
    try {
      const payload: any = {
        name: u.name, email: u.email, role: u.role, mustChangePassword: u.mustChangePassword,
        hallId: u.hallId, congregation: u.congregation, phoneNumbers: u.phoneNumbers, gender: u.gender,
      };
      if (u.password) payload.password = u.password;
      const updated = await api.updateUser(u.id, payload);
      setUsers(prev => prev.map(x => x.id === u.id ? (updated as AuthUser) : x));
      if (currentUser?.id === u.id) setCurrentUser(updated as AuthUser);
    } catch (err: any) { handleApiError(err, "Failed to update user"); }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) { handleApiError(err, "Failed to delete user"); }
  };

  // ─── Hall mutations ──────────────────────────────────────────────────────────

  const addHall = async (h: KingdomHall) => {
    try {
      const created = await api.createHall({ name: h.name, address: h.address, ...h });
      setHalls(prev => [...prev, created as KingdomHall]);
    } catch (err: any) { handleApiError(err, "Failed to add hall"); }
  };

  const updateHall = async (h: KingdomHall) => {
    try {
      const updated = await api.updateHall(h.id, h);
      setHalls(prev => prev.map(x => x.id === h.id ? (updated as KingdomHall) : x));
    } catch (err: any) { handleApiError(err, "Failed to update hall"); }
  };

  const deleteHall = async (id: string) => {
    try {
      await api.deleteHall(id);
      setHalls(prev => prev.filter(h => h.id !== id));
    } catch (err: any) { handleApiError(err, "Failed to delete hall"); }
  };

  // ─── Navigation helpers ───────────────────────────────────────────────────────

  const goToJHAs = (filter: JHAFilter = {}) => {
    setJhaFilter(filter);
    setActiveNav("jhas");
    setShowNewJHA(false);
    setViewingJHA(null);
    setEditRecord(null);
  };

  const handleNavSelect = (k: NavKey) => {
    setActiveNav(k);
    setShowNewJHA(false);
    setViewingJHA(null);
    setEditRecord(null);
    if (k === "jhas") setJhaFilter({});
  };

  // ─── Derived values ───────────────────────────────────────────────────────────

  const isAdmin     = currentUser.role === "Admin";
  const userHall    = !isAdmin ? halls.find(h => h.id === currentUser.hallId) : undefined;
  const visibleHalls = isAdmin ? halls : halls.filter(h => h.id === currentUser.hallId);
  const visibleJhas  = isAdmin ? jhas  : jhas.filter(j => j.site === userHall?.name);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const highRiskCount  = visibleJhas.filter(j => j.risk === "High").length;
  const hallsLabel     = isAdmin ? "Kingdom Halls" : "Kingdom Hall";
  const headerTitle    = viewingJHA ? viewingJHA.ref : showNewJHA ? (editRecord ? "Edit JHA" : "New JHA")
    : activeNav === "halls" ? hallsLabel : PAGE_TITLES[activeNav];
  const headerSub      = viewingJHA ? viewingJHA.job
    : showNewJHA ? (editRecord ? `Editing ${editRecord.ref}` : "Fill in all sections then submit for approval")
    : PAGE_SUBS[activeNav];

  return (
    <div className="flex overflow-hidden bg-background" style={{ height: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar
        active={activeNav}
        onSelect={handleNavSelect}
        user={currentUser}
        onLogout={handleLogout}
        halls={halls}
        selectedHall={null}
        onSelectHall={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 pl-14 md:pl-0">
        <header className="flex-shrink-0 bg-card border-b border-border px-4 md:px-6 py-3 md:py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-foreground leading-tight" style={{ fontFamily: "Roboto Slab, serif" }}>
              {headerTitle}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block" style={{ fontFamily: "DM Mono, monospace" }}>
              {headerSub}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {activeNav === "dashboard" && highRiskCount > 0 && !showNewJHA && (
              <div className="hidden md:flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <OctagonAlert size={12} />
                {highRiskCount} High-Risk Pending
              </div>
            )}
            {!showNewJHA && !viewingJHA && activeNav !== "settings" && activeNav !== "jhas" && activeNav !== "halls" && activeNav !== "dashboard" && activeNav !== "users" && canCreateJHA(currentUser.role) && (
              <button
                onClick={() => { setActiveNav("jhas"); setShowNewJHA(true); }}
                className="hidden sm:flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <Plus size={13} /> New JHA
              </button>
            )}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center hover:bg-muted/50 transition-colors"
            >
              <Bell size={16} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border-2 border-white" />
              )}
            </button>

            <button
              onClick={() => setShowProfile(true)}
              title="View profile"
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/85 transition-colors"
            >
              <span className="text-white text-xs font-bold" style={{ fontFamily: "DM Mono, monospace" }}>{currentUser.initials}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5 pb-6">
          {viewingJHA ? (
            <JHADetailView
              jha={viewingJHA}
              role={currentUser.role}
              onBack={() => setViewingJHA(null)}
              onPrint={setPrintData}
              onEdit={() => {
                const rec = viewingJHA;
                setViewingJHA(null);
                setEditRecord(rec);
                setShowNewJHA(true);
              }}
              onDelete={async () => {
                await deleteJHA(viewingJHA.ref);
                setViewingJHA(null);
                setActiveNav("jhas");
              }}
              onStatusChange={async (s) => {
                await updateStatus(viewingJHA.ref, s);
                setViewingJHA(prev => prev ? { ...prev, status: s } : null);
              }}
            />
          ) : showNewJHA ? (
            <NewJHAForm
              onBack={() => { setShowNewJHA(false); setEditRecord(null); }}
              onPrint={setPrintData}
              onSubmit={async (r) => { await addJHA(r); setActiveNav("jhas"); }}
              onUpdate={async (r) => { await updateJHA(r); setShowNewJHA(false); setEditRecord(null); setActiveNav("jhas"); }}
              initialRecord={editRecord ?? undefined}
              halls={halls}
            />
          ) : (
            <>
              {activeNav === "dashboard" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <StatCard icon={ShieldCheck}  label="Active JHAs"       value={visibleJhas.length}                                       sub="↑ 8 submitted this month"   trend="up"      iconBg="bg-secondary"   iconColor="text-primary"                                          onClick={() => goToJHAs({})} />
                    <StatCard icon={Clock}        label="Pending Approvals"  value={visibleJhas.filter(j => j.status === "Pending").length}  sub="Awaiting supervisor review"  trend="neutral" iconBg="bg-amber-100"   iconColor="text-amber-700"   valueColor="text-amber-700"   onClick={() => goToJHAs({ status: "Pending" })} />
                    <StatCard icon={OctagonAlert} label="High-Risk Hazards"  value={visibleJhas.filter(j => j.risk === "High").length}       sub="Across active JHAs"          trend="down"    iconBg="bg-red-100"     iconColor="text-red-600"     valueColor="text-red-600" alert onClick={() => goToJHAs({ risk: "High" })} />
                    <StatCard icon={MapPin}       label={hallsLabel}         value={visibleHalls.length}                                      sub="Registered locations"        trend="up"      iconBg="bg-emerald-100" iconColor="text-emerald-700"                                       onClick={() => handleNavSelect("halls")} />
                  </div>
                  <HazardBarChart />
                  <RecentJHAsSection
                    jhas={visibleJhas}
                    onView={setViewingJHA}
                    onPrint={setPrintData}
                    onViewAll={() => goToJHAs({})}
                    filter={jhaFilter}
                    onFilterChange={setJhaFilter}
                  />
                </>
              )}

              {activeNav === "halls" && (
                <HallsScreen
                  halls={visibleHalls}
                  currentUser={currentUser}
                  onAdd={addHall}
                  onUpdate={updateHall}
                  onDelete={deleteHall}
                />
              )}

              {activeNav === "jhas" && (
                <RecentJHAsSection
                  jhas={visibleJhas}
                  onNewJHA={canCreateJHA(currentUser.role) ? () => setShowNewJHA(true) : undefined}
                  onView={setViewingJHA}
                  onPrint={setPrintData}
                  filter={jhaFilter}
                  onFilterChange={setJhaFilter}
                />
              )}

              {activeNav === "settings" && <SettingsScreen userRole={currentUser.role} halls={visibleHalls} />}

              {activeNav === "users" && canManageUsers(currentUser.role) && (
                <AdminScreen
                  users={users}
                  currentUser={currentUser}
                  halls={halls}
                  onAddUser={addUser}
                  onUpdateUser={updateUser}
                  onDeleteUser={deleteUser}
                />
              )}
            </>
          )}
        </main>
      </div>

      <MobileLeftNav active={activeNav} onSelect={handleNavSelect} role={currentUser.role} onLogout={handleLogout} />

      {printData && <PrintCardModal data={printData} onClose={() => setPrintData(null)} />}
      {showProfile && <ProfileModal user={currentUser} halls={halls} onClose={() => setShowProfile(false)} />}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          readIds={readIds}
          onMarkRead={id => setReadIds(prev => prev.includes(id) ? prev : [...prev, id])}
          onMarkAllRead={() => setReadIds(notifications.map(n => n.id))}
          onViewJHA={ref => {
            const jha = visibleJhas.find(j => j.ref === ref);
            if (jha) { setViewingJHA(jha); setShowNewJHA(false); }
          }}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
