import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

describe("Landing Page & App Structure", () => {
  const clientDir = resolve(__dirname, "../client/src");

  it("LandingPage.tsx exists and contains key sections", () => {
    const filePath = resolve(clientDir, "pages/LandingPage.tsx");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    // Hero section
    expect(content).toContain("Your Business.");
    expect(content).toContain("Automated.");
    expect(content).toContain("Always On.");
    // Services section
    expect(content).toContain("WhatsApp Automation");
    expect(content).toContain("AI Website Chatbot");
    expect(content).toContain("Automated Lead Follow-Up");
    // Pricing section
    expect(content).toContain("WhatsApp Starter");
    expect(content).toContain("AI Complete");
    expect(content).toContain("Chatbot Only");
    // Industries section
    expect(content).toContain("Estate Agents");
    expect(content).toContain("Guest Houses & Tourism");
    // About section
    expect(content).toContain("SA is 3 years behind");
    // Contact info
    expect(content).toContain("27734061526");
    expect(content).toContain("info@mannadigitalhub.co.za");
    // Payment section
    expect(content).toContain("Capitec Business");
    expect(content).toContain("1055056238");
  });

  it("App.tsx routes landing page at root and admin routes under /admin", () => {
    const filePath = resolve(clientDir, "App.tsx");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    // Landing page at root
    expect(content).toContain("LandingPage");
    // Admin routes
    expect(content).toContain("/admin");
    expect(content).toContain("AdminDashboard");
    expect(content).toContain("CRMLeads");
    expect(content).toContain("Projects");
    expect(content).toContain("Invoices");
    expect(content).toContain("BotLeadsDashboard");
  });

  it("AdminDashboard.tsx exists and uses DashboardLayout", () => {
    const filePath = resolve(clientDir, "pages/AdminDashboard.tsx");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("DashboardLayout");
    expect(content).toContain("Dashboard");
    expect(content).toContain("Quick Actions");
  });

  it("BotLeadsDashboard.tsx exists and uses DashboardLayout", () => {
    const filePath = resolve(clientDir, "pages/BotLeadsDashboard.tsx");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("DashboardLayout");
    expect(content).toContain("Bot Leads Dashboard");
  });

  it("DashboardLayout has correct Manna admin navigation items", () => {
    const filePath = resolve(clientDir, "components/DashboardLayout.tsx");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("Manna Admin");
    expect(content).toContain("/admin");
    expect(content).toContain("/admin/leads");
    expect(content).toContain("/admin/bot-leads");
    expect(content).toContain("/admin/projects");
    expect(content).toContain("/admin/invoices");
    expect(content).toContain("Back to Site");
  });

  it("index.css has Manna brand colors and custom animations", () => {
    const filePath = resolve(clientDir, "index.css");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    // Brand colors
    expect(content).toContain("--color-manna-green");
    expect(content).toContain("--color-manna-emerald");
    // Custom animations
    expect(content).toContain("animate-marquee");
    expect(content).toContain("glow-green");
    expect(content).toContain("text-gradient-green");
    expect(content).toContain("animate-float");
    expect(content).toContain("animate-pulse-dot");
    // Fonts
    expect(content).toContain("Space Grotesk");
    expect(content).toContain("Inter");
  });

  it("ChatBot widget is integrated in App.tsx", () => {
    const filePath = resolve(clientDir, "App.tsx");
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("ChatBot");
    expect(content).toContain("Manna Bot");
  });

  it("index.html includes Google Fonts", () => {
    const filePath = resolve(__dirname, "../client/index.html");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("fonts.googleapis.com");
    expect(content).toContain("Inter");
    expect(content).toContain("Space+Grotesk");
  });
});
