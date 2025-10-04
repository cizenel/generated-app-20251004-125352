import { useAuthStore } from '@/store/authStore';
import { t } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Menu, Home, Book, FileText, Folder } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
const navItems = [
  { to: '/', label: t.dashboard, icon: Home },
  { to: '/users', label: t.userManagement, icon: UserIcon },
  { to: '/definitions/Sponsor', label: t.definitions, icon: Book },
  { to: '/sdc-tracking', label: t.sdcTracking, icon: FileText },
  { to: '/documents', label: t.documents, icon: Folder },
];
export function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') return t.dashboard;
    if (currentPath.startsWith('/users')) return t.userManagement;
    if (currentPath.startsWith('/sdc-tracking')) return t.sdcTracking;
    if (currentPath.startsWith('/documents')) return t.documents;
    if (currentPath.startsWith('/profile')) return t.profile;
    if (currentPath.startsWith('/definitions/')) {
      const type = currentPath.split('/')[2];
      if (type && Object.prototype.hasOwnProperty.call(t, type)) {
        const key = type as keyof typeof t;
        const title = t[key];
        if (typeof title === 'string') {
          return title;
        }
        return t.definitions;
      }
    }
    return t.dashboard;
  };
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  return (
    <header className="flex items-center justify-between h-20 px-6 md:px-8 bg-background border-b">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-[#0A2540] text-white border-r-0">
            <div className="flex items-center justify-center h-20 border-b border-white/10">
              <h1 className="text-2xl font-bold">MLS ProTrack</h1>
            </div>
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-white/10",
                      isActive ? "bg-white/20 font-semibold" : "font-medium"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.username}`} alt={user?.username} />
              <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.role ? t[user.role] : ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <NavLink to="/profile">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t.profile}</span>
            </DropdownMenuItem>
          </NavLink>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}