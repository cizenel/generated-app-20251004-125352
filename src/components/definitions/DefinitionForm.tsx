import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { t } from "@/lib/i18n";
import { Definition } from "@shared/types";
const definitionSchema = z.object({
  name: z.string().min(2, t.nameMinLengthError),
});
export type DefinitionFormValues = z.infer<typeof definitionSchema>;
interface DefinitionFormProps {
  definition?: Definition | null;
  onSubmit: (values: DefinitionFormValues) => void;
  isLoading: boolean;
  definitionType: string;
}
export function DefinitionForm({ definition, onSubmit, isLoading, definitionType }: DefinitionFormProps) {
  const form = useForm<DefinitionFormValues>({
    resolver: zodResolver(definitionSchema),
    defaultValues: {
      name: definition?.name || "",
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.definitionNameLabel(definitionType)}</FormLabel>
              <FormControl>
                <Input placeholder={`${definitionType}...`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? t.saving : t.save}
        </Button>
      </form>
    </Form>
  );
}