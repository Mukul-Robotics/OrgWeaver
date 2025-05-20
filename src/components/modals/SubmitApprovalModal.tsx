
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Send, AlertCircle } from 'lucide-react';

interface SubmitApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function SubmitApprovalModal({ isOpen, onClose, onSubmit }: SubmitApprovalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5 text-primary" />
            Submit for Approval
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to submit the current organization structure for approval?
            This action cannot be undone through this interface once submitted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-3 bg-accent/10 border border-accent/30 rounded-md text-sm text-accent-foreground flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0 text-accent"/>
            <div>
                <span className="font-semibold">Note:</span> This is a placeholder for a full approval workflow. 
                In a complete system, this submission would be routed to designated approvers. 
                The status of this submission would be tracked and updated accordingly.
            </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSubmit}>
            <Send className="mr-2 h-4 w-4" /> Yes, Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
