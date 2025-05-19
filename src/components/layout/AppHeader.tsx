
import { LogoIcon } from '@/components/icons/LogoIcon';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowUpFromLine } from 'lucide-react';

interface AppHeaderProps {
  onGoUp?: () => void;
  canGoUp?: boolean;
}

export function AppHeader({ onGoUp, canGoUp }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <LogoIcon className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">OrgWeaver</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {canGoUp && onGoUp && (
          <Button onClick={onGoUp} variant="outline" size="sm">
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Go Up
          </Button>
        )}
        {/* Future: Add user profile/settings dropdown here */}
      </div>
    </header>
  );
}
