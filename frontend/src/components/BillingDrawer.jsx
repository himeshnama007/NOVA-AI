import { AnimatePresence, motion } from "framer-motion";
import { X, Crown, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../features/billing.api";
import { setUserData } from "../redux/user.slice";
import api from "../utils/axios";

export default function BillingDrawer({
  open,
  onClose
}) {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);
  const [upgradingPlan, setUpgradingPlan] = useState(null);

  const handleUpgrade = async (plan) => {
    setUpgradingPlan(plan);
    try {
      const data = await createOrder(plan);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Nova AI",
        description: `${data.plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post(
              "/api/billing/verify-payment",
              response
            );
            if (verifyRes.data?.success) {
              const userRes = await api.get("/api/me");
              if (userRes.data?.user) {
                dispatch(setUserData(userRes.data.user));
              }
              onClose();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
          } finally {
            setUpgradingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setUpgradingPlan(null);
          }
        },
        theme: {
          color: "#18181B"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error creating order:", error);
      setUpgradingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-[390px] bg-[#141519] border-l border-zinc-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-800">
              <div>
                <h2 className="text-zinc-100 text-base font-semibold tracking-tight">
                  Plan & Credits
                </h2>
                <p className="text-zinc-400 text-xs">
                  Manage your subscription
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
              >
                <X size={15} />
              </button>
            </div>

            {/* Current Plan Card */}
            <div className="p-6 pb-4">
              <div className="rounded-xl bg-[#1a1b20] border border-zinc-800 p-4 relative">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-zinc-400 text-[11px] uppercase tracking-wider font-medium">
                      Current Plan
                    </p>
                    <h3 className="text-zinc-100 text-xl font-semibold mt-0.5 capitalize">
                      {userData?.plan ?? "Pro"}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Crown className="text-zinc-300" size={16} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                    <span>Credits remaining</span>
                    <span className="text-zinc-200 font-semibold">{userData?.credits || 0} / {userData?.totalCredits || 0}</span>
                  </div>

                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((userData?.credits || 0) / (userData?.totalCredits || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="px-6 flex-1 overflow-y-auto space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 pt-1">Upgrade Plans</p>

              {/* Starter */}
              <div className="rounded-xl border border-zinc-800 bg-[#17181d] p-4 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-zinc-100 font-medium text-sm">Starter</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">500 monthly credits</p>
                  </div>
                  <span className="text-base font-semibold text-zinc-100">₹199</span>
                </div>

                <button 
                  disabled={upgradingPlan !== null}
                  className="mt-3.5 w-full rounded-lg bg-zinc-800 hover:bg-zinc-700 py-2 text-zinc-200 hover:text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700/60" 
                  onClick={() => handleUpgrade("starter")}
                >
                  {upgradingPlan === "starter" ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      Processing...
                    </>
                  ) : (
                    "Select Starter"
                  )}
                </button>
              </div>

              {/* Pro */}
              <div className="rounded-xl border border-zinc-700 bg-[#1c1d23] p-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-1.5">
                      Pro
                    </h3>
                    <p className="text-zinc-400 text-xs mt-0.5">1,000 monthly credits + priority</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-semibold text-white">₹499</span>
                  </div>
                </div>

                <button 
                  disabled={upgradingPlan !== null}
                  className="mt-3.5 w-full rounded-lg bg-white hover:bg-zinc-200 py-2 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-sm" 
                  onClick={() => handleUpgrade("pro")}
                >
                  {upgradingPlan === "pro" ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-zinc-950" />
                      Processing...
                    </>
                  ) : (
                    "Upgrade to Pro"
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-[#141519]">
              <p className="text-center text-[11px] text-zinc-400">
                Encrypted & secure checkout with Razorpay
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}