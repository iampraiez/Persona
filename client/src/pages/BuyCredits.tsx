import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

const IconWrapper = ({ children, className = "h-6 w-6" }: { children: React.ReactNode, className?: string }) => (
  <svg viewBox="0 0 256 256" className={className} fill="currentColor">
    {children}
  </svg>
);

type UnknownObject = {
  [key: string]: unknown;
};


const Icons = {
  Sparkles: (props: UnknownObject) => (
    <IconWrapper {...props}>
      <path d="M213.66,122.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32l32-32A8,8,0,0,1,213.66,122.34ZM117.66,34.34a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,117.66,34.34Zm-32,152a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,85.66,186.34Zm136-112a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,189.66,117.66l32-32A8,8,0,0,0,221.66,74.34Zm-160,8a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,61.66,82.34ZM152,24a8,8,0,0,0-8,8V64a8,8,0,0,0,16,0V32A8,8,0,0,0,152,24Zm0,168a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V200A8,8,0,0,0,152,192Zm-64-64a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V136A8,8,0,0,0,88,128Zm128,0a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V136A8,8,0,0,0,216,128Z" />
    </IconWrapper>
  ),
  Zap: (props: UnknownObject) => (
    <IconWrapper {...props}>
      <path d="M215.79,118.17a8,8,0,0,0-7.79-6.17H152L176,32a8,8,0,0,0-13.56-6.84l-120,136a8,8,0,0,0,6,13.34h56L80,224a8,8,0,0,0,13.56,6.84l120-136A8,8,0,0,0,215.79,118.17ZM109.83,190.49l15-56.49H76.17L146.17,65.51l-15,56.49h48.66Z" />
    </IconWrapper>
  ),
  CreditCard: (props: UnknownObject) => (
    <IconWrapper {...props}>
      <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64ZM32,192V104H224v88Z" />
    </IconWrapper>
  ),
  Check: (props: UnknownObject) => (
    <IconWrapper {...props}>
      <path d="M104,192a8.5,8.5,0,0,1-5.66-2.34l-56-56a8,8,0,0,1,11.32-11.32L104,172.69l98.34-98.35a8,8,0,0,1,11.32,11.32l-104,104A8.5,8.5,0,0,1,104,192Z" />
    </IconWrapper>
  ),
  ArrowLeft: (props: UnknownObject) => (
    <IconWrapper {...props}>
      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
    </IconWrapper>
  ),
  Spinner: (props: UnknownObject) => (
    <IconWrapper {...props} className={`${props.className} animate-spin`}>
      <path
        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"
        opacity="0.2"
      />
      <path d="M232,128a104,104,0,0,1-104,104" />
    </IconWrapper>
  ),
  Info: (props: UnknownObject) => (
    <IconWrapper {...props}>
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v32A8,8,0,0,1,144,176Zm-12-72a12,12,0,1,1,12-12A12,12,0,0,1,132,104Z" />
    </IconWrapper>
  ),
};

const PLANS = [
  { 
    id: "1_credit", 
    name: "Starter Pack", 
    credits: 1, 
    price: 100, 
    description: "Perfect for a quick AI boost",
    icon: Icons.Sparkles,
    color: "from-blue-500/20 to-indigo-500/20",
    accent: "text-blue-400"
  },
  { 
    id: "8_credits", 
    name: "Power User", 
    credits: 8, 
    price: 500, 
    description: "Best value for consistent power",
    icon: Icons.Zap,
    color: "from-purple-500/20 to-pink-500/20",
    accent: "text-purple-400"
  },
];

const BuyCredits = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { isDemo } = useAuthStore();

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => (isDemo ? demoApi : api).getUser(),
  });

  useEffect(() => {
    setLoadingPlanId(null);
    setIsVerifying(false);

    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (reference && !isDemo) {
      handleVerify(reference);
    }
  }, [searchParams, isDemo]);

  const handleVerify = async (reference: string) => {
    setIsVerifying(true);
    navigate("/buy-credits", { replace: true });
    
    try {
      const response = await api.verifyPayment(reference);
      const { status, message } = response;

      console.log("Payment verification response:", response);
      if (status === "success") {
        toast.success(message || "Credits added successfully!");
        refetchUser();
      } else if (status === "abandoned") {
        toast.info(message || "Payment was cancelled.");
      } else {
        toast.error(message || "Payment failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify payment status.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBuy = async (planId: string) => {
    if (isDemo) {
      toast.info("Purchases are disabled in Demo Mode");
      return;
    }
    setLoadingPlanId(planId);
    try {
      const { authorization_url } = await api.initializePayment(planId);
      window.location.href = authorization_url;
    } catch {
      toast.error("Failed to start payment process");
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-8 px-4 md:px-8 relative overflow-hidden flex flex-col items-start">
      {/* Muted Background Effects */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

      <div className="w-full max-w-5xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-all mb-10 group"
        >
          <Icons.ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Expand Your <span className="text-primary italic">Persona</span></h1>
          <p className="text-lg text-foreground/50 max-w-2xl leading-relaxed">
            Reserve credits are your fuel for AI features. They only kick in after your daily allowance is exhausted and never expire.
          </p>
        </header>

        {/* Balance Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icons.Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider mb-0.5">Daily Energy</p>
                <p className="text-xl font-bold">{user?.aiCredits} <span className="text-sm font-normal text-foreground/30">/ 3</span></p>
              </div>
            </div>
            <div className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold text-primary tracking-widest uppercase">
              Free Daily
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Icons.Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider mb-0.5">Reserve Credits</p>
                <p className="text-xl font-bold">{user?.purchasedAiCredits || 0} <span className="text-sm font-normal text-foreground/30">Premium</span></p>
              </div>
            </div>
            <div className="px-3 py-1 bg-accent/5 border border-accent/10 rounded-full text-[10px] font-bold text-accent tracking-widest uppercase">
              Paid Reserve
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 relative">
          <AnimatePresence>
            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/60 backdrop-blur-xl z-20 flex flex-col items-center justify-center rounded-3xl border border-border/50"
              >
                <Icons.Spinner className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-1">Verifying Secure Payment</h3>
                <p className="text-foreground/50 text-sm">Processing your transaction with Paystack...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {PLANS.map((plan) => {
            const PlanIcon = plan.icon;
            const isLoading = loadingPlanId === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className="group relative bg-card/40 backdrop-blur-sm border border-border/60 hover:border-primary/30 transition-all rounded-3xl p-8 flex flex-col shadow-sm"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${plan.color} ${plan.accent}`}>
                    <PlanIcon className="h-8 w-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(plan.price)}
                    </p>
                    <p className="text-xs text-foreground/30 font-bold uppercase tracking-widest">One-time payment</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {plan.name}
                    <span className="text-sm font-normal text-foreground/40 bg-secondary/50 px-2 py-0.5 rounded-md">
                      {plan.credits} Credits
                    </span>
                  </h3>
                  <p className="text-foreground/50 text-sm">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 p-1 rounded-full text-success">
                      <Icons.Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">Premium AI functionality</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 p-1 rounded-full text-success">
                      <Icons.Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">Credits never expire</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(plan.id)}
                  disabled={!!loadingPlanId || isVerifying}
                  className={`mt-auto w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                    plan.id === '8_credits' 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10' 
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Icons.Spinner className="h-5 w-5" />
                  ) : (
                    <>
                      <Icons.CreditCard className="h-5 w-5 opacity-70" />
                      Purchase Pack
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Security Info */}
        <div className="mt-12 p-6 bg-card/20 backdrop-blur-sm rounded-2xl border border-border/40 flex items-start gap-4">
          <Icons.Info className="h-5 w-5 text-foreground/30 shrink-0" />
          <div className="text-xs text-foreground/40 leading-relaxed">
            <span className="font-bold text-foreground/60 mr-1 italic">Security Note:</span>
            Your transaction is secured by Paystack. We do not store or process your card information on our servers. Credits are typically fulfilled within seconds of a successful charge.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;
