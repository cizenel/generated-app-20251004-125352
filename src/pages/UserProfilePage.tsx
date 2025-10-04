import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";
const passwordSchema = z.object({
  currentPassword: z.string().min(1, t.fieldRequired),
  newPassword: z.string().min(4, t.passwordMinLengthError),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;
export function UserProfilePage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });
  const onSubmit = async (values: PasswordFormValues) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await api('/api/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ ...values, userId: user.id }),
      });
      toast.success(t.passwordChangedSuccess);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : t.passwordChangedError;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  if (!user) {
    return null;
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800">{t.profile}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t.profileDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <span className="w-32 font-semibold text-muted-foreground">{t.username}</span>
              <span>{user.username}</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-semibold text-muted-foreground">{t.role}</span>
              <span>{t[user.role]}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.changePassword}</CardTitle>
            <CardDescription>{t.changePasswordDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.currentPassword}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.newPassword}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t.saving : t.save}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}