import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Header } from "@/components/Header";

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-dark text-white">
            <Header />
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
