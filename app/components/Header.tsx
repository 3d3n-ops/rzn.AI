import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-switcher";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export function Header() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleSignInClick = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in[[...sign-in]]");
    }
  };

  const handleRegisterClick = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up[[...sign-up]]");
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b dark:border-gray-800 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={handleLogoClick}
          className="text-xl font-semibold cursor-pointer"
        >
          <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
            ryznAI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isSignedIn ? (
            <Button onClick={handleSignInClick}>
              Return to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSignInClick}>
                Sign in
              </Button>
              <Button onClick={handleRegisterClick}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
