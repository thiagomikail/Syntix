"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageContext";
import { LoginScreen } from "@/components/LoginScreen";
import { getUserData, SavedIdea } from "@/app/actions/user";
import { InceptionTab } from "@/components/InceptionTab";
import { IdeationTab } from "@/components/IdeationTab";
import { PitchReadyDashboard } from "@/components/PitchReadyDashboard";
import { cn } from "@/lib/utils";
import { InceptionAnalysis } from "@/types/inception";

type Tab = "ideation" | "inception" | "pitch-ready";

export default function Home() {
  const { data: session, status } = useSession();
  const { t } = useLanguage(); // Added t here
  const [history, setHistory] = useState<SavedIdea[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("ideation");
  const [transferredContext, setTransferredContext] = useState<{ text: string, analysis?: InceptionAnalysis } | null>(null);
  const [generatedIdea, setGeneratedIdea] = useState<string>("");

  // Load user data on login
  useEffect(() => {
    if (session?.user?.name) {
      getUserData(session.user.name).then(data => setHistory(data.history));
    }
  }, [session]);

  const handleTransferToPitch = (idea: string, analysis: InceptionAnalysis) => {
    setTransferredContext({ text: idea, analysis });
    setActiveTab("pitch-ready");
  };

  const handleIdeaGenerated = (idea: string) => {
    setGeneratedIdea(idea);
    setActiveTab("inception");
  };

  if (status === "loading") {
    return <div className="h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <LoginScreen />;
  }

  const user = session?.user?.name || "Guest";

  return (
    <div className="h-screen flex flex-col font-sans selection:bg-primary/20 overflow-hidden bg-background text-foreground">
      <Header />

      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-border bg-secondary/5 backdrop-blur-sm z-50">
        <div className="flex gap-1 p-1">
          <button
            onClick={() => setActiveTab("ideation")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === "ideation"
                ? "bg-primary text-background shadow-lg shadow-primary/20"
                : "text-muted hover:text-foreground hover:bg-white/5"
            )}
          >
            {t.nav.ideation}
          </button>
          <button
            onClick={() => setActiveTab("inception")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === "inception"
                ? "bg-primary text-background shadow-lg shadow-primary/20"
                : "text-muted hover:text-foreground hover:bg-white/5"
            )}
          >
            {t.nav.inception}
          </button>
          <button
            onClick={() => setActiveTab("pitch-ready")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === "pitch-ready"
                ? "bg-primary text-background shadow-lg shadow-primary/20"
                : "text-muted hover:text-foreground hover:bg-white/5"
            )}
          >
            {t.nav.pitchReady}
          </button>
        </div>
      </div>

      {/* Main Content Area - Persistent Views */}
      <div className="flex-1 overflow-hidden relative">
        <div className={cn("h-full w-full", activeTab === "ideation" ? "block" : "hidden")}>
          <IdeationTab onIdeaGenerated={handleIdeaGenerated} />
        </div>
        <div className={cn("h-full w-full", activeTab === "inception" ? "block" : "hidden")}>
          <InceptionTab
            onPitch={handleTransferToPitch}
            initialValue={generatedIdea}
            key={generatedIdea} // Force re-render when a new idea is generated
            isActive={activeTab === "inception"}
          />
        </div>
        <div className={cn("h-full w-full", activeTab === "pitch-ready" ? "block" : "hidden")}>
          <PitchReadyDashboard
            user={user}
            history={history}
            setHistory={setHistory}
            initialContext={transferredContext}
          />
        </div>
      </div>

    </div>
  );
}
