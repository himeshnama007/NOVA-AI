import { useEffect, useState } from "react";
import { Plus, MessageSquare, Settings, LogOut, User, PenSquare, Menu, X, Coins, ConeIcon, CoinsIcon, Trash2, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { createConversation, getConversations, deleteConversation } from "../features/conversation.api";
import { addConversation, setConversations, setSelectedConversation, deleteConversationById } from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import BillingDrawer from "./BillingDrawer";

export default function Sidebar() {
  const [hovered, setHovered]     = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { userData } = useSelector(state => state.user);
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();
  const [showBilling, setShowBilling] =useState(false);
  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    setMobileOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
    dispatch(setArtifacts(messages.artifacts));
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (deletingId) return;
    try {
      setDeletingId(conversationId);
      await deleteConversation(conversationId);
      dispatch(deleteConversationById(conversationId));
      if (selectedConversation?._id === conversationId) {
        dispatch(setSelectedConversation(null));
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const PanelIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );

  /* ── Collapsed rail — desktop only ── */
  const CollapsedRail = () => (
    <div className="hidden lg:flex flex-col items-center w-[58px] h-screen bg-[#0e0f12] border-r border-zinc-800/80 py-3.5 gap-2 shrink-0">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors bg-transparent border-none cursor-pointer mb-1"
      >
        <PanelIcon />
      </button>

      <button
        onClick={handleCreateConversation}
        title="New Chat"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-950 bg-white hover:bg-zinc-200 transition-colors border-none cursor-pointer shadow-sm"
      >
        <Plus size={16} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto w-full px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-2">
        {conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              title={chat.title}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors border-none cursor-pointer
                ${isActive ? "bg-zinc-800 text-zinc-100 font-medium" : "bg-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
            >
              <MessageSquare size={14} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        {userData && (
          <div className="relative cursor-pointer" onClick={() => setShowBilling(true)}>
            {userData.avatar
              ? <img src={userData.avatar} alt={userData.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-700" />
              : <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><User size={14} className="text-zinc-400" /></div>
            }
          </div>
        )}
      </div>
    </div>
  );

  /* ── Full sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0e0f12]">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-zinc-800/80">
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors bg-transparent border-none cursor-pointer"
        >
          <PanelIcon />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors bg-transparent border-none cursor-pointer"
        >
          <X size={15} />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-white text-zinc-950 flex items-center justify-center text-[12px] font-bold shadow-sm">
            ✦
          </div>
          <span className="text-[14px] font-semibold text-zinc-100 tracking-tight">Nova AI</span>
        </div>

        <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
          {userData?.plan ?? "pro"}
        </span>

        <button
          onClick={handleCreateConversation}
          title="New Chat"
          className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors bg-transparent border-none cursor-pointer"
        >
          <PenSquare size={14} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-zinc-950 bg-white hover:bg-zinc-200 active:scale-[0.99] rounded-lg py-2 border-none cursor-pointer transition-colors shadow-sm"
        >
          <Plus size={15} />
          New conversation
        </button>
      </div>

      {/* Section label */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] font-medium text-zinc-400">
        <span>{conversations.length === 0 ? "No chats yet" : "Chats"}</span>
        {conversations.length > 0 && <span className="text-[10px] text-zinc-400">{conversations.length}</span>}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-0.5">
        {conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          const isHov    = hovered === chat._id;
          const isDeleting = deletingId === chat._id;
          return (
            <div
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              onMouseEnter={() => setHovered(chat._id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative flex items-center gap-2.5 cursor-pointer px-2.5 py-2 rounded-lg transition-colors
                ${isActive 
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : isHov 
                  ? "bg-zinc-850/80 text-zinc-200 bg-white/[0.04]"
                  : "bg-transparent text-zinc-400"}`}
            >
              <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded text-zinc-400">
                <MessageSquare size={13} />
              </div>
              <p className={`text-[13px] truncate flex-1 ${isActive ? "text-zinc-100" : "text-zinc-300"}`}>
                {chat.title}
              </p>
              <button
                onClick={(e) => handleDeleteConversation(e, chat._id)}
                disabled={isDeleting}
                title="Delete chat"
                className={`p-1 rounded-md transition-all duration-150 border-none cursor-pointer flex items-center justify-center shrink-0
                  ${isDeleting 
                    ? "text-red-400 opacity-100 bg-red-500/10" 
                    : "text-zinc-500 hover:text-red-400 hover:bg-zinc-700/60 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  }`}
              >
                {isDeleting ? (
                  <Loader2 size={13} className="animate-spin text-red-400" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-zinc-800/80" />

      {/* Footer */}
      <div className="p-2.5 bg-[#0e0f12]">
        {userData ? (
          <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-zinc-800/50 transition-colors">
            <div className="relative shrink-0">
              {!userData?.avatar || imageError ? (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <User size={14} className="text-zinc-400" />
                </div>
              ) : (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-8 h-8 rounded-lg object-cover border border-zinc-700/80"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-zinc-100 truncate">{userData.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-zinc-400">
                  {userData?.credits ?? 0} credits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowBilling(true)}
                title="Manage Plan & Credits"
                className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-zinc-800 text-zinc-300 cursor-pointer hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <CoinsIcon size={13} />
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-zinc-400 cursor-pointer hover:bg-zinc-800 hover:text-red-400 transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-1">
            <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg py-2 cursor-pointer transition-colors border border-zinc-700/60">
              Sign in
            </button>
          </div>
        )}
      </div>

    </div>
  );

  if (collapsed) return <CollapsedRail />;

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
      >
        <Menu size={16} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* ── Sidebar panel ── */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        bg-[#0d0f14] border-r border-white/[0.06]
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <SidebarContent />
      </div>

<BillingDrawer

    open={showBilling}

    onClose={()=>
        setShowBilling(false)
    }

/>
    </>
  );
}