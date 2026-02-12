import { ThemeProvider } from "@/components/providers/theme-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force light mode for public pages (they use hardcoded light colors)
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <div  className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );
}
