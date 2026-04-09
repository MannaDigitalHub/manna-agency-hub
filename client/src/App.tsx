import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CRMLeads from "./pages/CRMLeads";
import Projects from "./pages/Projects";
import Invoices from "./pages/Invoices";
import BotLeadsDashboard from "./pages/BotLeadsDashboard";
import FacebookLeads from "./pages/FacebookLeads";
import ChatBot from "./components/ChatBot";
import ClientLogin from "./pages/ClientLogin";
import ClientSetup from "./pages/ClientSetup";
import ClientForgotPassword from "./pages/ClientForgotPassword";
import ClientResetPassword from "./pages/ClientResetPassword";
import ClientPortal from "./pages/ClientPortal";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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

        {/* Admin: Login + Protected dashboard routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/leads" component={CRMLeads} />
        <Route path="/admin/bot-leads" component={BotLeadsDashboard} />
        <Route path="/admin/projects" component={Projects} />
        <Route path="/admin/invoices" component={Invoices} />
        <Route path="/admin/facebook-leads" component={FacebookLeads} />

        {/* Client portal */}
        <Route path="/client" component={ClientLogin} />
        <Route path="/client/setup" component={ClientSetup} />
        <Route path="/client/forgot-password" component={ClientForgotPassword} />
        <Route path="/client/reset-password" component={ClientResetPassword} />
        <Route path="/client/portal" component={ClientPortal} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/payment/success" component={() => (
          <div className="min-h-screen bg-[oklch(0.08_0.02_260)] flex items-center justify-center text-center p-8">
            <div>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-slate-400 mb-6">Welcome to Manna Digital Hub. We'll be in touch within 24 hours to get you set up.</p>
              <a href="/" className="text-emerald-400 hover:underline">← Back to home</a>
            </div>
          </div>
        )} />

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
