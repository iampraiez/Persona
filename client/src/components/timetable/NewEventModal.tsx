import React from "react";
import Modal from "../ui/Modal";
import { Loader2 } from "lucide-react";

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newEvent: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    notifyBefore: number;
  };
  setNewEvent: (event: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    notifyBefore: number;
  }) => void;
  isCreating: boolean;
}

const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newEvent,
  setNewEvent,
  isCreating,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Event">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="input w-full"
            placeholder="Event title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            className="input w-full h-24"
            placeholder="Event description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              className="input w-full"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              className="input w-full"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notify Before (minutes)</label>
          <input
            type="number"
            className="input w-full"
            placeholder="15"
            min="0"
            value={newEvent.notifyBefore}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                notifyBefore: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            className="btn bg-secondary hover:bg-secondary/90"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-accent flex items-center gap-2"
            disabled={isCreating}
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCreating ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewEventModal;
