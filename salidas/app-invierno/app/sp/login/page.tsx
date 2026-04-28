import { redirect } from "next/navigation";

import SupervisorLoginForm from "@/components/supervisor-login-form";
import { isSupervisorAuthenticated } from "@/lib/server/supervisor-session";

export default async function SupervisorLoginPage() {
  if (await isSupervisorAuthenticated()) {
    redirect("/sp");
  }

  return <SupervisorLoginForm />;
}
