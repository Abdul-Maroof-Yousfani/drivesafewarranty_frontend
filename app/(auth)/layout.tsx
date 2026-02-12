import { ThemeProvider } from "@/components/providers/theme-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="auth-theme">
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
