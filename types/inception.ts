export type InceptionPath =
    | "cash_cow"     // Cash Cow: low scale, high margin
    | "cash_farm"    // Cash Farm: scale through specialists, services
    | "new_meat"     // New Meat: VC-backed, high risk / high return
    | "ozempics"     // Ozempics: deep tech, behavior change
    | "dead_end";    // Dead End: no return

export interface InceptionAnalysis {
    classification: {
        path: InceptionPath;
        label: string;
        badgeColor: string; // Hex code for UI
        confidence: number; // 0-100
        reasoning: string; // 1-sentence explanation
    };
    marketResearch: {
        tam: string;
        sam: string;
        som: string;
        niche: string;
        persona: string;           // Target customer persona
        competitors: string[];     // Top 3-5 competitors
        leveragePoints: string[];  // Exploitable leverage points
    };
    strategy: {
        sales1M: string[];
        sales6M: string[];
        monetization: string[];    // Revenue model options
        distribution: string[];   // Distribution channel strategies
        moat: string;             // How to build competitive advantage
    };
    execution: {
        first3Steps: string[];
        whatElse: string;
        plan30d: string[];         // 30-day execution items
        plan90d: string[];         // 90-day execution items
        plan180d: string[];        // 180-day execution items
        teamCompetences: string[]; // Required team skills
        partnershipSuggestions: string[]; // Strategic partnerships
    };
}
