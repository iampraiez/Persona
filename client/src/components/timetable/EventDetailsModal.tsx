import React, { useState } from "react";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, Target, Loader2, RotateCcw, Copy, Trash2, Check, Circle } from "lucide-react";
import Modal from "../ui/Modal";
import { Event } from "../../types";
import { useNavigate } from "react-router-dom";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onMarkAsCompleted: () => void;
  onSkipEvent: (data: { skippedReason: string; skippedIsImportant: boolean }) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdate: (id: string, data: Partial<Event>) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onMarkAsCompleted,
  onSkipEvent,
  onDelete,
  onDuplicate,
  onUpdate,
  isUpdating,
  isDeleting,
}) => {
  const navigate = useNavigate();
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  if (!event) return null;

  const handleSkipSubmit = () => {
    onSkipEvent({ skippedReason: skipReason, skippedIsImportant: isImportant });
    setShowSkipForm(false);
    setSkipReason("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Details">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{event.title}</h3>
          {event.description && (
            <p className="mt-2 text-foreground/80 leading-relaxed text-sm">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex items-center text-sm text-foreground/60 bg-secondary/30 p-2 rounded-md">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
          </span>
        </div>

        <div className="border-t border-border pt-6 space-y-6">
          {(event.isCompleted || event.skippedReason) && (
            <div
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${
                event.isCompleted 
                  ? "bg-success/5 border-success/20 text-success" 
                  : "bg-warning/5 border-warning/20 text-warning"
              }`}
            >
              {event.isCompleted ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm font-bold uppercase tracking-wider">
                {event.isCompleted ? "Completed" : "Skipped"}
              </span>
            </div>
          )}

          {!event.isCompleted && !event.skippedReason && (
            <button
              onClick={() => navigate(`/focus/${event.id}`)}
              className="w-full btn btn-accent flex items-center justify-center gap-2 py-4 shadow-lg shadow-accent/20 transition-all active:scale-[0.98] group"
            >
              <Target className="h-5 w-5 animate-pulse" />
              <span className="text-base font-bold uppercase tracking-widest">
                Start Focus Session
              </span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => {
                if (event.isCompleted || event.skippedReason) {
                  onUpdate(event.id, { isCompleted: false, skippedReason: undefined });
                } else {
                  onMarkAsCompleted();
                }
              }}
              disabled={isUpdating}
              className={`btn flex items-center justify-center gap-2 py-3 border transition-all active:scale-[0.97] ${
                event.isCompleted
                  ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/15"
                  : "bg-success/10 text-success border-success/20 hover:bg-success/15"
              }`}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : event.isCompleted ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              <span className="text-sm font-bold">{event.isCompleted ? "Reset" : "Complete"}</span>
            </button>

            <button
              onClick={() => {
                if (event.skippedReason) {
                  onUpdate(event.id, { isCompleted: false, skippedReason: undefined });
                } else {
                  setShowSkipForm(!showSkipForm);
                }
              }}
              disabled={isUpdating}
              className={`btn flex items-center justify-center gap-2 py-3 border transition-all active:scale-[0.97] ${
                event.skippedReason
                  ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/15"
                  : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/15"
              }`}
            >
              {event.skippedReason ? <RotateCcw className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              <span className="text-sm font-bold">{event.skippedReason ? "Reset" : "Skip"}</span>
            </button>

            <button
              onClick={onDuplicate}
              className="btn bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center gap-2 py-3 border border-border/50 transition-all active:scale-[0.97]"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm font-bold">Duplicate</span>
            </button>

            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="btn bg-destructive/10 text-destructive hover:bg-destructive/15 flex items-center justify-center gap-2 py-3 border border-destructive/20 transition-all active:scale-[0.97]"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="text-sm font-bold">Delete</span>
            </button>
          </div>
        </div>

        {showSkipForm && (
          <div className="space-y-4 pt-4 border-t border-border animate-slide-up">
            <textarea
              className="input w-full h-24"
              placeholder="Reason for skipping (optional)"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            />
            <div className="flex justify-center">
              <button
                onClick={() => setIsImportant(!isImportant)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition duration-200 
                  ${isImportant ? "bg-warning text-white border-warning" : "border-warning text-warning hover:bg-warning/10"}`}
              >
                {isImportant ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                {isImportant ? "Important" : "Mark as Important"}
              </button>
            </div>
            <button
              onClick={handleSkipSubmit}
              disabled={isUpdating}
              className="w-full btn bg-warning/20 text-warning hover:bg-warning/30 flex items-center justify-center gap-2"
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Skip
            </button>
          </div>
        )}

        {event.skippedReason && !showSkipForm && (
          <div className="bg-warning/10 p-4 rounded-xl border border-warning/20 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-warning mb-2 opacity-70">Skipped Reason</h4>
            <p className="text-sm leading-relaxed">{event.skippedReason}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs opacity-60">High Priority?</span>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${event.skippedIsImportant ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                {event.skippedIsImportant ? "Yes" : "No"}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventDetailsModal;
