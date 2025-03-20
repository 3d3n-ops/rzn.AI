import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-switcher";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b dark:border-gray-800 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
            ryznAI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link href="/sign-in\[[...sign-in]]">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up\[[...sign-up]]">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
