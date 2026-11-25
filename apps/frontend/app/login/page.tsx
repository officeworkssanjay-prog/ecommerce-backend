import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageLoader } from "@/components/ui/States";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginForm />
    </Suspense>
  );
}
