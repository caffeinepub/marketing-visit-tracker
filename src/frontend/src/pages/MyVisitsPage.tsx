import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, MapPin, Phone, Route } from "lucide-react";
import { motion } from "motion/react";
import type { Visit } from "../backend.d";
import { useGetMyVisits } from "../hooks/useQueries";
import {
  formatDistance,
  haversineDistance,
  visitDateToDate,
} from "../utils/distance";

function VisitCard({
  visit,
  distFromPrev,
  index,
}: { visit: Visit; distFromPrev: number | null; index: number }) {
  const date = visitDateToDate(visit.visitDate);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`my_visits.item.${index + 1}`}
    >
      <Card className="shadow-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {visit.clientName}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {visit.locationName}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {visit.contactNumber}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {date.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {distFromPrev !== null && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Route className="w-3 h-3" />
                      {formatDistance(distFromPrev)} from prev
                    </span>
                  )}
                </div>
                {visit.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                    {visit.notes}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {date.toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyVisitsPage() {
  const { data: visits = [], isLoading } = useGetMyVisits();

  const sorted = [...visits].sort((a, b) => Number(a.visitDate - b.visitDate));
  let totalDist = 0;

  return (
    <div className="space-y-6" data-ocid="my_visits.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Visits</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {visits.length} visit{visits.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="my_visits.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20" data-ocid="my_visits.empty_state">
          <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No visits recorded yet
          </p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Use "Add Visit" to log your first field visit
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((visit, i) => {
            let dist: number | null = null;
            if (i > 0) {
              const prev = sorted[i - 1];
              dist = haversineDistance(
                prev.latitude,
                prev.longitude,
                visit.latitude,
                visit.longitude,
              );
              totalDist += dist;
            }
            return (
              <VisitCard
                key={visit.id.toString()}
                visit={visit}
                distFromPrev={dist}
                index={i}
              />
            );
          })}
          {sorted.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Route className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Total Distance Traveled
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatDistance(totalDist)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
