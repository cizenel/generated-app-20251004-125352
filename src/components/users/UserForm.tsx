import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { t } from "@/lib/i18n";
import { AuthUser, UserRole } from "@shared/types";
import { useAuthStore } from "@/store/authStore";
const userSchema = z.object({
  username: z.string().min(3, t.usernameMinLengthError),
  password: z.string().optional(),
  role: z.enum(['L1', 'L2', 'L3']),
  isActive: z.boolean(),
}).refine(data => !data.password || data.password.length >= 4, {
  message: t.passwordMinLengthError,
  path: ["password"],
});
export type UserFormValues = z.infer<typeof userSchema>;
interface UserFormProps {
  user?: AuthUser | null;
  onSubmit: (values: UserFormValues) => void;
  isLoading: boolean;
}
export function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
  const currentUser = useAuthStore(state => state.user);
  const isEditing = !!user;
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || "",
      password: "",
      role: user?.role || 'L1',
      isActive: user?.isActive ?? true,
    },
  });
  const isSuperAdminTarget = user?.role === 'L3';
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.username}</FormLabel>
              <FormControl>
                <Input placeholder="kullaniciadi" {...field} disabled={isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.password}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditing ? t.passwordEditPlaceholder : "��•••••••"} {...field} />
              </FormControl>
              <FormDescription>{isEditing ? t.passwordHelpText : ''}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.role}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSuperAdminTarget}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="L1">{t.L1}</SelectItem>
                  <SelectItem value="L2">{t.L2}</SelectItem>
                  {currentUser?.role === 'L3' && <SelectItem value="L3">{t.L3}</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>{t.userStatus}</FormLabel>
                <FormDescription>
                  {field.value ? t.active : t.inactive}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSuperAdminTarget}
                />
              </FormControl>
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