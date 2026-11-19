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
  if (r === "admin" || r === "owner" || r === "agency_admin") return "Administrator";
  if (r === "agent" || r === "staff" || r === "agency_staff") return "Agent";
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
}

export default function TeamMembersPanel() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
      <div className="bg-[#FBF9F4] border border-[#D5D9D5] rounded-xl px-5 py-4 text-sm text-[#3A3F3A] flex items-start gap-3">
        <i className="ri-information-line text-[#C28A78] mt-0.5" aria-hidden="true"></i>
        <p>
          To add or remove a team member, email{" "}
          <a href="mailto:support@lethub.uk?subject=Team%20member%20request" className="text-[#C28A78] underline">
            support@lethub.uk
          </a>{" "}
          from an administrator&apos;s address with their name, email and role. We aim to set them up within one working day.
        </p>
      </div>

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
