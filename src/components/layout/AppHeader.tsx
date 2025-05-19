import { LogoIcon } from '@/components/icons/LogoIcon';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <LogoIcon className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">OrgWeaver</h1>
      </div>
      {/* Future: Add user profile/settings dropdown here */}
    </header>
  );
}
