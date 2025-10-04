import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { useRef } from "react";
const documentSchema = z.object({
  fileName: z.string().min(1, t.fieldRequired),
  category: z.enum(['Archive', 'Training']),
});
export type DocumentFormValues = z.infer<typeof documentSchema>;
interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => void;
  isLoading: boolean;
}
export function DocumentUploadDialog({ isOpen, onClose, onSubmit, isLoading }: DocumentUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      fileName: "",
    },
  });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("fileName", file.name, { shouldValidate: true });
    }
  };
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.uploadDocument}</DialogTitle>
          <DialogDescription>{t.uploadDocumentDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.category}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCategory} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Archive">{t.archive}</SelectItem>
                      <SelectItem value="Training">{t.training}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fileName}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Dosya adı..." {...field} readOnly />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={triggerFileSelect}>
                      Gözat...
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>{t.cancel}</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t.saving : t.upload}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}