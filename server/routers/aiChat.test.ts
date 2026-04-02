import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const serverDir = resolve(__dirname, "..");
const clientDir = resolve(__dirname, "../../client/src");

describe("AI Chat Integration", () => {
  describe("Server-side AI Chat Router", () => {
    it("aiChat.ts exists with required exports", () => {
      const filePath = resolve(__dirname, "aiChat.ts");
      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("aiChatRouter");
      expect(content).toContain("MANNA_SYSTEM_PROMPT");
    });

    it("has sendMessage procedure with sessionId and message inputs", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      expect(content).toContain("sendMessage");
      expect(content).toContain("sessionId");
      expect(content).toContain("z.string()");
      expect(content).toContain(".mutation(");
    });

    it("has getHistory procedure", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      expect(content).toContain("getHistory");
      expect(content).toContain(".query(");
    });

    it("has clearHistory procedure", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      expect(content).toContain("clearHistory");
    });

    it("uses Anthropic Claude for AI responses", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      // Switched from Forge/Gemini to Anthropic SDK
      expect(content).toContain("anthropic");
      expect(content).toContain("callMannaBot");
      expect(content).toContain("@anthropic-ai/sdk");
    });

    it("has conversation history management with cleanup", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      expect(content).toContain("conversationStore");
      expect(content).toContain("getOrCreateConversation");
      expect(content).toContain("setInterval");
      // Cleanup uses 'cutoff' variable (renamed from thirtyMinutesAgo for clarity)
      expect(content).toContain("cutoff");
    });

    it("has lead extraction from AI responses", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      expect(content).toContain("extractLeadData");
      expect(content).toContain("LEAD_CAPTURED");
      expect(content).toContain("cleanResponse");
    });

    it("saves captured leads to database", () => {
      const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");
      expect(content).toContain("saveLeadToDb");
      expect(content).toContain("INSERT INTO bot_leads");
    });
  });

  describe("System Prompt Quality", () => {
    const content = readFileSync(resolve(__dirname, "aiChat.ts"), "utf-8");

    it("contains Manna Digital Hub identity", () => {
      expect(content).toContain("Manna Digital Hub");
      expect(content).toContain("Melanie Muller");
      expect(content).toContain("Garden Route");
      expect(content).toContain("+27 73 406 1526");
      expect(content).toContain("info@mannadigitalhub.co.za");
    });

    it("contains all service details with pricing", () => {
      expect(content).toContain("WhatsApp Automation");
      expect(content).toContain("AI Website Chatbot");
      expect(content).toContain("Automated Lead Follow-Up");
      expect(content).toContain("AI Complete Bundle");
      expect(content).toContain("R2,500");
      expect(content).toContain("R8,000");
      expect(content).toContain("R2,500");
    });

    it("contains multilingual support instructions", () => {
      expect(content).toContain("Afrikaans");
      expect(content).toContain("isiZulu");
      expect(content).toContain("isiXhosa");
      expect(content).toContain("Sesotho");
      expect(content).toContain("Setswana");
      expect(content).toContain("Portuguese");
      expect(content).toContain("French");
      expect(content).toContain("Swahili");
    });

    it("contains lead qualification flow instructions", () => {
      expect(content).toContain("Lead Qualification Flow");
      expect(content).toContain("business type");
      expect(content).toContain("pain point");
      expect(content).toContain("budget range");
    });

    it("contains how it works process", () => {
      expect(content).toContain("Free Discovery Call");
      expect(content).toContain("We Build It");
      expect(content).toContain("You Approve");
      expect(content).toContain("It Runs Itself");
    });

    it("contains key selling points", () => {
      expect(content).toContain("11 hours late");
      expect(content).toContain("67%");
      expect(content).toContain("load-shedding");
      expect(content).toContain("48-hour setup");
      expect(content).toContain("month-to-month");
    });

    it("contains industries served", () => {
      expect(content).toContain("Estate Agents");
      expect(content).toContain("Guest Houses");
      expect(content).toContain("Restaurants");
      expect(content).toContain("Agriculture");
    });

    it("contains payment details", () => {
      expect(content).toContain("Capitec Business");
      expect(content).toContain("1055056238");
    });

    it("contains escalation instructions", () => {
      expect(content).toContain("Escalation");
      expect(content).toContain("connect you with Mela");
    });
  });

  describe("WhatsApp Webhook AI Integration", () => {
    it("whatsapp-webhook.ts imports shared bot helpers from aiChat router", () => {
      const filePath = resolve(serverDir, "whatsapp-webhook.ts");
      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, "utf-8");
      // Imports callMannaBot + extractLeadData instead of raw MANNA_SYSTEM_PROMPT + invokeLLM
      expect(content).toContain("callMannaBot");
      expect(content).toContain("extractLeadData");
      expect(content).toContain("from './routers/aiChat'");
    });

    it("WhatsApp webhook has conversation history per phone number", () => {
      const content = readFileSync(resolve(serverDir, "whatsapp-webhook.ts"), "utf-8");
      expect(content).toContain("waConversations");
      expect(content).toContain("getOrCreateWAConv");
    });

    it("WhatsApp webhook uses Claude via callMannaBot", () => {
      const content = readFileSync(resolve(serverDir, "whatsapp-webhook.ts"), "utf-8");
      expect(content).toContain("callMannaBot");
    });

    it("WhatsApp webhook extracts and saves leads", () => {
      const content = readFileSync(resolve(serverDir, "whatsapp-webhook.ts"), "utf-8");
      // Lead parsing is handled by extractLeadData (imported from aiChat)
      expect(content).toContain("extractLeadData");
      expect(content).toContain("saveLeadToDb");
    });

    it("WhatsApp webhook uses correct Meta Graph API URL", () => {
      const content = readFileSync(resolve(serverDir, "whatsapp-webhook.ts"), "utf-8");
      expect(content).toContain("graph.facebook.com");
      expect(content).not.toContain("graph.instagram.com");
    });

    it("WhatsApp webhook has fallback error handling", () => {
      const content = readFileSync(resolve(serverDir, "whatsapp-webhook.ts"), "utf-8");
      // Fallback sends user to Mela's WhatsApp on error
      expect(content).toContain("+27 73 406 1526");
      expect(content).toContain("catch");
    });
  });

  describe("ChatBot Frontend Component", () => {
    it("ChatBot.tsx exists and uses tRPC", () => {
      const filePath = resolve(clientDir, "components/ChatBot.tsx");
      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("trpc.aiChat.sendMessage.useMutation");
      expect(content).toContain("trpc.aiChat.clearHistory.useMutation");
    });

    it("ChatBot has session management", () => {
      const content = readFileSync(resolve(clientDir, "components/ChatBot.tsx"), "utf-8");
      expect(content).toContain("getSessionId");
      expect(content).toContain("sessionStorage");
      expect(content).toContain("manna-bot-session");
    });

    it("ChatBot has quick action buttons", () => {
      const content = readFileSync(resolve(clientDir, "components/ChatBot.tsx"), "utf-8");
      expect(content).toContain("quickActions");
      expect(content).toContain("What services do you offer?");
      expect(content).toContain("Show me pricing");
      expect(content).toContain("Book a free call");
    });

    it("ChatBot has typing indicator", () => {
      const content = readFileSync(resolve(clientDir, "components/ChatBot.tsx"), "utf-8");
      expect(content).toContain("isLoading");
      expect(content).toContain("animate-bounce");
    });

    it("ChatBot has reset/new conversation feature", () => {
      const content = readFileSync(resolve(clientDir, "components/ChatBot.tsx"), "utf-8");
      expect(content).toContain("handleReset");
      expect(content).toContain("RotateCcw");
    });

    it("ChatBot has Manna branding", () => {
      const content = readFileSync(resolve(clientDir, "components/ChatBot.tsx"), "utf-8");
      expect(content).toContain("Powered by Manna AI");
      expect(content).toContain("emerald");
    });
  });

  describe("Router Registration", () => {
    it("aiChat router is registered in main routers.ts", () => {
      const content = readFileSync(resolve(serverDir, "routers.ts"), "utf-8");
      expect(content).toContain("import { aiChatRouter }");
      expect(content).toContain("aiChat: aiChatRouter");
    });
  });
});
