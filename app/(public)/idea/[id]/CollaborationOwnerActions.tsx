"use client";

import { useState } from "react";
import { resolveCollaboration } from "@/app/actions/collaborate";
import { Loader2, Check, X } from "lucide-react";

interface CollaborationOwnerActionsProps {
    collaborationId: string;
    ideaId: string;
    authorId: string; // The user who submitted the collaboration
}

export function CollaborationOwnerActions({ collaborationId, ideaId, authorId }: CollaborationOwnerActionsProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleResolve = async (status: "accepted" | "rejected") => {
        setIsProcessing(true);
        await resolveCollaboration(collaborationId, status);
        // UI will implicitly update due to revalidatePath from sever action
        setIsProcessing(false);
    };

    if (isProcessing) {
        return (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-black">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </div>
        );
    }

    return (
        <div className="flex gap-3 pt-4 border-t border-border/50 mt-2">
            <button
                onClick={() => handleResolve("accepted")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-green-500/10 text-green-700 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-crafted active:scale-95"
            >
                <Check className="w-4 h-4" />
                Accept
            </button>
            <button
                onClick={() => handleResolve("rejected")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-700 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-crafted active:scale-95"
            >
                <X className="w-4 h-4" />
                Reject
            </button>
        </div>
    );
}
