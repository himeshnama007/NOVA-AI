import { Trash2, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { deleteConversation } from "../features/conversation.api";
import { deleteConversationById, setSelectedConversation } from "../redux/conversation.slice";
import { setArtifacts, setMessages } from "../redux/message.slice";

export default function Navbar() {
  const { selectedConversation } = useSelector(state => state.conversation);
  const { messages } = useSelector(state => state.message);
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedConversation?._id || isDeleting) return;
    try {
      setIsDeleting(true);
      const convId = selectedConversation._id;
      await deleteConversation(convId);
      dispatch(deleteConversationById(convId));
      dispatch(setSelectedConversation(null));
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-13 flex items-center justify-between px-5 border-b border-zinc-800/80 bg-[#0c0d10]">

      {/* Left — chat title */}
      <div className="flex items-center gap-2.5">
        <h2 className="text-[13.5px] font-medium text-zinc-200 tracking-tight">
          {selectedConversation?.title || "Nova AI"}
        </h2>
        {messages.length > 0 && (
          <span className="text-[11px] font-medium text-zinc-400">
            • {messages.length} messages
          </span>
        )}
      </div>

      {/* Right — actions & subtle brand mark */}
      <div className="flex items-center gap-3">
        {selectedConversation && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete this conversation"
            className="flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md border border-transparent hover:border-red-500/20 transition-all cursor-pointer bg-transparent"
          >
            {isDeleting ? <Loader2 size={13} className="animate-spin text-red-400" /> : <Trash2 size={13} />}
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
        <span className="text-[11px] font-medium text-zinc-400">
          Nova
        </span>
      </div>

    </div>
  );
}