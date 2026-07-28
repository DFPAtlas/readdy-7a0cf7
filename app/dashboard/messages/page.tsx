"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount, showDemoBlockedMessage } from "@/lib/demoMode";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";
import {
  Conversation,
  MessageItem,
  MessageActionItem,
  ParticipantType,
  MessageContext,
  DeliveryState,
  MailboxKey,
  mailboxCategories,
  demoDisclaimer,
} from "@/lib/communicationSystem";
import ConversationList from "@/components/dashboard/ConversationList";
import ConversationView from "@/components/dashboard/ConversationView";
import ConversationDetailsDrawer from "@/components/dashboard/ConversationDetailsDrawer";
import NewMessageWizard from "@/components/dashboard/NewMessageWizard";
import CommunicationActionCentre from "@/components/dashboard/CommunicationActionCentre";
import ReplyModal from "@/components/dashboard/ReplyModal";

const seedConversations: Conversation[] = [
  {
    id: "conv-001",
    participantName: "John Miller",
    participantType: "tenant",
    participantEmail: "john.m@example.com",
    context: "rent",
    relatedRecord: "Tenancy",
    propertyName: "12 Rose Avenue",
    lastMessagePreview: "Thank you for your June rent payment...",
    lastMessageAt: "10:15 AM",
    unreadCount: 0,
    requiresReply: false,
    deliveryProblem: false,
    conversationStatus: "resolved",
    assignedTo: "Sarah Cooper",
    messages: [
      { id: "msg-001", senderName: "Sarah Cooper", senderType: "agency", body: "Dear John,\n\nThank you for your June rent payment of £1,650. This confirms your rent for 12 Rose Avenue has been settled.\n\nKind regards,\nSarah Cooper\nLetHub Property Management", deliveryState: "delivered", createdAt: "10 Jun 2026, 10:15 AM", isInternalNote: false },
      { id: "msg-001b", senderName: "John Miller", senderType: "tenant", body: "Thanks Sarah, much appreciated.", deliveryState: "read", createdAt: "10 Jun 2026, 11:30 AM", isInternalNote: false },
    ],
  },
  {
    id: "conv-002",
    participantName: "James Richardson",
    participantType: "landlord",
    participantEmail: "j.richardson@example.com",
    context: "maintenance",
    relatedRecord: "Landlord — 3 Properties",
    propertyName: "45 Baker Street",
    lastMessagePreview: "I recommend proceeding with the GreenPlumb Ltd quote...",
    lastMessageAt: "12 Jun 2026, 2:00 PM",
    unreadCount: 0,
    requiresReply: true,
    deliveryProblem: false,
    conversationStatus: "awaiting_external",
    assignedTo: "Tom Wilson",
    messages: [
      { id: "msg-002", senderName: "Tom Wilson", senderType: "agency", body: "Dear James,\n\nFollowing the boiler inspection at 45 Baker Street, we have received a quote from GreenPlumb Ltd:\n\n• Full boiler replacement: £2,340 + VAT\n• Installation: 2 days\n• Warranty: 10 years\n\nWe recommend proceeding as the current boiler is 14 years old.\n\nPlease let us know how you'd like to proceed.", deliveryState: "delivered", createdAt: "12 Jun 2026, 2:00 PM", isInternalNote: false },
      { id: "msg-002b", senderName: "Tom Wilson", senderType: "agency", body: "James hasn't responded yet — follow up on Thursday if no reply.", deliveryState: "draft", createdAt: "14 Jun 2026, 9:00 AM", isInternalNote: true },
    ],
  },
  {
    id: "conv-003",
    participantName: "Lisa Chen",
    participantType: "tenant",
    participantEmail: "l.chen@example.com",
    context: "maintenance",
    relatedRecord: "Tenancy",
    propertyName: "Flat 7 Park View",
    lastMessagePreview: "A specialist will visit on Friday 19 June at 10 AM...",
    lastMessageAt: "13 Jun 2026, 8:45 AM",
    unreadCount: 1,
    requiresReply: false,
    deliveryProblem: false,
    conversationStatus: "awaiting_external",
    assignedTo: "Tom Wilson",
    messages: [
      { id: "msg-003", senderName: "Lisa Chen", senderType: "tenant", body: "Hi, the damp patch on the bathroom ceiling has gotten bigger. There's now a water stain about 30cm across. I'm worried about mould. Can someone come and look?", deliveryState: "read", createdAt: "12 Jun 2026, 18:30 PM", isInternalNote: false },
      { id: "msg-003b", senderName: "Tom Wilson", senderType: "agency", body: "Hi Lisa,\n\nThank you for reporting this. I've arranged for a specialist damp surveyor to visit Flat 7 Park View this Friday 19 June at 10:00 AM. Please ensure the bathroom is clear.\n\nThe inspection should take about 45 minutes.\n\nKind regards,\nTom Wilson", deliveryState: "delivered", createdAt: "13 Jun 2026, 8:45 AM", isInternalNote: false },
    ],
  },
  {
    id: "conv-004",
    participantName: "Sarah Jenkins",
    participantType: "tenant",
    participantEmail: "s.jenkins@example.com",
    context: "rent",
    relatedRecord: "Tenancy",
    propertyName: "Flat 4B Oak Street",
    lastMessagePreview: "Your rent of £1,850 is now 5 days overdue...",
    lastMessageAt: "15 Jun 2026, 9:00 AM",
    unreadCount: 0,
    requiresReply: true,
    deliveryProblem: false,
    conversationStatus: "awaiting_external",
    assignedTo: "Sarah Cooper",
    messages: [
      { id: "msg-004", senderName: "Sarah Cooper", senderType: "agency", body: "Dear Sarah,\n\nOur records show your rent of £1,850 for Flat 4B Oak Street is now 5 days overdue.\n\nIf you've already made the payment, please disregard this message. If you're experiencing financial difficulty, please contact us to discuss options.\n\nKind regards,\nSarah Cooper\nLetHub Property Management", deliveryState: "sent", createdAt: "15 Jun 2026, 9:00 AM", isInternalNote: false },
    ],
  },
  {
    id: "conv-005",
    participantName: "GreenPlumb Ltd",
    participantType: "contractor",
    participantEmail: "jobs@greenplumb.co.uk",
    context: "maintenance",
    relatedRecord: "Contractor",
    propertyName: "45 Baker Street",
    lastMessagePreview: "Boiler replacement booked for 22 June, 9 AM...",
    lastMessageAt: "16 Jun 2026, 11:00 AM",
    unreadCount: 0,
    requiresReply: false,
    deliveryProblem: false,
    conversationStatus: "resolved",
    assignedTo: "Tom Wilson",
    messages: [
      { id: "msg-005", senderName: "GreenPlumb Ltd", senderType: "contractor", body: "We can do the boiler replacement at 45 Baker Street on Monday 22 June, starting 9 AM. Should take 2 days. The tenant Emily Carter has been notified. Please confirm.", deliveryState: "read", createdAt: "16 Jun 2026, 10:30 AM", isInternalNote: false },
      { id: "msg-005b", senderName: "Tom Wilson", senderType: "agency", body: "That works — confirmed for 22 June. We'll notify the tenant. Please send the completion certificate once done.", deliveryState: "delivered", createdAt: "16 Jun 2026, 11:00 AM", isInternalNote: false },
    ],
  },
  {
    id: "conv-006",
    participantName: "David Thompson",
    participantType: "landlord",
    participantEmail: "d.thompson@example.com",
    context: "compliance",
    relatedRecord: "Landlord — 1 Property",
    propertyName: "Flat 4B Oak Street",
    lastMessagePreview: "The EICR for your property expires on 30 June...",
    lastMessageAt: "13 Jun 2026, 8:00 AM",
    unreadCount: 0,
    requiresReply: true,
    deliveryProblem: false,
    conversationStatus: "awaiting_external",
    assignedTo: "Sarah Cooper",
    messages: [
      { id: "msg-006", senderName: "Sarah Cooper", senderType: "agency", body: "Dear David,\n\nThe Electrical Installation Condition Report (EICR) for Flat 4B Oak Street expires on 30 June 2026.\n\nWe've scheduled an inspection with SparkPro Electrics for Monday 22 June at 2:00 PM. Estimated cost: £180 + VAT.\n\nPlease confirm you're happy to proceed.", deliveryState: "sent", createdAt: "13 Jun 2026, 8:00 AM", isInternalNote: false },
      { id: "msg-006b", senderName: "Sarah Cooper", senderType: "agency", body: "This is urgent — EICR expiry in 12 days. If David doesn't reply by Wednesday, call him.", deliveryState: "draft", createdAt: "15 Jun 2026, 16:00 PM", isInternalNote: true },
    ],
  },
  {
    id: "conv-007",
    participantName: "Emily Carter",
    participantType: "tenant",
    participantEmail: "e.carter@example.com",
    context: "general",
    relatedRecord: "Tenancy",
    propertyName: "45 Baker Street",
    lastMessagePreview: "Just confirming the balcony door has been fixed...",
    lastMessageAt: "16 Jun 2026, 14:00 PM",
    unreadCount: 2,
    requiresReply: false,
    deliveryProblem: true,
    conversationStatus: "assigned",
    assignedTo: "Tom Wilson",
    messages: [
      { id: "msg-007", senderName: "Emily Carter", senderType: "tenant", body: "Hi Tom, just wondering if anyone is coming to fix the balcony door? It's been sticking for a couple of weeks now.", deliveryState: "read", createdAt: "16 Jun 2026, 13:45 PM", isInternalNote: false },
      { id: "msg-007b", senderName: "Tom Wilson", senderType: "agency", body: "Hi Emily, SparkPro are scheduled for Wednesday. I'll confirm the time once they get back to me.", deliveryState: "failed", createdAt: "16 Jun 2026, 14:00 PM", isInternalNote: false },
    ],
  },
  {
    id: "conv-008",
    participantName: "Sarah Cooper",
    participantType: "agency",
    participantEmail: "s.cooper@lethub.uk",
    context: "compliance",
    relatedRecord: "Team",
    propertyName: "34 Maple Gardens",
    lastMessagePreview: "Internal: Need to book the fire alarm test for July...",
    lastMessageAt: "17 Jun 2026, 9:30 AM",
    unreadCount: 1,
    requiresReply: false,
    deliveryProblem: false,
    conversationStatus: "assigned",
    assignedTo: "Tom Wilson",
    messages: [
      { id: "msg-008", senderName: "Sarah Cooper", senderType: "agency", body: "Tom — can you book the quarterly fire alarm test for 34 Maple Gardens? It's due first week of July. SparkPro usually handles it.", deliveryState: "read", createdAt: "17 Jun 2026, 9:30 AM", isInternalNote: false },
      { id: "msg-008b", senderName: "Tom Wilson", senderType: "agency", body: "On it. I'll email SparkPro now and confirm the date. Remind me — do we need the tenant present?", deliveryState: "delivered", createdAt: "17 Jun 2026, 9:35 AM", isInternalNote: false },
    ],
  },
];

const seedActions: MessageActionItem[] = [
  { id: "act-001", conversationId: "conv-002", type: "reply_required", priority: "high", participantName: "James Richardson", participantType: "landlord", propertyName: "45 Baker Street", context: "maintenance", issue: "Awaiting boiler replacement approval — quote sent 12 June, no response", date: "5 days ago" },
  { id: "act-002", conversationId: "conv-004", type: "reply_required", priority: "critical", participantName: "Sarah Jenkins", participantType: "tenant", propertyName: "Flat 4B Oak Street", context: "rent", issue: "Rent 5 days overdue — £1,850 outstanding, reminder sent", date: "2 days ago" },
  { id: "act-003", conversationId: "conv-006", type: "reply_required", priority: "high", participantName: "David Thompson", participantType: "landlord", propertyName: "Flat 4B Oak Street", context: "compliance", issue: "EICR expires 30 June — SparkPro booking awaiting approval", date: "4 days ago" },
  { id: "act-004", conversationId: "conv-007", type: "delivery_failed", priority: "high", participantName: "Emily Carter", participantType: "tenant", propertyName: "45 Baker Street", context: "maintenance", issue: "Last message failed to deliver — retry or use alternative channel", date: "1 day ago" },
];

export default function CommunicationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [actionItems, setActionItems] = useState<MessageActionItem[]>([]);
  const [mailboxFilter, setMailboxFilter] = useState<MailboxKey>("inbox");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "conversation">("list");
  const [replyConversation, setReplyConversation] = useState<Conversation | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const d = isDemoAccount();
    setDemoMode(d);
    if (d) {
      setConversations(seedConversations);
      setActionItems(seedActions);
      setLoading(false);
      return;
    }
    fetchLiveData();
  }, []);

  const refetchLive = useCallback(() => {
    fetchLiveData();
  }, []);

  useRealtimeSubscription({ table: "messages", event: "*", onChange: refetchLive, channelName: "rt-conv-messages" });

  async function fetchLiveData() {
    setLoading(true);
    setError(null);
    try {
      const { data: msgs } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(50);
      if (msgs && msgs.length > 0) {
        const live: Conversation[] = [];
        const grouped = new Map<string, any[]>();
        msgs.forEach((m: any) => {
          const key = m.conversation_id || m.related_id || m.recipient_id || "unknown";
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key)!.push(m);
        });
        grouped.forEach((msgsList, key) => {
          const latest = msgsList[0];
          live.push({
            id: key,
            participantName: latest.recipient_name || "Recipient",
            participantType: "tenant",
            context: "general",
            relatedRecord: key,
            propertyName: "",
            lastMessagePreview: (latest.body || "").slice(0, 80),
            lastMessageAt: new Date(latest.created_at).toLocaleString("en-GB"),
            unreadCount: msgsList.filter((m: any) => m.status === "unread").length,
            requiresReply: false,
            deliveryProblem: false,
            conversationStatus: "assigned",
            messages: msgsList.map((m: any) => ({ id: m.id, senderName: "User", senderType: "agency" as ParticipantType, body: m.body || "", deliveryState: (m.delivery_state || "sent") as DeliveryState, createdAt: new Date(m.created_at).toLocaleString("en-GB"), isInternalNote: false })),
          });
        });
        setConversations(live);
      }
      const { data: ntf } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
      if (ntf && ntf.length > 0) {
        const acts: MessageActionItem[] = ntf.filter((n: any) => !n.is_read).map((n: any) => ({
          id: n.id, conversationId: n.id, type: "reply_required" as const, priority: "medium" as const,
          participantName: "User", participantType: "tenant" as ParticipantType,
          propertyName: "", context: "general" as MessageContext,
          issue: n.title, date: new Date(n.created_at).toLocaleDateString("en-GB"),
        }));
        setActionItems(acts);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  const filteredConversations = useMemo(() => {
    let items = conversations;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((c) =>
        c.participantName.toLowerCase().includes(q) ||
        (c.propertyName && c.propertyName.toLowerCase().includes(q)) ||
        c.lastMessagePreview.toLowerCase().includes(q)
      );
    }
    switch (mailboxFilter) {
      case "requires_reply": return items.filter((c) => c.requiresReply);
      case "unread": return items.filter((c) => c.unreadCount > 0);
      case "drafts": return items.filter((c) => c.messages.some((m) => m.deliveryState === "draft"));
      case "archived": return items.filter((c) => c.conversationStatus === "closed");
      default: return items;
    }
  }, [conversations, mailboxFilter, search]);

  const stats = useMemo(() => ({
    requiresReply: conversations.filter((c) => c.requiresReply).length,
    unread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    deliveryProblems: conversations.filter((c) => c.deliveryProblem).length,
    total: conversations.length,
  }), [conversations]);

  const handleSelectConversation = (conv: Conversation) => {
    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
    setSelectedConversation({ ...conv, messages: [...conv.messages] });
    setMobileView("conversation");
  };

  const handleReplyAction = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId) || conversations[0];
    if (!conv) return;
    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
    setReplyConversation({ ...conv, messages: [...conv.messages] });
  };

  const handleReplyModalSend = (bodyText: string) => {
    if (!replyConversation) return;
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: "You",
      senderType: "agency",
      body: bodyText,
      deliveryState: "sent",
      createdAt: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      isInternalNote: false,
    };
    setConversations((prev) => prev.map((c) => c.id === replyConversation.id ? { ...c, messages: [...c.messages, newMsg], lastMessagePreview: bodyText.slice(0, 80), requiresReply: false } : c));
    setReplyConversation((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
    setActionItems((prev) => prev.filter((a) => a.conversationId !== replyConversation.id));
    showToast("Reply sent");
  };

  const handleSendMessage = (body: string) => {
    if (!selectedConversation) return;
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: "You",
      senderType: "agency",
      body,
      deliveryState: "sent",
      createdAt: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      isInternalNote: false,
    };
    setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, messages: [...c.messages, newMsg], lastMessagePreview: body.slice(0, 80), lastMessageAt: new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" }), requiresReply: false } : c));
    showToast("Message sent");
  };

  const handleAddInternalNote = (body: string) => {
    if (!selectedConversation) return;
    const newMsg: MessageItem = {
      id: `note-${Date.now()}`,
      senderName: "You",
      senderType: "agency",
      body,
      deliveryState: "draft",
      createdAt: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      isInternalNote: true,
    };
    setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, messages: [...c.messages, newMsg] } : c));
    showToast("Internal note saved");
  };

  const handleResolve = () => {
    if (!selectedConversation) return;
    setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, conversationStatus: "resolved" } : c));
    showToast("Conversation marked as resolved");
  };

  const handleReopen = () => {
    if (!selectedConversation) return;
    setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, conversationStatus: "awaiting_agency" } : c));
    showToast("Conversation reopened");
  };

  const handleNewMessageSend = (data: { recipient: any; context: MessageContext; subject: string; body: string }) => {
    if (isDemoAccount()) { showDemoBlockedMessage(); return; }
    const newConv: Conversation = {
      id: `conv-new-${Date.now()}`,
      participantName: data.recipient.name,
      participantType: data.recipient.type,
      participantEmail: data.recipient.email,
      context: data.context,
      relatedRecord: data.recipient.relatedRecord,
      propertyName: data.recipient.propertyName,
      lastMessagePreview: data.body.slice(0, 80),
      lastMessageAt: new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      unreadCount: 0,
      requiresReply: false,
      deliveryProblem: false,
      conversationStatus: "assigned",
      assignedTo: "You",
      messages: [{
        id: `msg-new-${Date.now()}`,
        senderName: "You",
        senderType: "agency",
        body: data.body,
        deliveryState: "sent",
        createdAt: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        isInternalNote: false,
      }],
    };
    setConversations((prev) => [newConv, ...prev]);
    showToast("Conversation created and message sent");
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading messages...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-[#EF4444] text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#3A3F3A] mb-1">Failed to load messages</p>
            <p className="text-xs text-[#687068] mb-4">{error}</p>
            <button onClick={fetchLiveData} className="px-4 py-2 text-sm font-medium text-white bg-[#C28A78] rounded-lg hover:bg-[#143828] whitespace-nowrap">Retry</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-4 h-[calc(100vh-130px)] flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Messages</h1>
            <p className="text-sm text-[#687068] mt-1">Conversations with tenants, landlords, contractors and your team</p>
          </div>
          <div className="flex items-center gap-3">
            {demoMode && (
              <DemoHelperTip id="messages-overview" title="Message Centre">
                The message centre shows all conversations organised by participant. Internal notes are visually separated from external messages. Conversations requiring replies are highlighted. Use the New Message button to start a guided compose flow.
              </DemoHelperTip>
            )}
            <button
              onClick={() => setShowNewMessage(true)}
              className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line text-sm"></i></div>
              New Message
            </button>
          </div>
        </div>

        {actionItems.length > 0 && <div className="flex-shrink-0"><CommunicationActionCentre actions={actionItems} onReply={handleReplyAction} /></div>}

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1 max-w-[320px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"><i className="ri-close-line text-[#94A3B8] text-xs"></i></button>}
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-0.5">
            {(["tenant", "landlord", "contractor", "agency"] as ParticipantType[]).map((pt) => {
              const labels: Record<string, string> = { tenant: "Tenants", landlord: "Landlords", contractor: "Contractors", agency: "Team" };
              return (
                <button
                  key={pt}
                  onClick={() => setSearch(search === pt ? "" : pt)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${search === pt ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}
                >
                  {labels[pt]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-[#D5D9D5] overflow-hidden flex min-h-0">
          {/* Mailbox Navigation */}
          <div className="w-[180px] border-r border-[#D5D9D5] bg-[#FBF9F4] flex-shrink-0 hidden lg:flex flex-col py-2">
            {mailboxCategories.map((cat) => {
              let count = 0;
              if (cat.key === "requires_reply") count = stats.requiresReply;
              if (cat.key === "unread") count = stats.unread;
              if (cat.key === "inbox") count = stats.total;
              return (
                <button
                  key={cat.key}
                  onClick={() => setMailboxFilter(cat.key)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${mailboxFilter === cat.key ? "bg-[#C28A78]/10 text-[#C28A78] font-semibold border-r-2 border-r-[#C28A78]" : "text-[#687068] hover:bg-[#F1F5F9]"}`}
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${cat.icon} text-sm`}></i></div>
                  <span className="flex-1">{cat.label}</span>
                  {count > 0 && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${mailboxFilter === cat.key ? "bg-[#C28A78] text-white" : "bg-[#D5D9D5] text-[#687068]"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile mailbox selector */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-[#D5D9D5] bg-[#FBF9F4]">
            {mailboxCategories.slice(0, 4).map((cat) => (
              <button
                key={cat.key}
                onClick={() => setMailboxFilter(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${mailboxFilter === cat.key ? "bg-[#C28A78] text-white" : "text-[#687068] bg-[#F1F5F9]"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Conversation List Panel */}
          <div className={`${selectedConversation ? "hidden lg:flex lg:flex-col" : "flex flex-col"} flex-1 lg:max-w-[360px] lg:border-r border-[#D5D9D5] min-w-0`}>
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id || null}
              onSelect={handleSelectConversation}
              mailboxFilter={mailboxFilter}
            />
          </div>

          {/* Conversation View Panel */}
          {selectedConversation ? (
            <div className="hidden lg:flex lg:flex-col flex-1 min-w-0">
              <ConversationView
                conversation={selectedConversation}
                onBack={() => { setSelectedConversation(null); setMobileView("list"); }}
                onOpenDetails={() => setShowDetails(true)}
                onSendMessage={handleSendMessage}
                onAddInternalNote={handleAddInternalNote}
                onResolve={handleResolve}
                onReopen={handleReopen}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-[#FBF9F4]/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-chat-3-line text-[#94A3B8] text-2xl"></i>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A] mb-1">Select a conversation</p>
                <p className="text-xs text-[#687068]">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}

          {/* Mobile conversation view (full screen) */}
          {selectedConversation && (
            <div className={`lg:hidden fixed inset-0 z-40 bg-white flex flex-col ${mobileView === "conversation" ? "" : "hidden"}`}>
              <ConversationView
                conversation={selectedConversation}
                onBack={() => { setSelectedConversation(null); setMobileView("list"); }}
                onOpenDetails={() => setShowDetails(true)}
                onSendMessage={handleSendMessage}
                onAddInternalNote={handleAddInternalNote}
                onResolve={handleResolve}
                onReopen={handleReopen}
              />
            </div>
          )}
        </div>

        {demoMode && (
          <div className="bg-[#F1F5F9] rounded-xl border border-[#D5D9D5] p-3 flex-shrink-0">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-information-line text-[#94A3B8] text-sm"></i></div>
              <p className="text-xs text-[#687068]">{demoDisclaimer.text}</p>
            </div>
          </div>
        )}
      </div>

      {showDetails && selectedConversation && (
        <ConversationDetailsDrawer
          conversation={selectedConversation}
          onClose={() => setShowDetails(false)}
          onAssign={() => {
            setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, conversationStatus: "assigned", assignedTo: "You" } : c));
            showToast("Conversation assigned to you");
          }}
        />
      )}

      {showNewMessage && (
        <NewMessageWizard
          onClose={() => setShowNewMessage(false)}
          onSend={handleNewMessageSend}
        />
      )}

      {replyConversation && (
        <ReplyModal
          conversation={replyConversation}
          onClose={() => setReplyConversation(null)}
          onSend={handleReplyModalSend}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#7A9A7E]"></i>{toast}
        </div>
      )}
    </DashboardShell>
  );
}