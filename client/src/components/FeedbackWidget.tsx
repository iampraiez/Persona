import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSending(false);
    setMessage("");
    setIsOpen(false);
    toast.success("Thanks for your feedback! We'll look into it.");
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary/90 hover:bg-primary text-primary-foreground p-3 rounded-full shadow-lg backdrop-blur-sm transition-colors border border-primary/20"
        title="Send Feedback"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-24 right-6 w-[90vw] max-w-sm bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 bg-primary/5 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Send Feedback
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 opacity-50" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">
                        Your Thoughts
                    </label>
                    <textarea 
                        className="w-full min-h-[120px] bg-secondary/30 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="Found a bug? Have a feature request? Let us know!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Send Message
                        </>
                    )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackWidget;
