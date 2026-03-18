import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Loader2, MapPin, Route, Users } from "lucide-react";
import { motion } from "motion/react";
import {
  useGetCallerUserProfile,
  useGetClients,
  useGetMyVisits,
} from "../hooks/useQueries";
import {
  calculateTotalDistance,
  formatDistance,
  visitDateToDate,
} from "../utils/distance";

export default function DashboardPage() {
  const { data: visits = [], isLoading: visitsLoading } = useGetMyVisits();
  const { data: clients = [], isLoading: clientsLoading } = useGetClients();
  const { data: profile } = useGetCallerUserProfile();

  const sorted = [...visits].sort((a, b) => Number(b.visitDate - a.visitDate));
  const totalDistance = calculateTotalDistance(visits);

  const stats = [
    {
      label: "Total Visits",
      value: visits.length,
      icon: MapPin,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Clients",
      value: clients.length,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Distance Traveled",
      value: formatDistance(totalDistance),
      icon: Route,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const isLoading = visitsLoading || clientsLoading;

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          👋
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here's your visit summary
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="shadow-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-0.5">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Visits */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Recent Visits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="dashboard.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="dashboard.empty_state"
            >
              <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No visits yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Add your first visit to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sorted.slice(0, 8).map((visit, i) => {
                const date = visitDateToDate(visit.visitDate);
                return (
                  <motion.div
                    key={visit.id.toString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`dashboard.item.${i + 1}`}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {visit.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {visit.locationName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
