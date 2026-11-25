import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { PageLoader } from "@/components/ui/States";

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterForm />
    </Suspense>
  );
}
