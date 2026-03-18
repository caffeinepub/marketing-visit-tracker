import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Locate, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateVisit } from "../hooks/useQueries";

interface FormState {
  clientName: string;
  contactNumber: string;
  locationName: string;
  visitDate: string;
  notes: string;
}

const INITIAL: FormState = {
  clientName: "",
  contactNumber: "",
  locationName: "",
  visitDate: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function AddVisitPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const createVisit = useCreateVisit();

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        toast.success("GPS location captured!");
      },
      (err) => {
        setGpsLoading(false);
        toast.error(`GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gps) {
      toast.error("Please capture GPS location before submitting.");
      return;
    }
    try {
      await createVisit.mutateAsync({
        clientName: form.clientName,
        contactNumber: form.contactNumber,
        locationName: form.locationName,
        latitude: gps.lat,
        longitude: gps.lng,
        visitDate: new Date(form.visitDate),
        notes: form.notes,
      });
      toast.success("Visit recorded successfully!");
      setForm(INITIAL);
      setGps(null);
    } catch {
      toast.error("Failed to save visit. Please try again.");
    }
  };

  return (
    <div className="w-full lg:max-w-xl" data-ocid="add_visit.page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Add Visit</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Record a new client visit with location details
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" />
              Visit Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    data-ocid="add_visit.client_name.input"
                    placeholder="e.g. Tata Motors"
                    value={form.clientName}
                    onChange={set("clientName")}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    data-ocid="add_visit.contact_number.input"
                    placeholder="+91 98765 43210"
                    value={form.contactNumber}
                    onChange={set("contactNumber")}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="locationName">Location Name *</Label>
                <Input
                  id="locationName"
                  data-ocid="add_visit.location_name.input"
                  placeholder="e.g. Andheri West, Mumbai"
                  value={form.locationName}
                  onChange={set("locationName")}
                  required
                  className="h-11"
                />
              </div>

              {/* GPS Section */}
              <div className="space-y-2">
                <Label>GPS Coordinates *</Label>
                <Button
                  type="button"
                  variant={gps ? "secondary" : "outline"}
                  onClick={captureGPS}
                  disabled={gpsLoading}
                  data-ocid="add_visit.gps.button"
                  className="w-full h-11 flex items-center justify-center gap-2"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Capturing...
                    </>
                  ) : gps ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      GPS Captured
                    </>
                  ) : (
                    <>
                      <Locate className="w-4 h-4" />
                      Capture GPS Location
                    </>
                  )}
                </Button>
                {gps && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-muted-foreground font-mono text-center"
                  >
                    {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                  </motion.p>
                )}
                {!gps && (
                  <p className="text-xs text-muted-foreground">
                    Tap to use your device&apos;s GPS for accurate location
                    tracking and distance calculation.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Input
                  id="visitDate"
                  type="date"
                  data-ocid="add_visit.visit_date.input"
                  value={form.visitDate}
                  onChange={set("visitDate")}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  data-ocid="add_visit.notes.textarea"
                  placeholder="Meeting outcome, follow-up required, etc."
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-semibold text-base"
                disabled={createVisit.isPending}
                data-ocid="add_visit.submit_button"
              >
                {createVisit.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Visit...
                  </>
                ) : (
                  "Save Visit"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
