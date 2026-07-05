"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Camera,
  Check,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { roleMeta } from "@/components/HeaderAuth";
import BrandLoader from "@/components/BrandLoader";
import { authenticatedFetch, updateStoredUser } from "@/lib/auth";
import type { NotificationPreferences, UserProfile } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
type Tab = "profile" | "security" | "notifications";

export default function ProfilePage() {
  const { user, ready, setUser, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    authenticatedFetch(`${API_URL}/users/profile`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Profile could not be loaded");
        setProfile(await response.json());
      })
      .catch((error) => toast.error(error.message));
  }, [user]);

  if (!ready || !user || !profile) {
    return <BrandLoader fullScreen={false} />;
  }

  const role = roleMeta[user.role] ?? { label: user.role, className: "bg-muted/10 text-muted" };
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      phone: form.get("phone") || undefined,
      headline: form.get("headline") || undefined,
      location: form.get("location") || undefined,
      bio: form.get("bio") || undefined,
      portfolioUrl: form.get("portfolioUrl") || undefined,
      linkedinUrl: form.get("linkedinUrl") || undefined,
      githubUrl: form.get("githubUrl") || undefined,
      skills: form.get("skills")?.toString().split(",").map((x) => x.trim()).filter(Boolean),
    };
    try {
      const response = await authenticatedFetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message);
      setProfile(data);
      const nextUser = { ...user, firstName: data.firstName, lastName: data.lastName };
      updateStoredUser(nextUser);
      setUser(nextUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile could not be updated");
    } finally {
      setSaving(false);
    }
  }

  async function persistAvatar(avatarUrl: string | null) {
    if (!user) return;
    const response = await authenticatedFetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message);
    setProfile(data);
    const nextUser = { ...user, avatarUrl: data.avatarUrl };
    updateStoredUser(nextUser);
    setUser(nextUser);
  }

  async function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    if (!user || !profile) return;
    const currentUser = user;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 3 MB");
      return;
    }

    const previousAvatar = profile.avatarUrl;
    const previewUrl = URL.createObjectURL(file);
    setProfile((current) => current ? { ...current, avatarUrl: previewUrl } : current);
    setUser({ ...currentUser, avatarUrl: previewUrl });
    setSaving(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const upload = await authenticatedFetch(`${API_URL}/uploads/avatar`, {
        method: "POST",
        body,
      });
      const result = await upload.json();
      if (!upload.ok) throw new Error(result.message || "Photo could not be uploaded");
      await persistAvatar(result.publicUrl);
      toast.success("Profile photo updated");
    } catch (error) {
      setProfile((current) => current ? { ...current, avatarUrl: previousAvatar } : current);
      setUser({ ...currentUser, avatarUrl: previousAvatar });
      toast.error(error instanceof Error ? error.message : "Photo could not be updated");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setSaving(false);
    }
  }

  async function removeAvatar() {
    if (!user || !profile) return;
    const currentUser = user;
    const previousAvatar = profile.avatarUrl;
    setProfile((current) => current ? { ...current, avatarUrl: null } : current);
    setUser({ ...currentUser, avatarUrl: null });
    setSaving(true);
    try {
      await persistAvatar(null);
      toast.success("Profile photo removed");
    } catch (error) {
      setProfile((current) => current ? { ...current, avatarUrl: previousAvatar } : current);
      setUser({ ...currentUser, avatarUrl: previousAvatar });
      toast.error(error instanceof Error ? error.message : "Photo could not be removed");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const values = new FormData(form);
    const newPassword = values.get("newPassword")?.toString() ?? "";
    if (newPassword !== values.get("confirmPassword")) {
      toast.error("New passwords do not match");
      setSaving(false);
      return;
    }
    try {
      const response = await authenticatedFetch(`${API_URL}/users/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: values.get("currentPassword"), newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message);
      toast.success("Password changed. Please sign in again");
      form.reset();
      logout();
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password could not be changed");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications(next: NotificationPreferences) {
    setSaving(true);
    try {
      const response = await authenticatedFetch(`${API_URL}/users/notification-preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Preferences could not be saved");
      setProfile((current) => current ? { ...current, ...data } : current);
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Preferences could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] py-10">
      <div className="container-page">
        <section className="overflow-hidden rounded-[28px] bg-primary text-white shadow-card">
          <div className="bg-gradient-to-r from-brandGreen/40 to-transparent p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar src={profile.avatarUrl} initials={initials} className="h-20 w-20 rounded-2xl text-2xl" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d8ff3e]">Account management</p>
                <h1 className="mt-2 break-words text-3xl font-black">{profile.firstName} {profile.lastName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/65">
                  <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{profile.email}</span>
                  {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${role.className}`}>{role.label}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav className="h-fit rounded-2xl border border-border bg-white p-2" aria-label="Account settings">
            <TabButton active={tab === "profile"} icon={UserRound} label="Profile details" onClick={() => setTab("profile")} />
            <TabButton active={tab === "security"} icon={KeyRound} label="Password & security" onClick={() => setTab("security")} />
            <TabButton active={tab === "notifications"} icon={Bell} label="Notifications" onClick={() => setTab("notifications")} />
          </nav>

          {tab === "profile" && <ProfileForm profile={profile} saving={saving} onSubmit={saveProfile} onAvatarChange={changeAvatar} onAvatarRemove={removeAvatar} />}
          {tab === "security" && <PasswordForm saving={saving} onSubmit={changePassword} />}
          {tab === "notifications" && (
            <NotificationSettings
              saving={saving}
              values={{
                emailNotifications: profile.emailNotifications,
                inAppNotifications: profile.inAppNotifications,
                jobAlerts: profile.jobAlerts,
              }}
              onSave={saveNotifications}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ profile, saving, onSubmit, onAvatarChange, onAvatarRemove }: { profile: UserProfile; saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void; onAvatarRemove: () => void }) {
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`;
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-white p-5 sm:p-7">
      <SectionTitle title="Profile details" text="Keep your professional information accurate and current." />
      <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-pageBg p-4 sm:flex-row sm:items-center">
        <Avatar src={profile.avatarUrl} initials={initials} className="h-20 w-20 rounded-full text-xl" />
        <div className="flex-1">
          <p className="font-bold text-primary">Profile photo</p>
          <p className="mt-1 text-xs text-muted">JPG, PNG, or WebP. Maximum size 3 MB.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-brandGreen">
              <Camera className="h-4 w-4" /> {profile.avatarUrl ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onAvatarChange} disabled={saving} className="sr-only" />
            </label>
            {profile.avatarUrl && <button type="button" onClick={onAvatarRemove} disabled={saving} className="inline-flex items-center gap-2 rounded-full border border-redAccent/20 px-4 py-2 text-xs font-bold text-redAccent hover:bg-redAccent/5"><Trash2 className="h-4 w-4" />Remove</button>}
          </div>
        </div>
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label="First name" defaultValue={profile.firstName} required />
        <Field name="lastName" label="Last name" defaultValue={profile.lastName} required />
        <Field name="email" label="Email" defaultValue={profile.email} disabled />
        <Field name="phone" label="Phone" defaultValue={profile.phone ?? ""} />
        <div className="sm:col-span-2"><Field name="headline" label="Professional headline" defaultValue={profile.headline ?? ""} placeholder="e.g. Senior Product Designer" /></div>
        <Field name="location" label="Location" defaultValue={profile.location ?? ""} />
        <Field name="skills" label="Skills (comma separated)" defaultValue={profile.skills.join(", ")} />
        <Field name="portfolioUrl" label="Portfolio URL" type="url" defaultValue={profile.portfolioUrl ?? ""} />
        <Field name="linkedinUrl" label="LinkedIn URL" type="url" defaultValue={profile.linkedinUrl ?? ""} />
        <div className="sm:col-span-2"><Field name="githubUrl" label="GitHub URL" type="url" defaultValue={profile.githubUrl ?? ""} /></div>
        <label className="sm:col-span-2 text-xs font-bold text-ink">Bio
          <textarea name="bio" defaultValue={profile.bio ?? ""} rows={5} maxLength={2000} className="control mt-1.5 w-full resize-y" placeholder="Tell employers about your experience and goals." />
        </label>
      </div>
      <SubmitButton saving={saving} label="Save changes" />
    </form>
  );
}

function PasswordForm({ saving, onSubmit }: { saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-white p-5 sm:p-7">
      <SectionTitle title="Password & security" text="Use a unique password with at least eight characters." />
      <div className="mt-7 max-w-xl space-y-5">
        <Field name="currentPassword" label="Current password" type="password" required autoComplete="current-password" />
        <Field name="newPassword" label="New password" type="password" required minLength={8} autoComplete="new-password" />
        <Field name="confirmPassword" label="Confirm new password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="mt-6 rounded-xl bg-brandGreen/10 p-4 text-sm text-brandGreen"><ShieldCheck className="mr-2 inline h-4 w-4" />Changing your password signs out your other sessions.</div>
      <SubmitButton saving={saving} label="Change password" />
    </form>
  );
}

function NotificationSettings({ values, saving, onSave }: { values: NotificationPreferences; saving: boolean; onSave: (values: NotificationPreferences) => void }) {
  const [settings, setSettings] = useState(values);
  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-7">
      <SectionTitle title="Notification preferences" text="Choose how Beleqet keeps you informed." />
      <div className="mt-7 divide-y divide-border">
        <Toggle label="Email notifications" text="Application updates and important account messages." checked={settings.emailNotifications} onChange={(value) => setSettings({ ...settings, emailNotifications: value })} />
        <Toggle label="In-app notifications" text="Updates in the notification center." checked={settings.inAppNotifications} onChange={(value) => setSettings({ ...settings, inAppNotifications: value })} />
        <Toggle label="Job alerts" text="Relevant new opportunities and recommendations." checked={settings.jobAlerts} onChange={(value) => setSettings({ ...settings, jobAlerts: value })} />
      </div>
      <button onClick={() => onSave(settings)} disabled={saving} className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-brandGreen disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save preferences
      </button>
    </section>
  );
}

function Toggle({ label, text, checked, onChange }: { label: string; text: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div><p className="font-bold text-primary">{label}</p><p className="mt-1 text-sm text-muted">{text}</p></div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-brandGreen" : "bg-slate-300"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-xs font-bold text-ink">{label}<input {...props} className="control mt-1.5 w-full disabled:bg-slate-50 disabled:text-muted" /></label>;
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return <div><h2 className="text-2xl font-black text-primary">{title}</h2><p className="mt-1 text-sm text-muted">{text}</p></div>;
}

function SubmitButton({ saving, label }: { saving: boolean; label: string }) {
  return <button disabled={saving} className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-brandGreen disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{label}</button>;
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Briefcase; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${active ? "bg-primary text-white" : "text-muted hover:bg-pageBg hover:text-primary"}`}><Icon className="h-4 w-4" />{label}</button>;
}

function Avatar({ src, initials, className }: { src?: string | null; initials: string; className: string }) {
  return src
    ? <img src={src} alt="Profile" className={`${className} shrink-0 object-cover ring-4 ring-white/20`} />
    : <span className={`${className} inline-flex shrink-0 items-center justify-center bg-[#d8ff3e] font-black uppercase text-primary`}>{initials}</span>;
}
