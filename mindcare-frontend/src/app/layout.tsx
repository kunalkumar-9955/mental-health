import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "MindCare AI - Your AI Mental Health Companion",
  description: "Advanced AI-powered mental health therapist. Get personalized emotional support, mood tracking, crisis detection, and therapy sessions with our compassionate AI companion.",
  keywords: "mental health, AI therapist, emotional support, mood tracking, anxiety relief, depression support",
  openGraph: {
    title: "MindCare AI - Your AI Mental Health Companion",
    description: "Advanced AI-powered mental health support platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="animated-bg min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 10, 30, 0.95)',
              color: '#fff',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              backdropFilter: 'blur(20px)',
            },
            success: {
              iconTheme: { primary: '#7C3AED', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
