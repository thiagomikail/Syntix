export type InceptionPath =
    | "micro" // Path 1: Cash-Flow Micro
    | "specialist" // Path 2: Scalable Specialist
    | "venture" // Path 3: The Venture Engine
    | "paradigm" // Path 4: The Paradigm Shifter
    | "dead_end"; // Path 5: Decrease your losses

export interface InceptionAnalysis {
    classification: {
        path: InceptionPath;
        label: string;
        badgeColor: string; // Hex code for UI
        confidence: number; // 0-100
        reasoning: string; // 1-sentence explanation of why this path
    };
    marketResearch: {
        tam: string; // Total Addressable Market
        sam: string; // Serviceable Available Market
        som: string; // Serviceable Obtainable Market
        niche: string; // Specific niche analysis
    };
    strategy: {
        sales1M: string[]; // List of actionable steps for month 1
        sales6M: string[]; // List of milestones for month 6
    };
    execution: {
        first3Steps: string[]; // Immediate next 3 steps
        whatElse: string; // Special feature (Moat, Ship-it list, or Reality Check for Dead End)
    };
}
