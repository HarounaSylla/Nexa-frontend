import { SignIn } from "@clerk/nextjs";

import { AuthLayout } from "@/components/brand/auth-layout";
import { clerkAppearance } from "@/components/brand/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
