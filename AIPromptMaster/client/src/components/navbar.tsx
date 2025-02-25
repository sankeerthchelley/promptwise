import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            PromptCraft
          </a>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/templates">
            <Button variant="ghost">Templates</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
