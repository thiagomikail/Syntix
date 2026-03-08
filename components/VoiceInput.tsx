"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
    className?: string;
}

export function VoiceInput({ onTranscript, disabled, className }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check for Web Speech API support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = "en-US"; // Will be updated based on site language

            recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const transcript = event.results[last][0].transcript;
                onTranscript(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscript]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={cn(
                "flex items-center justify-center rounded-lg p-2.5 transition-all disabled:opacity-50",
                isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-primary/10 text-primary hover:bg-primary/20",
                className
            )}
            title={isListening ? "Stop recording" : "Start voice input"}
        >
            <span className="material-symbols-outlined text-lg">
                {isListening ? "stop_circle" : "mic"}
            </span>
        </button>
    );
}
