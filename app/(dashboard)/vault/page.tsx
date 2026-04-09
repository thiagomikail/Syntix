import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { VaultDashboardClient } from "./VaultDashboardClient";

async function getConsentStatus(userId: string): Promise<boolean> {
  const required = ["VAULT_TOS", "DATA_PROCESSING", "CROSS_BORDER_TRANSFER"];
  const consents = await prisma.vaultConsentLog.findMany({
    where: { userId, consentType: { in: required }, granted: true },
    select: { consentType: true },
  });
  const grantedTypes = new Set(consents.map((c) => c.consentType));
  return required.every((r) => grantedTypes.has(r));
}

export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  const hasConsented = await getConsentStatus(session!.user.id);

  return <VaultDashboardClient hasConsented={hasConsented} />;
}
