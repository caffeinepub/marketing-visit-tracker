import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Phone, Plus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d";
import { useAddClient, useGetClients } from "../hooks/useQueries";

const EMPTY_CLIENT: Client = {
  name: "",
  contactNumber: "",
  location: "",
  notes: "",
};

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useGetClients();
  const addClient = useAddClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Client>(EMPTY_CLIENT);

  const set =
    (field: keyof Client) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClient.mutateAsync(form);
      toast.success(`Client "${form.name}" added!`);
      setForm(EMPTY_CLIENT);
      setOpen(false);
    } catch {
      toast.error("Failed to add client.");
    }
  };

  return (
    <div className="space-y-6" data-ocid="clients.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""} on record
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="clients.open_modal_button"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-ocid="clients.dialog">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cname">Client Name *</Label>
                <Input
                  id="cname"
                  data-ocid="clients.name.input"
                  placeholder="Company or person name"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ccontact">Contact Number *</Label>
                <Input
                  id="ccontact"
                  data-ocid="clients.contact.input"
                  placeholder="+91 98765 43210"
                  value={form.contactNumber}
                  onChange={set("contactNumber")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clocation">Location</Label>
                <Input
                  id="clocation"
                  data-ocid="clients.location.input"
                  placeholder="City or address"
                  value={form.location}
                  onChange={set("location")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnotes">Notes</Label>
                <Textarea
                  id="cnotes"
                  data-ocid="clients.notes.textarea"
                  placeholder="Any relevant notes..."
                  value={form.notes}
                  onChange={set("notes")}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="clients.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addClient.isPending}
                  data-ocid="clients.submit_button"
                >
                  {addClient.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Client"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="clients.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20" data-ocid="clients.empty_state">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No clients yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Add your first client to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {clients.map((client, i) => (
              <motion.div
                key={`${client.name}-${client.contactNumber}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`clients.item.${i + 1}`}
              >
                <Card className="shadow-card border-border h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {client.name}
                        </p>
                        {client.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {client.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Phone className="w-3 h-3" />
                          {client.contactNumber}
                        </span>
                        {client.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {client.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
