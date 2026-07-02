"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, MessageSquare, Trash2, UserPlus, Users } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const roles = ["JOB_SEEKER", "EMPLOYER", "FREELANCER", "ADMIN"];
type ManagedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};
type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tab, setTab] = useState("users");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const [u, c] = await Promise.all([
      authenticatedFetch(`${API_URL}/admin/users`),
      authenticatedFetch(`${API_URL}/admin/contacts`),
    ]);
    if (u.ok) setUsers(await u.json());
    if (c.ok) setContacts(await c.json());
  }, []);
  useEffect(() => {
    if (ready && user?.role !== "ADMIN") router.replace("/");
    if (user?.role === "ADMIN") load();
  }, [ready, user, router, load]);
  if (!ready || user?.role !== "ADMIN")
    return (
      <div className="container-page py-24 text-center text-muted">
        Checking administrator access…
      </div>
    );
  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await authenticatedFetch(`${API_URL}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await response.json();
    setNotice(
      response.ok
        ? "User created."
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message,
    );
    if (response.ok) {
      form.reset();
      load();
    }
  }
  async function updateUser(id: string, data: object) {
    const response = await authenticatedFetch(`${API_URL}/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) load();
  }
  async function removeUser(id: string) {
    if (!confirm("Permanently delete this user?")) return;
    const response = await authenticatedFetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    setNotice(data.reason || (response.ok ? "User deleted." : data.message));
    load();
  }
  async function updateContact(id: string, status: string) {
    const response = await authenticatedFetch(
      `${API_URL}/admin/contacts/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    if (response.ok) load();
  }
  async function broadcast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await authenticatedFetch(
      `${API_URL}/admin/notifications/broadcast`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      },
    );
    const data = await response.json();
    setNotice(
      response.ok ? `Delivered to ${data.delivered} users.` : data.message,
    );
    if (response.ok) form.reset();
  }
  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <section className="bg-primary py-12 text-white">
        <div className="container-page">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d8ff3e]">
            Secure administration
          </p>
          <h1 className="mt-3 text-4xl font-black">Platform control center</h1>
        </div>
      </section>
      <div className="container-page py-10">
        <div className="mb-6 flex gap-2">
          <Tab
            active={tab === "users"}
            onClick={() => setTab("users")}
            icon={Users}
          >
            Users
          </Tab>
          <Tab
            active={tab === "contacts"}
            onClick={() => setTab("contacts")}
            icon={MessageSquare}
          >
            Messages
          </Tab>
          <Tab
            active={tab === "broadcast"}
            onClick={() => setTab("broadcast")}
            icon={BellRing}
          >
            Notify
          </Tab>
        </div>
        {notice && (
          <p className="mb-5 rounded-xl bg-brandGreen/10 p-3 text-sm font-semibold text-brandGreen">
            {notice}
          </p>
        )}
        {tab === "users" && (
          <div className="space-y-6">
            <form
              onSubmit={createUser}
              className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-6"
            >
              <Input name="firstName" placeholder="First name" />
              <Input name="lastName" placeholder="Last name" />
              <Input name="email" type="email" placeholder="Email" />
              <Input name="password" type="password" placeholder="Password" />
              <select name="role" className="control">
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white">
                <UserPlus className="h-4 w-4" /> Add
              </button>
            </form>
            <div className="overflow-x-auto rounded-2xl bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="bg-primary/5 text-xs uppercase text-muted">
                    <th className="p-4">User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="p-4">
                        <b>
                          {item.firstName} {item.lastName}
                        </b>
                        <p className="text-xs text-muted">{item.email}</p>
                      </td>
                      <td>
                        <select
                          value={item.role}
                          onChange={(e) =>
                            updateUser(item.id, { role: e.target.value })
                          }
                          className="rounded-lg border p-2 text-xs"
                        >
                          {roles.map((role) => (
                            <option key={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            updateUser(item.id, { isActive: !item.isActive })
                          }
                          className={
                            item.isActive ? "text-brandGreen" : "text-redAccent"
                          }
                        >
                          {item.isActive ? "Active" : "Suspended"}
                        </button>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => removeUser(item.id)}
                          className="text-redAccent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === "contacts" && (
          <div className="space-y-3">
            {contacts.map((item) => (
              <article key={item.id} className="rounded-2xl bg-white p-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <b>{item.subject}</b>
                    <p className="text-xs text-muted">
                      {item.name} · {item.email}
                    </p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => updateContact(item.id, e.target.value)}
                    className="rounded-lg border px-2 text-xs"
                  >
                    <option>NEW</option>
                    <option>READ</option>
                    <option>RESOLVED</option>
                  </select>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm text-muted">
                  {item.message}
                </p>
              </article>
            ))}
          </div>
        )}
        {tab === "broadcast" && (
          <form
            onSubmit={broadcast}
            className="max-w-2xl space-y-4 rounded-2xl bg-white p-6"
          >
            <Input name="title" placeholder="Title" />
            <textarea
              name="body"
              required
              minLength={5}
              rows={5}
              placeholder="Notification message"
              className="control w-full"
            />
            <select name="role" className="control w-full">
              <option value="">All active users</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
              Send notification
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
function Input({
  name,
  placeholder,
  type = "text",
}: {
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      required
      minLength={type === "password" ? 8 : 2}
      placeholder={placeholder}
      className="control w-full"
    />
  );
}
function Tab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${active ? "bg-primary text-white" : "bg-white text-primary"}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
