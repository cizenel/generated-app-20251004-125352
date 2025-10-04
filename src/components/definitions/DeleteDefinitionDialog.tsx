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
import { Definition } from "@shared/types";
interface DeleteDefinitionDialogProps {
  definition: Definition | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  definitionType: string;
}
export function DeleteDefinitionDialog({ definition, isOpen, onClose, onConfirm, definitionType }: DeleteDefinitionDialogProps) {
  if (!definition) return null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteDefinitionTitle(definitionType)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteDefinitionConfirmation(definitionType, definition.name)}
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