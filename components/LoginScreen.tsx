import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, ArrowRight, Chrome } from "lucide-react";

interface LoginScreenProps {
    onLogin?: (username: string) => void; // Optional now as we use NextAuth
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        const result = await signIn("credentials", {
            username: username.trim(),
            redirect: false,
        });

        if (result?.ok) {
            // We might rely on session update in parent, or force reload/redirect
            window.location.reload();
        } else {
            setIsLoading(false);
            console.error("Login failed");
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn("google");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 bg-secondary/10 border border-border rounded-xl backdrop-blur-xl shadow-2xl"
            >
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                        <Terminal className="w-8 h-8 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter">SYNTIX</h1>
                        <p className="text-muted text-sm font-mono uppercase tracking-widest">
                            Product Ideation Platform v5.0
                        </p>
                    </div>

                    <div className="w-full space-y-4 mt-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full bg-white text-black font-medium py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <Chrome className="w-5 h-5" />
                            Continue with Google
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="flex-shrink-0 mx-4 text-muted text-xs uppercase tracking-widest">Or access via callsign</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <form onSubmit={handleCredentialsLogin} className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Access Callsign"
                                    className="w-full bg-background/50 border border-border rounded-lg p-4 font-mono text-center focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted/50"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!username.trim() || isLoading}
                                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                            >
                                {isLoading ? "Authenticating..." : "Initialize Session"}
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
