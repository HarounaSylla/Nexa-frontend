import { SignUp } from "@clerk/nextjs";

import { AuthLayout } from "@/components/brand/auth-layout";
import { clerkAppearance } from "@/components/brand/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
