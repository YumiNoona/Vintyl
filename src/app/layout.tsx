import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme";
import { ReactQueryProvider } from "@/react-query";
import { Toaster } from "sonner";
// import { VoiceflowAgent } from "@/components/global/voice-flow";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vintyl",
  description: "Share AI powered videos with your friends",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground selection:bg-primary/20 selection:text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster />
            {/* <VoiceflowAgent /> */}
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
