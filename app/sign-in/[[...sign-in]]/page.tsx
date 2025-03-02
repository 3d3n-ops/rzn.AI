"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-slate-800 hover:bg-slate-900",
            footerActionLink: "text-slate-800 hover:text-slate-900",
          },
        }}
      />
    </div>
  );
}
