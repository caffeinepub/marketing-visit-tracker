import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  MapPinned,
  PlusCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsAdmin } from "../hooks/useQueries";

type Page = "dashboard" | "add-visit" | "my-visits" | "clients" | "admin";

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "add-visit" as Page, label: "Add Visit", icon: PlusCircle },
  { id: "my-visits" as Page, label: "My Visits", icon: MapPin },
  { id: "clients" as Page, label: "Clients", icon: Users },
];

export default function Layout({ currentPage, onNavigate, children }: Props) {
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsAdmin();

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const allNavItems = [
    ...navItems,
    ...(isAdmin
      ? [{ id: "admin" as Page, label: "Team", icon: ShieldCheck }]
      : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <MapPinned className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sidebar-foreground text-base tracking-tight">
          Visit Tracker
        </span>
      </div>

      <Separator className="bg-sidebar-border mb-2" />

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id.replace("-", "_")}.link`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="bg-sidebar-border mb-3" />
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {profile?.name ?? "User"}
            </p>
            {isAdmin && <p className="text-xs text-primary truncate">Admin</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-ocid="nav.logout.button"
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent w-7 h-7"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-sidebar flex-col">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-sidebar border-t border-sidebar-border safe-area-pb"
        data-ocid="nav.bottom.panel"
      >
        <div className="flex items-stretch justify-around">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id.replace("-", "_")}.link`}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px] text-xs font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
          {/* Logout on mobile */}
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="nav.logout.button"
            className="flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px] text-xs font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="leading-none">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
