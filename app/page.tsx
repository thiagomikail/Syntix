import Link from "next/link";
import { ArenaCarousel } from "@/components/ArenaCarousel";
import { LandingIdeaForm } from "@/components/LandingIdeaForm";
import { Header } from "@/components/Header";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Nav */}
      <Header />

      {/* Hero — Idea Input First */}
      <section className="relative px-6 py-16 md:py-24 max-w-3xl mx-auto text-center">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Your next idea<br />
            <span className="text-primary">starts here.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto">
            Type or speak your business idea. We&apos;ll classify it, stress test it, and help you build it.
          </p>

          {/* Quick Idea Input */}
          <div className="max-w-xl mx-auto mt-8">
            <LandingIdeaForm />
            <p className="text-xs text-slate-600 mt-3">
              Sign in to save and refine your ideas. Free to start.
            </p>
          </div>

          {/* Trending Ideas Integrated closely */}
          <div className="mt-16 pt-8 border-t border-primary/10">
            <div className="mb-6 text-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">local_fire_department</span>
                Trending in the Arena
              </h2>
            </div>
            <div className="text-left w-full translate-x-1/2 -ml-[50vw] w-screen overflow-hidden">
              <div className="max-w-[100vw] mx-auto px-6 pb-8">
                <ArenaCarousel />
              </div>
            </div>
            <Link href="/arena" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-primary hover:text-white transition-colors">
              Enter Full Arena <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-10 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: "science", title: "Ideação", desc: "Input your idea or explore channels: Pain-Storming, Technology, Market Demands, External Shocks." },
            { icon: "rocket_launch", title: "Análise e Refino", desc: "AI classifies into 5 archetypes and generates strategic map: market, strategy, execution plan." },
            { icon: "hub", title: "Stress Test", desc: "AI Board of 4 personas challenge your idea. Get IRL score and mentoring on your journey." },
            { icon: "public", title: "Arena", desc: "Publish and let the community vote and comment. Build in public, get real feedback." },
          ].map((step, i) => (
            <div key={i} className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6 text-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
                <span className="material-symbols-outlined text-2xl">{step.icon}</span>
              </div>
              <h3 className="font-bold tracking-tight">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-primary/10 text-center">
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Syntix. All rights reserved.</p>
      </footer>
    </div>
  );
}
