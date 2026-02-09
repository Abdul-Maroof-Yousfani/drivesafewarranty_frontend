export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force light mode for public pages (they use hardcoded light colors)
  return <div >{children}</div>;
}
