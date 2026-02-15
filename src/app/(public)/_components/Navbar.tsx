import { GitHubIcon, UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/Dashboard" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full flex h-12 justify-between border-b bg-background/60  backdrop-blur md:h-14 md:px-safe-or-6 space-x-2">
      <div className=" container min-h-16 mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Image
            src="logo.svg"
            alt="Keek Institute Logo"
            width={24}
            height={24}
            className="size-9"
          />
          <span className="font-bold">Keek Institute</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <div className="flex items-center space-x-2 ">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center justify-center space-x-4 gap-2">
          <Link href="/" target="_blank">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
            >
              <GitHubIcon />
            </Button>
          </Link>

          <ThemeToggle />
          <UserButton size="icon" />
        </div>
      </div>
    </header>
  );
}
