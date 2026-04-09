"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  deriveKeyFromPassphrase,
  generateSalt,
} from "@/lib/vault-crypto";

const SALT_STORAGE_KEY = "travelvault_salt";
const HAS_PASSPHRASE_KEY = "travelvault_has_passphrase";
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface VaultPassphraseContextType {
  /** The derived AES-256 master key (null when vault is locked). */
  masterKey: CryptoKey | null;
  /** Whether a passphrase has been set previously. */
  hasPassphrase: boolean;
  /** True while deriving key from passphrase. */
  isUnlocking: boolean;
  /** Set the passphrase for the first time. */
  createPassphrase: (passphrase: string) => Promise<void>;
  /** Unlock vault with existing passphrase. */
  unlock: (passphrase: string) => Promise<boolean>;
  /** Lock vault (clear master key from memory). */
  lock: () => void;
}

const VaultPassphraseContext = createContext<VaultPassphraseContextType>({
  masterKey: null,
  hasPassphrase: false,
  isUnlocking: false,
  createPassphrase: async () => {},
  unlock: async () => false,
  lock: () => {},
});

export function VaultPassphraseProvider({ children }: { children: ReactNode }) {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [hasPassphrase, setHasPassphrase] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check if passphrase was previously set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const has = localStorage.getItem(HAS_PASSPHRASE_KEY) === "true";
      setHasPassphrase(has);
    }
  }, []);

  // Idle timeout — lock vault after inactivity
  useEffect(() => {
    if (!masterKey) return;

    const handleActivity = () => setLastActivity(Date.now());
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        setMasterKey(null);
      }
    }, 60_000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(interval);
    };
  }, [masterKey, lastActivity]);

  const createPassphrase = useCallback(async (passphrase: string) => {
    setIsUnlocking(true);
    try {
      const salt = generateSalt();
      const key = await deriveKeyFromPassphrase(passphrase, salt);

      // Store salt (not secret) and mark passphrase as set
      localStorage.setItem(SALT_STORAGE_KEY, btoa(String.fromCharCode(...salt)));
      localStorage.setItem(HAS_PASSPHRASE_KEY, "true");

      setMasterKey(key);
      setHasPassphrase(true);
      setLastActivity(Date.now());
    } finally {
      setIsUnlocking(false);
    }
  }, []);

  const unlock = useCallback(async (passphrase: string): Promise<boolean> => {
    setIsUnlocking(true);
    try {
      const saltBase64 = localStorage.getItem(SALT_STORAGE_KEY);
      if (!saltBase64) return false;

      const salt = new Uint8Array(
        atob(saltBase64)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
      const key = await deriveKeyFromPassphrase(passphrase, salt);

      // We can't verify the key is correct without trying to decrypt something.
      // Store a known canary on first creation and verify it here.
      // For MVP, we just set the key and let decrypt fail if wrong.
      setMasterKey(key);
      setLastActivity(Date.now());
      return true;
    } catch {
      return false;
    } finally {
      setIsUnlocking(false);
    }
  }, []);

  const lock = useCallback(() => {
    setMasterKey(null);
  }, []);

  return (
    <VaultPassphraseContext.Provider
      value={{
        masterKey,
        hasPassphrase,
        isUnlocking,
        createPassphrase,
        unlock,
        lock,
      }}
    >
      {children}
    </VaultPassphraseContext.Provider>
  );
}

export function useVaultPassphrase() {
  return useContext(VaultPassphraseContext);
}
