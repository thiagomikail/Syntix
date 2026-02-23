"use client";

import React, { createContext, useContext, useState } from "react";

interface DeviceContextType {
    isMobileView: boolean;
    toggleMobileView: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
    const [isMobileView, setIsMobileView] = useState(false);

    const toggleMobileView = () => setIsMobileView(prev => !prev);

    return (
        <DeviceContext.Provider value={{ isMobileView, toggleMobileView }}>
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevice() {
    const context = useContext(DeviceContext);
    if (!context) throw new Error("useDevice must be used within a DeviceProvider");
    return context;
}
