import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import CRMLeads from "./pages/CRMLeads";
import Projects from "./pages/Projects";
import Invoices from "./pages/Invoices";
import BotLeadsDashboard from "./pages/BotLeadsDashboard";
import ChatBot from "./components/ChatBot";

function Router() {
  return (
    <>
      {/* Manna ChatBot Widget — AI-powered, visible on all pages */}
      <ChatBot
        title="Manna Bot"
        subtitle="AI Powered — 14 Languages"
      />
      <Switch>
        {/* Public: Customer-facing landing page */}
        <Route path="" component={LandingPage} />

        {/* Admin: Protected dashboard routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/leads" component={CRMLeads} />
        <Route path="/admin/bot-leads" component={BotLeadsDashboard} />
        <Route path="/admin/projects" component={Projects} />
        <Route path="/admin/invoices" component={Invoices} />

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
