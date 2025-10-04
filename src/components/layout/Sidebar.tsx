import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Book, FileText, Folder, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}
const definitionNavItems = [
  { to: '/definitions/Sponsor', label: t.Sponsor },
  { to: '/definitions/Center', label: t.Center },
  { to: '/definitions/Investigator', label: t.Investigator },
  { to: '/definitions/ProjectCode', label: t.ProjectCode },
  { to: '/definitions/WorkDone', label: t.WorkDone },
];
const bottomNavItems = [
  { to: '/sdc-tracking', label: t.sdcTracking, icon: FileText },
  { to: '/documents', label: t.documents, icon: Folder },
];
export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const isDefinitionsPathActive = location.pathname.startsWith('/definitions');
  const [isDefinitionsOpen, setIsDefinitionsOpen] = useState(isDefinitionsPathActive);
  useEffect(() => {
    if (isDefinitionsPathActive) {
      setIsDefinitionsOpen(true);
    }
  }, [isDefinitionsPathActive, location.pathname]);
  const navItems = [
    { to: '/', label: t.dashboard, icon: Home, show: true },
    { to: '/users', label: t.userManagement, icon: Users, show: user?.role !== 'L1' },
  ];
  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col h-screen bg-[#0A2540] text-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex items-center justify-center h-20 border-b border-white/10", isCollapsed ? "px-2" : "px-6")}>
        <h1 className={cn("text-2xl font-bold transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
          MLS ProTrack
        </h1>
        <h1 className={cn("text-2xl font-bold transition-opacity duration-300", isCollapsed ? "opacity-100" : "opacity-0 w-0")}>
          MLS
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          item.show && (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-white/10",
                  isActive ? "bg-white/20 font-semibold" : "font-medium",
                  isCollapsed && "justify-center"
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn("transition-opacity", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>{item.label}</span>
            </NavLink>
          )
        ))}
        <Collapsible open={isDefinitionsOpen} onOpenChange={setIsDefinitionsOpen}>
          <CollapsibleTrigger className={cn("flex items-center w-full gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-white/10", isDefinitionsPathActive ? "bg-white/20 font-semibold" : "font-medium", isCollapsed && "justify-center")} disabled={isCollapsed}>
            <Book className="h-5 w-5 flex-shrink-0" />
            <span className={cn("transition-opacity", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>{t.definitions}</span>
            {!isCollapsed && <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", isDefinitionsOpen && "rotate-180")} />}
          </CollapsibleTrigger>
          <CollapsibleContent className={cn("pl-8 space-y-1 py-1", isCollapsed && "hidden")}>
            {definitionNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "block p-2 rounded-md text-sm hover:bg-white/10",
                    isActive ? "bg-white/20" : ""
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </CollapsibleContent>
        </Collapsible>
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-white/10",
                isActive ? "bg-white/20 font-semibold" : "font-medium",
                isCollapsed && "justify-center"
              )
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className={cn("transition-opacity", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="w-full text-white hover:bg-white/10 hover:text-white"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </Button>
      </div>
    </aside>
  );
}