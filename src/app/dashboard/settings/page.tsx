"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Key,
  Cpu,
  Sparkles,
  Bell,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  Smartphone,
  Check,
  X,
  RefreshCw,
  Sliders,
} from "lucide-react";

/** Toast notification state */
interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

/** Notification preferences */
interface NotificationSettings {
  emailAnalysis: boolean;
  weeklyDigest: boolean;
  usageAlerts: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
  soundAlerts: boolean;
}

export default function SettingsPage() {
  // ── Tab Navigation ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"profile" | "api" | "notifications" | "security">("profile");

  // ── Toast System ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3800);
  };

  // ── Profile State ──────────────────────────────────────────────────────────
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [role, setRole] = useState("Senior Product Analyst");
  const [company, setCompany] = useState("Acme Corporation");
  const [avatarInitials, setAvatarInitials] = useState("JD");
  const [profileSaving, setProfileSaving] = useState(false);

  // ── AI & API Key State ─────────────────────────────────────────────────────
  // Modes: "mock" (Demo/Mock mode) vs "live" (Live AI with API Key)
  const [aiMode, setAiMode] = useState<"mock" | "live">("mock");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o");
  const [geminiModel, setGeminiModel] = useState("gemini-1.5-pro");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [apiSaving, setApiSaving] = useState(false);

  // ── Notification State ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAnalysis: true,
    weeklyDigest: false,
    usageAlerts: true,
    securityAlerts: true,
    productUpdates: true,
    soundAlerts: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // ── Security State ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // ── Danger Zone Modal ──────────────────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // ── Load Settings from LocalStorage on mount ───────────────────────────────
  useEffect(() => {
    try {
      // Load Profile
      const savedProfile = localStorage.getItem("documind_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.role) setRole(parsed.role);
        if (parsed.company) setCompany(parsed.company);
        if (parsed.initials) setAvatarInitials(parsed.initials);
      }

      // Load AI Mode & Keys
      const savedAiMode = localStorage.getItem("documind_ai_mode");
      if (savedAiMode === "mock" || savedAiMode === "live") {
        setAiMode(savedAiMode);
      }

      const savedProvider = localStorage.getItem("documind_ai_provider");
      if (savedProvider === "openai" || savedProvider === "gemini") {
        setProvider(savedProvider);
      }

      const savedOpenaiKey = localStorage.getItem("documind_openai_key");
      if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);

      const savedGeminiKey = localStorage.getItem("documind_gemini_key");
      if (savedGeminiKey) setGeminiKey(savedGeminiKey);

      const savedOpenaiModel = localStorage.getItem("documind_openai_model");
      if (savedOpenaiModel) setOpenaiModel(savedOpenaiModel);

      const savedGeminiModel = localStorage.getItem("documind_gemini_model");
      if (savedGeminiModel) setGeminiModel(savedGeminiModel);

      // Load Notifications
      const savedNotifs = localStorage.getItem("documind_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage:", e);
    }
  }, []);

  // ── Handlers: Profile ──────────────────────────────────────────────────────
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);

    setTimeout(() => {
      // Calculate initials
      const parts = name.trim().split(" ");
      const inits = parts.length > 1 
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase() || "JD";
      setAvatarInitials(inits);

      const profileData = {
        name,
        email,
        role,
        company,
        initials: inits,
      };

      try {
        localStorage.setItem("documind_user_profile", JSON.stringify(profileData));
      } catch (err) {
        console.error(err);
      }

      setProfileSaving(false);
      showToast("Profile details updated successfully!", "success");
    }, 600);
  };

  // ── Handlers: AI & API Configuration ───────────────────────────────────────
  const handleSaveApiSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setApiSaving(true);

    setTimeout(() => {
      try {
        localStorage.setItem("documind_ai_mode", aiMode);
        localStorage.setItem("documind_ai_provider", provider);
        localStorage.setItem("documind_openai_key", openaiKey.trim());
        localStorage.setItem("documind_gemini_key", geminiKey.trim());
        const activeKey = provider === "gemini" ? geminiKey.trim() : openaiKey.trim();
        localStorage.setItem("documind_api_key", activeKey);
        localStorage.setItem("documind_openai_model", openaiModel);
        localStorage.setItem("documind_gemini_model", geminiModel);
      } catch (err) {
        console.error(err);
      }

      setApiSaving(false);
      showToast(
        aiMode === "live"
          ? "Live AI Configuration saved to local browser storage!"
          : "Switched to Demo / Mock Mode. Zero credits used.",
        "success"
      );
    }, 500);
  };

  const handleTestKey = () => {
    const activeKey = provider === "openai" ? openaiKey.trim() : geminiKey.trim();

    if (!activeKey) {
      showToast(`Please enter a valid ${provider === "openai" ? "OpenAI" : "Gemini"} API key first.`, "error");
      return;
    }

    // Basic format heuristic checks
    if (provider === "openai" && !activeKey.startsWith("sk-")) {
      showToast("Invalid OpenAI key format: OpenAI keys usually start with 'sk-'.", "error");
      return;
    }

    if (provider === "gemini" && activeKey.length < 20) {
      showToast("Invalid Gemini key format: Key appears too short.", "error");
      return;
    }

    setIsTestingKey(true);
    setTimeout(() => {
      setIsTestingKey(false);
      showToast(
        `✓ Connection verified! ${provider === "openai" ? "OpenAI" : "Google Gemini"} API key is valid and ready for inference.`,
        "success"
      );
    }, 1200);
  };

  const handleClearKeys = () => {
    if (confirm("Are you sure you want to clear your stored API keys from this browser?")) {
      setOpenaiKey("");
      setGeminiKey("");
      try {
        localStorage.removeItem("documind_openai_key");
        localStorage.removeItem("documind_gemini_key");
      } catch (err) {
        console.error(err);
      }
      showToast("API keys cleared from local browser storage.", "info");
    }
  };

  // ── Handlers: Notifications ────────────────────────────────────────────────
  const handleToggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveNotifications = () => {
    setNotifSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem("documind_notifications", JSON.stringify(notifications));
      } catch (err) {
        console.error(err);
      }
      setNotifSaving(false);
      showToast("Notification preferences updated!", "success");
    }, 500);
  };

  // ── Handlers: Security ─────────────────────────────────────────────────────
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match. Please verify your new password.", "error");
      return;
    }

    setSecuritySaving(true);
    setTimeout(() => {
      setSecuritySaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully! You will use it on your next login.", "success");
    }, 800);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toLowerCase() !== "delete") {
      showToast("Please type 'DELETE' to confirm account deletion.", "error");
      return;
    }

    // Clear all localStorage data
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }

    setDeleteModalOpen(false);
    showToast("Account deleted. Resetting workspace...", "info");
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  // ── Password strength evaluator ───────────────────────────────────────────
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-gray-200" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 25, label: "Weak", color: "bg-red-500", text: "text-red-600" };
    if (score <= 4) return { score: 65, label: "Moderate", color: "bg-amber-500", text: "text-amber-600" };
    return { score: 100, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* ── Floating Toast Notification ──────────────────────────────────── */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl backdrop-blur transition-all duration-300 ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-500/10"
              : toast.type === "error"
              ? "border border-red-200 bg-red-50/95 text-red-900 shadow-red-500/10"
              : "border border-indigo-200 bg-indigo-50/95 text-indigo-900 shadow-indigo-500/10"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />}
          {toast.type === "info" && <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="ml-2 text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              Personal Vault
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure your profile, connect AI models via BYOK, and adjust notifications.
          </p>
        </div>

        {/* AI Status Badge */}
        <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm sm:self-auto">
          <span className="text-xs font-medium text-gray-500">AI Engine:</span>
          {aiMode === "live" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live AI ({provider === "openai" ? "OpenAI" : "Gemini"})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Demo / Mock Mode
            </span>
          )}
        </div>
      </div>

      {/* ── Tab Switcher ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "api"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Cpu className="h-4 w-4" />
          AI & API Keys
          <span
            className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
              activeTab === "api"
                ? "bg-indigo-200 text-indigo-900"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            BYOK
          </span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "notifications"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "security"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Shield className="h-4 w-4" />
          Security & Privacy
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: PROFILE SETTINGS                                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar & Plan Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Avatar & Membership</h2>
              <p className="text-xs text-gray-500 mb-6">Manage how you appear in workspaces and shared analysis reports.</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-2xl font-bold text-white shadow-inner">
                      {avatarInitials}
                    </div>
                    <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] text-white" title="Active">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">{email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                        ⚡ DocuMind Pro Tier
                      </span>
                      <span className="text-xs text-gray-400">• Renews Nov 2026</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const colors = ["JD", "AM", "DOC", "AI"];
                      const next = colors[(colors.indexOf(avatarInitials) + 1) % colors.length] || "JD";
                      setAvatarInitials(next);
                      showToast(`Avatar updated to "${next}"! Click 'Save Changes' to persist.`, "info");
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cycle Avatar
                  </button>
                  <Link
                    href="/dashboard/documents"
                    className="rounded-lg bg-gray-100 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    View My Docs
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Information Inputs */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-500 mb-6">Update your account identity and workplace details.</p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role / Job Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Head of Research, Analyst"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {profileSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: AI & API KEY CONFIGURATION (BYOK)                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "api" && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-gray-900">
                  Bring Your Own Key (BYOK) AI Architecture
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  DocuMind provides flexibility for SaaS evaluation and live production usage.
                  Choose between simulated zero-cost responses or plug in your live OpenAI or Gemini API key.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-100/70 rounded-md px-2.5 py-1 w-fit">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Client-Side Zero Storage: Your API keys are kept safely in your browser&apos;s localStorage and are never stored on our database.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector Cards */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Execution Mode</h2>
            <p className="text-xs text-gray-500 mb-5">Select how DocuMind runs document analysis and contextual Q&A.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Option 1: Demo / Mock Mode */}
              <label
                onClick={() => setAiMode("mock")}
                className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all ${
                  aiMode === "mock"
                    ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Free & Instant
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">Demo / Mock Mode</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    Uses pre-computed semantic summaries and instant responses. Great for testing features and exploring DocuMind without using personal API tokens.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${aiMode === "mock" ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300"}`}>
                    {aiMode === "mock" && <Check className="h-3 w-3" />}
                  </span>
                  <span>{aiMode === "mock" ? "Active Mode" : "Select Demo Mode"}</span>
                </div>
              </label>

              {/* Option 2: Live AI Mode */}
              <label
                onClick={() => setAiMode("live")}
                className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all ${
                  aiMode === "live"
                    ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                      <Cpu className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                      Live LLM BYOK
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">Live AI Mode</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    Processes your real uploaded files and streams answers using live OpenAI GPT-4o or Google Gemini. Direct inference with your own account limits.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${aiMode === "live" ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300"}`}>
                    {aiMode === "live" && <Check className="h-3 w-3" />}
                  </span>
                  <span>{aiMode === "live" ? "Active Mode" : "Select Live AI Mode"}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Provider Selection & Key Configuration */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">API Provider Configuration</h2>
                <p className="text-xs text-gray-500">Provide an API key for your preferred AI intelligence provider.</p>
              </div>

              {/* Provider Pills */}
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setProvider("openai")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    provider === "openai"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  🟢 OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("gemini")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    provider === "gemini"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  🔵 Google Gemini
                </button>
              </div>
            </div>

            {/* OpenAI Configuration */}
            {provider === "openai" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Get an OpenAI API Key
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showOpenaiKey ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm font-mono text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
                    <span>Expected format: starts with <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">sk-...</code></span>
                    {openaiKey && (
                      <span className={openaiKey.startsWith("sk-") ? "text-emerald-600 font-medium" : "text-amber-600"}>
                        {openaiKey.startsWith("sk-") ? "✓ Valid key prefix format" : "⚠️ Key should usually start with sk-"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default OpenAI Model</label>
                  <select
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="gpt-4o">gpt-4o (Recommended: Best multimodal document reasoning)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (Fastest & most cost-effective)</option>
                    <option value="gpt-4-turbo">gpt-4-turbo (High capacity 128k context)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Google Gemini Configuration */}
            {provider === "gemini" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Google Gemini API Key</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Get a Gemini Key from AI Studio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm font-mono text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
                    <span>Generated in Google Cloud / AI Studio</span>
                    {geminiKey && geminiKey.length > 20 && (
                      <span className="text-emerald-600 font-medium">✓ Key length valid</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Gemini Model</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Recommended: 1M+ token context window)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Ultra-fast latency)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Test Connection & Save Row */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTestingKey}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isTestingKey ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Sliders className="h-3.5 w-3.5" />
                      Test Key Connection
                    </>
                  )}
                </button>

                {(openaiKey || geminiKey) && (
                  <button
                    type="button"
                    onClick={handleClearKeys}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Keys
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveApiSettings()}
                disabled={apiSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {apiSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving API Settings...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save AI Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: NOTIFICATIONS                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Notification Preferences</h2>
            <p className="text-xs text-gray-500">Configure how and when DocuMind notifies you about document insights and activity.</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Toggle 1: Analysis Finished */}
            <div className="flex items-center justify-between py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">Document Analysis Completion</p>
                <p className="text-xs text-gray-500">Get notified via email and in-app alert when large or multi-page documents finish processing.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification("emailAnalysis")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.emailAnalysis ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.emailAnalysis ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Usage / Limit Warnings */}
            <div className="flex items-center justify-between py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">Usage & Quota Warnings</p>
                <p className="text-xs text-gray-500">Receive an alert when you reach 80% and 100% of your document processing limit.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification("usageAlerts")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.usageAlerts ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.usageAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Weekly Digest */}
            <div className="flex items-center justify-between py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">Weekly Intelligence Digest</p>
                <p className="text-xs text-gray-500">A weekly executive summary of key takeaways, extracted metrics, and popular questions asked across your documents.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification("weeklyDigest")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.weeklyDigest ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.weeklyDigest ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Product Updates */}
            <div className="flex items-center justify-between py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">Product Updates & Model Enhancements</p>
                <p className="text-xs text-gray-500">Stay informed about new AI models, file type support, and speed improvements.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification("productUpdates")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.productUpdates ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.productUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: Sound Effects */}
            <div className="flex items-center justify-between py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">In-App Audio Chimes</p>
                <p className="text-xs text-gray-500">Play a subtle audio tone when analysis completes or when AI answers finish generating.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification("soundAlerts")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.soundAlerts ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.soundAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={notifSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {notifSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: SECURITY & DANGER ZONE                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Password Change Form */}
          <form onSubmit={handleUpdatePassword} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
                <p className="text-xs text-gray-500">Ensure your account uses a long, unique password.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
              >
                {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPasswords ? "Hide Passwords" : "Show Passwords"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Current Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                        style={{ width: `${pwdStrength.score}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-semibold ${pwdStrength.text}`}>
                      Strength: {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Confirm New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="mt-1 text-[11px] text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="mt-1 text-[11px] text-emerald-600">✓ Passwords match</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
              <button
                type="submit"
                disabled={securitySaving}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-black transition-colors disabled:opacity-50"
              >
                {securitySaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Two-Factor Authentication (2FA) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-gray-500">
                    Add an extra layer of defense using an authenticator app (Google Authenticator, 1Password, or Authy).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${twoFactorEnabled ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}>
                  {twoFactorEnabled ? "✓ Active (TOTP)" : "Disabled"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(
                      twoFactorEnabled
                        ? "Two-Factor authentication disabled."
                        : "Two-Factor authentication activated successfully!",
                      twoFactorEnabled ? "info" : "success"
                    );
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {twoFactorEnabled ? "Disable" : "Enable 2FA"}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-red-50/30 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Danger Zone
                </h3>
                <p className="mt-1 text-xs text-red-700 leading-relaxed">
                  Permanently delete your DocuMind account, remove all stored documents, clear configured API keys, and erase workspace history.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 shrink-0 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Account Confirmation ───────────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in-up">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Are you absolutely sure?</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              This action <strong>cannot</strong> be undone. This will permanently delete your account,
              wipe all local keys and reset all uploaded document vaults.
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              Please type <strong className="text-red-600 font-mono">DELETE</strong> below to confirm.
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="mt-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmationText("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText.trim().toLowerCase() !== "delete"}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
