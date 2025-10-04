import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api-client";
import { Users, FileText, Book } from "lucide-react";
interface AppStats {
  totalUsers: number;
  sdcRecords: number;
  definitionItems: number;
}
export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await api<AppStats>('/api/stats');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats({ totalUsers: 0, sdcRecords: 0, definitionItems: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);
  const statCards = [
    { title: t.totalUsers, value: stats?.totalUsers, icon: Users, color: "text-blue-500" },
    { title: t.sdcRecords, value: stats?.sdcRecords, icon: FileText, color: "text-green-500" },
    { title: t.definitionItems, value: stats?.definitionItems, icon: Book, color: "text-purple-500" },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-800">
          {user ? t.welcomeMessage(user.username) : t.dashboard}
        </h1>
        <p className="text-muted-foreground">
          Uygulama verilerinize hızlı bir genel bakış.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <footer className="pt-8 text-center text-muted-foreground/80">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
    </div>
  );
}