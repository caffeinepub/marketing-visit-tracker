import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPinned } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MapPinned className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-bold text-lg">
            Visit Tracker
          </span>
        </div>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-sidebar-foreground leading-tight">
              Track every visit,
              <br />
              <span className="text-primary">grow every deal.</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sidebar-foreground/60 text-base leading-relaxed"
          >
            Your marketing team's complete field visit management platform. Log
            client visits, track locations, and measure your team's reach.
          </motion.p>
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {[
              "GPS-powered location capture",
              "Automatic distance calculation",
              "Team performance overview",
              "Client contact management",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-sidebar-foreground/70 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </motion.ul>
        </div>
        <p className="text-sidebar-foreground/30 text-xs">
          Secure authentication via Internet Identity
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <MapPinned className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Visit Tracker</span>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Access your team's visit dashboard
              </p>
            </div>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full h-11 text-sm font-semibold"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              New users are automatically registered on first login.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
