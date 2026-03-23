import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme";
import { ReactQueryProvider } from "@/react-query";
import { Toaster } from "sonner";
import { VoiceflowAgent } from "@/components/global/voice-flow";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vintyl",
  description: "Share AI powered videos with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} bg-[#050505] text-white selection:bg-purple-500/30`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              {children}
              <Toaster />
              <VoiceflowAgent />
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
