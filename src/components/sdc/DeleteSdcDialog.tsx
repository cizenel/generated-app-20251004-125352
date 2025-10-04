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
import { SdcRecord } from "@shared/types";
interface DeleteSdcDialogProps {
  record: SdcRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
export function DeleteSdcDialog({ record, isOpen, onClose, onConfirm }: DeleteSdcDialogProps) {
  if (!record) return null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteSdcRecordTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteSdcRecordConfirmation(record.patientCode)}
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