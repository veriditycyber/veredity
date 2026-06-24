import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <div className="auth-wrap">
      <div style={{ position: "fixed", top: 20, right: 20 }}><ThemeToggle /></div>
      {children}
    </div>
  );
}
