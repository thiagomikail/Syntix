import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { VaultPassphraseProvider } from "@/components/vault/VaultPassphraseContext";
import { VaultHeader } from "@/components/vault/VaultHeader";
import { VaultSidebar } from "@/components/vault/VaultSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <VaultPassphraseProvider>
      <div className="flex min-h-screen flex-col">
        <VaultHeader />
        <div className="flex flex-1">
          <VaultSidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </VaultPassphraseProvider>
  );
}
