import React, { useRef, useEffect } from "react";
import { RotateCcw, Pencil, Trash, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GoalOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const GoalOptionsMenu: React.FC<GoalOptionsMenuProps> = ({
  isOpen,
  onClose,
  onReset,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-xl z-50 border border-border overflow-hidden"
          >
            <div className="p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                disabled={isUpdating}
                className="w-full text-left flex items-center px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Reset Goal
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-full text-left flex items-center px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Goal
              </button>
              <div className="h-px bg-border my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                className="w-full text-left flex items-center px-3 py-2 text-sm text-destructive hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                Delete Goal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalOptionsMenu;
