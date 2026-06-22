"use client";

import { useRouter } from "next/navigation";
import { Logout } from "./icons";

export default function LogoutButton({ block }: { block?: boolean }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button className={`btn btn-ghost${block ? " btn-block" : ""}`} onClick={logout}>
      <Logout /> Sign out
    </button>
  );
}
