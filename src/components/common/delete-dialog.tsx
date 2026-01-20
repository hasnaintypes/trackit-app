"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
}

export function DeleteDialog({
  trigger,
  open,
  onOpenChange,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this item.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  successMessage = "Item deleted successfully",
  errorMessage = "Something went wrong. Please try again.",
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();

    setIsDeleting(true);

    try {
      await onConfirm();
      toast.success(successMessage);
      setOpen(false);
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
