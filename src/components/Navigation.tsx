import { Button } from "./ui/button";

export function Navigation() {
  return (
    <nav className="flex w-full max-w-screen-xl mx-auto justify-between items-center px-16 py-6">
      {/* SafeScale Brand */}
      <div className="font-general-sans font-bold text-2xl text-white italic">
        SafeScale
      </div>
      
      {/* Navigation Links */}
      <div className="flex items-center gap-9">
        <a 
          href="#features" 
          className="text-text-secondary font-space-grotesk text-base font-medium hover:text-white transition-colors"
        >
          Features
        </a>
        <a 
          href="#how-it-works" 
          className="text-text-secondary font-space-grotesk text-base font-medium hover:text-white transition-colors"
        >
          How it Works
        </a>
        <a 
          href="#coffee" 
          className="text-text-secondary font-space-grotesk text-base font-medium hover:text-white transition-colors"
        >
          Buy Me a Coffee
        </a>
      </div>
      
      {/* Get Started Button */}
      <Button 
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-white font-space-grotesk font-bold text-xl px-6 py-4 rounded-xl"
      >
        Get Started
      </Button>
    </nav>
  );
}
