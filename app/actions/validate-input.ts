"use server";

const INJECTION_PATTERNS = [
    // Ignore/override instructions
    /ignore\s+(all\s+)?previous\s+instructions?/i,
    /ignore\s+(all\s+)?above/i,
    /disregard\s+(all\s+)?previous/i,
    /forget\s+(all\s+)?(your|the)\s+(instructions?|rules?|guidelines?)/i,
    /override\s+(system|instructions?|rules?)/i,
    /bypass\s+(system|instructions?|rules?|safety|filters?)/i,

    // Role-playing attacks
    /you\s+are\s+now\s+(a|an|the)\s/i,
    /act\s+as\s+if\s+you\s+(are|were)/i,
    /pretend\s+(you\s+are|to\s+be)/i,
    /switch\s+to\s+.*\s+mode/i,
    /enter\s+.*\s+mode/i,
    /jailbreak/i,
    /DAN\s*mode/i,

    // System prompt extraction
    /what\s+(are|is)\s+(your|the)\s+(instructions?|system\s+prompt|rules?)/i,
    /show\s+(me\s+)?(your|the)\s+(prompt|instructions?|system)/i,
    /repeat\s+(your|the)\s+(system\s+)?prompt/i,
    /reveal\s+(your|the)\s+(system\s+)?prompt/i,

    // Morally questionable content markers
    /how\s+to\s+(make|create|build)\s+a?\s*(bomb|weapon|explosive|drug|narcotic)/i,
    /how\s+to\s+(hack|attack|exploit|breach)\s/i,
    /how\s+to\s+(steal|fraud|scam|launder)/i,
    /illegal\s+(activity|activities|business|scheme)/i,
];

const SOFT_FLAGS = [
    /system\s*:\s*/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<<SYS>>/i,
    /<\/?\s*system\s*>/i,
    /\bprompt\s*injection\b/i,
];

interface ValidationResult {
    safe: boolean;
    flagged: boolean; // Soft flag — suspicious but not blocked
    reason?: string;
}

export async function validateInput(text: string): Promise<ValidationResult> {
    if (!text || !text.trim()) {
        return { safe: true, flagged: false };
    }

    // Hard blocks
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            // Send admin alert
            await sendAdminAlert(text, "prompt_injection");
            return {
                safe: false,
                flagged: true,
                reason: "This input has been flagged for review by our administration. If this was a mistake, please rephrase your idea.",
            };
        }
    }

    // Soft flags — allow but log
    for (const pattern of SOFT_FLAGS) {
        if (pattern.test(text)) {
            await sendAdminAlert(text, "suspicious_pattern");
            return {
                safe: true,
                flagged: true,
                reason: "Your input contains patterns that will be reviewed. You may proceed.",
            };
        }
    }

    return { safe: true, flagged: false };
}

async function sendAdminAlert(content: string, type: string) {
    try {
        // In production, send email via a service like Resend, SendGrid, etc.
        // For now, log and prepare the payload for info@syntix.net
        console.warn(`[SECURITY ALERT] Type: ${type}`);
        console.warn(`[SECURITY ALERT] Content: ${content.substring(0, 200)}`);
        console.warn(`[SECURITY ALERT] Timestamp: ${new Date().toISOString()}`);
        console.warn(`[SECURITY ALERT] Should email: info@syntix.net`);

        // TODO: Integrate email service
        // await sendEmail({
        //     to: "info@syntix.net",
        //     subject: `[Syntix Security] ${type} detected`,
        //     body: `Content: ${content}\nTimestamp: ${new Date().toISOString()}`,
        // });
    } catch (error) {
        console.error("Failed to send admin alert:", error);
    }
}
