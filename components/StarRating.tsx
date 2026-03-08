"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    onRate?: (score: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function StarRating({ rating, onRate, readonly = false, size = "md", className }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);
    const displayRating = hoverRating || rating;

    const sizeClasses = {
        sm: "text-sm gap-0.5",
        md: "text-lg gap-1",
        lg: "text-2xl gap-1.5",
    };

    return (
        <div
            className={cn("flex items-center", sizeClasses[size], className)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    className={cn(
                        "transition-all disabled:cursor-default",
                        !readonly && "cursor-pointer hover:scale-110"
                    )}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            color: star <= displayRating ? "#f59e0b" : "#374151",
                            fontVariationSettings: star <= displayRating ? "'FILL' 1" : "'FILL' 0",
                        }}
                    >
                        star
                    </span>
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-1 text-xs font-bold text-slate-400">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
