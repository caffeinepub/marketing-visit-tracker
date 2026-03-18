import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapPinned } from "lucide-react";
import { useState } from "react";
import Layout from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AddVisitPage from "./pages/AddVisitPage";
import AdminPage from "./pages/AdminPage";
import ClientsPage from "./pages/ClientsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MyVisitsPage from "./pages/MyVisitsPage";

const queryClient = new QueryClient();

type Page = "dashboard" | "add-visit" | "my-visits" | "clients" | "admin";

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && profile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <MapPinned className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading Visit Tracker...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "add-visit":
        return <AddVisitPage />;
      case "my-visits":
        return <MyVisitsPage />;
      case "clients":
        return <ClientsPage />;
      case "admin":
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
