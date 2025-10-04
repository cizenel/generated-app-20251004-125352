import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { SdcRecord } from "@shared/types";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useDefinitionStore } from "@/store/definitionStore";
const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
const workDoneSchema = z.object({
  id: z.string().optional(),
  workType: z.string().min(1, t.fieldRequired),
  startTime: z.string().regex(timeRegex, t.invalidTimeFormat),
  endTime: z.string().regex(timeRegex, t.invalidTimeFormat),
  description: z.string().optional(),
}).refine(data => data.startTime < data.endTime, {
  message: t.endTimeAfterStartTime,
  path: ["endTime"],
});
const sdcSchema = z.object({
  date: z.date(),
  sponsorId: z.string().min(1, t.fieldRequired),
  centerId: z.string().min(1, t.fieldRequired),
  investigatorId: z.string().min(1, t.fieldRequired),
  projectCodeId: z.string().min(1, t.fieldRequired),
  patientCode: z.string().min(1, t.fieldRequired),
  workDone: z.array(workDoneSchema).min(1, "En az bir yapılan iş eklenmelidir."),
});
type SdcFormValuesInternal = z.infer<typeof sdcSchema>;
export type SdcFormValues = Omit<SdcFormValuesInternal, 'date'> & { date: string };
interface SdcFormProps {
  record?: SdcRecord | null;
  onSubmit: (values: SdcFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}
export function SdcForm({ record, onSubmit, onCancel, isLoading }: SdcFormProps) {
  const { definitions, fetchDefinitions } = useDefinitionStore();
  useEffect(() => {
    fetchDefinitions('Sponsor');
    fetchDefinitions('Center');
    fetchDefinitions('Investigator');
    fetchDefinitions('ProjectCode');
    fetchDefinitions('WorkDone');
  }, [fetchDefinitions]);
  const form = useForm<SdcFormValuesInternal>({
    resolver: zodResolver(sdcSchema),
    defaultValues: {
      date: record ? parseISO(record.date) : new Date(),
      sponsorId: record?.sponsorId || "",
      centerId: record?.centerId || "",
      investigatorId: record?.investigatorId || "",
      projectCodeId: record?.projectCodeId || "",
      patientCode: record?.patientCode || "",
      workDone: record?.workDone || [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workDone",
  });
  const handleFormSubmit = (values: SdcFormValuesInternal) => {
    onSubmit({
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
    });
  };
  const definitionOptions = (type: 'Sponsor' | 'Center' | 'Investigator' | 'ProjectCode' | 'WorkDone') =>
    definitions[type].map(def => <SelectItem key={def.id} value={def.id}>{def.name}</SelectItem>);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t.date}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="patientCode" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.patientCode}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField control={form.control} name="sponsorId" render={({ field }) => (
            <FormItem><FormLabel>{t.Sponsor}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{definitionOptions('Sponsor')}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="centerId" render={({ field }) => (
            <FormItem><FormLabel>{t.Center}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{definitionOptions('Center')}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="investigatorId" render={({ field }) => (
            <FormItem><FormLabel>{t.Investigator}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{definitionOptions('Investigator')}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="projectCodeId" render={({ field }) => (
            <FormItem><FormLabel>{t.ProjectCode}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{definitionOptions('ProjectCode')}</SelectContent></Select><FormMessage /></FormItem>
          )} />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t.workDoneList}</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 p-3 border rounded-md items-start">
              <FormField control={form.control} name={`workDone.${index}.workType`} render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-3"><FormLabel>{t.workType}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{definitionOptions('WorkDone')}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`workDone.${index}.startTime`} render={({ field }) => (
                <FormItem className="col-span-6 md:col-span-2"><FormLabel>{t.startTime}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`workDone.${index}.endTime`} render={({ field }) => (
                <FormItem className="col-span-6 md:col-span-2"><FormLabel>{t.endTime}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`workDone.${index}.description`} render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-4"><FormLabel>{t.description}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="col-span-12 md:col-span-1 flex items-end h-full">
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="w-full"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => append({ workType: '', startTime: '', endTime: '', description: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" />{t.addWorkDone}
          </Button>
          {form.formState.errors.workDone && !form.formState.errors.workDone.root && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.workDone.message}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>{t.cancel}</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? t.saving : t.save}</Button>
        </div>
      </form>
    </Form>
  );
}