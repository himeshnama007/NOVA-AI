import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaGoogle } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

function Home() {
  const { userData } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const dispatch = useDispatch();

  const login = async (token) => {
    const { data } = await api.post(`/api/auth/login`, { token });
    if (data.user) {
      dispatch(setUserData(data.user));
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);   //google se login krne ke liye firebase ka signInWithPopup use kr rhe he
      const token = await result.user.getIdToken();   //token ko nikalke 
      await login(token);   //login function me bhej rhe he 
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError(error.response?.data?.message || error.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0c0d10] text-zinc-100 overflow-hidden font-sans selection:bg-white/20 selection:text-white">
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-[360px] bg-[#141519] border border-zinc-800 shadow-2xl rounded-2xl p-7 flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold text-lg mb-1 shadow-sm">
                ✦
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Welcome to Nova AI</h2>
              <p className="text-xs text-zinc-400">Sign in to start creating, coding, and exploring.</p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium text-zinc-950 bg-white hover:bg-zinc-200 active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-zinc-950" />
                  Signing in...
                </>
              ) : (
                <>
                  <FaGoogle size={14} className="text-zinc-950" />
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;