import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = { title: "CampusFind | Lost & Found", description: "A simple campus lost and found service." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthProvider><AppHeader /><main>{children}</main><footer className="site-footer"><div className="container footer-inner"><span>CampusFind · Campus Lost & Found</span><span>Built for the university community</span></div></footer></AuthProvider></body></html>;
}
