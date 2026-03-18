import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MapPin, ShieldCheck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Visit } from "../backend.d";
import { useGetAllVisits } from "../hooks/useQueries";
import {
  calculateTotalDistance,
  formatDistance,
  visitDateToDate,
} from "../utils/distance";

export default function AdminPage() {
  const { data: allVisits = [], isLoading } = useGetAllVisits();
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const userMap = new Map<string, Visit[]>();
  for (const visit of allVisits) {
    const uid = visit.user.toString();
    if (!userMap.has(uid)) userMap.set(uid, []);
    userMap.get(uid)!.push(visit);
  }

  const userIds = Array.from(userMap.keys());
  const displayedVisits =
    selectedUser === "all" ? allVisits : (userMap.get(selectedUser) ?? []);
  const sortedDisplay = [...displayedVisits].sort((a, b) =>
    Number(b.visitDate - a.visitDate),
  );

  return (
    <div className="space-y-6" data-ocid="admin.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Team Visits
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Admin view — all team member visits
        </p>
      </div>

      {!isLoading && userIds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {userIds.map((uid, i) => {
            const visits = userMap.get(uid) ?? [];
            const dist = calculateTotalDistance(visits);
            const shortId = `${uid.slice(0, 8)}...`;
            return (
              <motion.div
                key={uid}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                data-ocid={`admin.item.${i + 1}`}
              >
                <Card
                  className={`shadow-card border-border cursor-pointer transition-all ${
                    selectedUser === uid
                      ? "ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() =>
                    setSelectedUser(selectedUser === uid ? "all" : uid)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {shortId}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {visits.length} visits
                          </Badge>
                          <span className="text-xs text-primary font-medium">
                            {formatDistance(dist)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-56" data-ocid="admin.user_filter.select">
            <SelectValue placeholder="Filter by team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {userIds.map((uid) => (
              <SelectItem key={uid} value={uid}>
                {`${uid.slice(0, 16)}...`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {sortedDisplay.length} visit{sortedDisplay.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sortedDisplay.length === 0 ? (
        <div className="text-center py-20" data-ocid="admin.empty_state">
          <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No visits found</p>
        </div>
      ) : (
        <Card className="shadow-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">
                    Client
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Location
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDisplay.map((visit, i) => {
                  const date = visitDateToDate(visit.visitDate);
                  return (
                    <TableRow
                      key={visit.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {visit.clientName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {visit.locationName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {visit.contactNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {date.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {`${visit.user.toString().slice(0, 12)}...`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
