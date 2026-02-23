"use client";

import { useDevice } from "./DeviceContext";
import { cn } from "@/lib/utils";

export function DeviceFrame({ children }: { children: React.ReactNode }) {
    const { isMobileView } = useDevice();

    return (
        <div
            className={cn(
                "min-h-screen transition-all duration-300 ease-in-out mx-auto shadow-2xl overflow-hidden",
                isMobileView
                    ? "max-w-[390px] border-x border-white/10 my-8 rounded-[40px] h-[844px] overflow-y-auto scrollbar-hide bg-background ring-8 ring-black"
                    : "w-full"
            )}
        >
            {/* iPhone Notch Simulation */}
            {isMobileView && (
                <div className="sticky top-0 left-0 right-0 h-8 bg-black z-[100] flex justify-center items-end pb-1 pointer-events-none">
                    <div className="w-32 h-4 bg-black rounded-b-2xl" />
                </div>
            )}

            {children}

            {/* iOS Home Indicator */}
            {isMobileView && (
                <div className="sticky bottom-0 left-0 right-0 h-6 bg-black z-[100] flex justify-center items-center pointer-events-none">
                    <div className="w-32 h-1 bg-white/20 rounded-full" />
                </div>
            )}
        </div>
    );
}
