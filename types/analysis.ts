export interface RadarDataPoint {
    subject: string;
    A: number;
    fullMark: number;
}

export interface AnalysisResult {
    title?: string;
    imagePrompt?: string;
    score: number;
    radarData: RadarDataPoint[];
    detailedScores: {
        logicalCoherence: number;
        marketDepth: number;
        unitEconomics: number;
    };
    metricDetails: {
        logicalCoherence: string;
        marketDepth: string;
        unitEconomics: string;
    };
    feedback: string;
}

export type Persona = "skeptic" | "growth" | "cfo" | "builder";

export interface Message {
    id: string;
    role: "system" | "user" | "ai";
    persona?: Persona;
    content: string;
    timestamp: Date | string; // Allow string for serialization
}
