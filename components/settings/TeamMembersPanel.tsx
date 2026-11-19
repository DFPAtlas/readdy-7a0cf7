"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface TeamMember {
  profile_id: string;
  full_name: string | null;
  email: string | null;
  member_role: string | null;
}

function roleLabel(role: string | null): string {
  if (!role) return "Member";
  const r = role.toLowerCase();
  if (r === "admin" || r === "owner" || r === "agency_admin" || r === "property_manager") return "Administrator";
  if (r === "agent" || r === "staff" || r === "agency_staff") return "Agent";
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
}

interface PendingInvite {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  expires_at: string;
}

interface Seats {
  members: number;
  pending: number;
  limit: number | null;
}

async function callInvites(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("manage-agency-invites", { body });
  if (data?.success) return { ok: true as const, data };
  let message: string | undefined = data?.error;
  const context = (error as { context?: Response } | null)?.context;
  if (!message && context && typeof context.json === "function") {
    try {
      message = (await context.json())?.error;
    } catch {
      // ignore
    }
  }
  return { ok: false as const, error: message || "Something went wrong. Please try again." };
}

export default function TeamMembersPanel() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [seats, setSeats] = useState<Seats | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("estate_agent_staff");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ kind: "ok" | "error"; text: string; link?: string } | null>(null);

  const loadInvites = async () => {
    const result = await callInvites({ action: "list" });
    if (result.ok) {
      setInvites(result.data.invites || []);
      setSeats(result.data.seats || null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
      const role = String((profile as { role?: string } | null)?.role || "");
      const admin = role === "estate_agent_admin" || role === "platform_admin";
      if (cancelled) return;
      setIsAdmin(admin);
      if (admin) await loadInvites();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteBusy(true);
    setInviteMessage(null);
    const result = await callInvites({ action: "create", email: inviteEmail, full_name: inviteName, role: inviteRole });
    setInviteBusy(false);
    if (!result.ok) {
      setInviteMessage({ kind: "error", text: result.error });
      return;
    }
    setInviteMessage(
      result.data.emailed
        ? { kind: "ok", text: `Invitation sent to ${inviteEmail.trim()}.` }
        : { kind: "ok", text: "Invitation created, but the email couldn't be sent. Send them this link:", link: result.data.invite_link },
    );
    setInviteEmail("");
    setInviteName("");
    await loadInvites();
  };

  const revoke = async (id: string) => {
    const result = await callInvites({ action: "revoke", invite_id: id });
    if (!result.ok) {
      setInviteMessage({ kind: "error", text: result.error });
      return;
    }
    await loadInvites();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      if (!cancelled) setCurrentUserId(uid);

      const { data, error: rpcError } = await supabase.rpc("agency_team_members" as never);
      if (!rpcError && Array.isArray(data)) {
        if (!cancelled) setMembers(data as TeamMember[]);
        return;
      }

      // Fallback before migration 018 is applied: list memberships, naming only
      // the signed-in user (profiles RLS hides colleagues' details).
      const { data: rows, error: memberError } = await supabase.from("agency_members").select("profile_id, role");
      if (cancelled) return;
      if (memberError) {
        setError("We couldn't load your team.");
        setMembers([]);
        return;
      }
      setMembers(
        (rows ?? []).map((row) => ({
          profile_id: row.profile_id,
          full_name: row.profile_id === uid ? auth.user?.user_metadata?.full_name ?? "You" : null,
          email: row.profile_id === uid ? auth.user?.email ?? null : null,
          member_role: row.role,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      {isAdmin ? (
        <form onSubmit={sendInvite} className="bg-white rounded-xl border border-[#D5D9D5] p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#3A3F3A]">Invite a team member</h2>
              <p className="text-sm text-[#687068] mt-1">They&apos;ll get an email with a link to set up their login. The link works once and lasts 7 days. To remove someone, email support@lethub.uk.</p>
            </div>
            {seats && (
              <p className="text-xs text-[#687068] whitespace-nowrap">
                {seats.limit === null
                  ? `${seats.members} members`
                  : `${seats.members + seats.pending} of ${seats.limit} seats used`}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#3A3F3A]">Email</span>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
                placeholder="name@agency.co.uk"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#3A3F3A]">Name (optional)</span>
              <input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                maxLength={160}
                className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#3A3F3A]">Role</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78] bg-white"
              >
                <option value="estate_agent_staff">Agent</option>
                <option value="estate_agent_admin">Administrator</option>
              </select>
            </label>
          </div>
          <p className="text-xs text-[#687068]">Administrators can also manage billing, settings and the team.</p>
          {inviteMessage && (
            <div role={inviteMessage.kind === "error" ? "alert" : "status"} className={`text-sm ${inviteMessage.kind === "error" ? "text-[#C46868]" : "text-[#3A3F3A]"}`}>
              <p>{inviteMessage.text}</p>
              {inviteMessage.link && (
                <input readOnly value={inviteMessage.link} onFocus={(e) => e.currentTarget.select()} className="mt-2 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-xs bg-[#FBF9F4]" />
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={inviteBusy || !inviteEmail.trim()}
            className="bg-[#C28A78] hover:bg-[#B07A69] text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
          >
            {inviteBusy ? "Sending…" : "Send invitation"}
          </button>
        </form>
      ) : (
        <div className="bg-[#FBF9F4] border border-[#D5D9D5] rounded-xl px-5 py-4 text-sm text-[#3A3F3A] flex items-start gap-3">
          <i className="ri-information-line text-[#C28A78] mt-0.5" aria-hidden="true"></i>
          <p>Ask an administrator in your agency to invite or remove team members.</p>
        </div>
      )}

      {isAdmin && invites.length > 0 && (
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <p className="px-5 py-3 text-sm font-medium text-[#3A3F3A] border-b border-[#D5D9D5] bg-[#FBF9F4]">Pending invitations</p>
          <ul className="divide-y divide-[#D5D9D5]">
            {invites.map((invite) => (
              <li key={invite.id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="text-[#3A3F3A]">{invite.full_name ? `${invite.full_name} · ` : ""}{invite.email}</p>
                  <p className="text-xs text-[#687068]">
                    {invite.role === "estate_agent_admin" ? "Administrator" : "Agent"} · expires{" "}
                    {new Date(invite.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <button type="button" onClick={() => revoke(invite.id)} className="text-xs text-[#DC2626] hover:underline">
                  Cancel invite
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        {members === null ? (
          <p className="px-5 py-6 text-sm text-[#687068]">Loading team…</p>
        ) : error ? (
          <p role="alert" className="px-5 py-6 text-sm text-[#C46868]">{error}</p>
        ) : members.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#687068]">No team members found for your agency.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                <th className="text-left px-5 py-3 font-medium text-[#687068]">User</th>
                <th className="text-left px-5 py-3 font-medium text-[#687068]">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5D9D5]">
              {members.map((member) => {
                const name = member.full_name || member.email || "Team member";
                return (
                  <tr key={member.profile_id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C28A78] rounded-full flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">
                            {name}
                            {member.profile_id === currentUserId && <span className="ml-2 text-xs text-[#687068]">(you)</span>}
                          </p>
                          {member.email && member.email !== name && <p className="text-xs text-[#687068]">{member.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#3A3F3A]">{roleLabel(member.member_role)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
