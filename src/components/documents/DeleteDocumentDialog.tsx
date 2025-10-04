import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { Document } from "@shared/types";
interface DeleteDocumentDialogProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
export function DeleteDocumentDialog({ document, isOpen, onClose, onConfirm }: DeleteDocumentDialogProps) {
  if (!document) return null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteDocumentTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteDocumentConfirmation(document.name)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm}>{t.delete}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}