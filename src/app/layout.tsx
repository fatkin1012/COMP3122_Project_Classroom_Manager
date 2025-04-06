import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub Classroom Tracker",
  description: "Track and analyze student GitHub activities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                  (localStorage.getItem('darkMode') === null && 
                  window.matchMedia('(prefers-color-scheme: dark)').matches);
                
                if (isDarkMode) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.setProperty('--background', '#111827');
                  document.documentElement.style.setProperty('--foreground', '#ffffff');
                  document.documentElement.style.setProperty('--card-background', '#1f2937');
                  document.documentElement.style.setProperty('--card-foreground', '#f3f4f6');
                  document.documentElement.style.setProperty('--text-primary', '#f9fafb');
                  document.documentElement.style.setProperty('--text-secondary', '#e5e7eb');
                  document.documentElement.style.setProperty('--text-muted', '#9ca3af');
                  document.documentElement.style.setProperty('--border-color', '#374151');
                  document.documentElement.style.backgroundColor = '#111827';
                  document.documentElement.style.color = '#ffffff';
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.style.setProperty('--background', '#ffffff');
                  document.documentElement.style.setProperty('--foreground', '#000000');
                  document.documentElement.style.setProperty('--card-background', '#ffffff');
                  document.documentElement.style.setProperty('--card-foreground', '#333333');
                  document.documentElement.style.setProperty('--text-primary', '#111827');
                  document.documentElement.style.setProperty('--text-secondary', '#4b5563');
                  document.documentElement.style.setProperty('--text-muted', '#6b7280');
                  document.documentElement.style.setProperty('--border-color', '#e5e7eb');
                  document.documentElement.style.backgroundColor = '#ffffff';
                  document.documentElement.style.color = '#000000';
                }
              } catch (e) {}
            `,
          }}
        />
        <style>
          {`
            body { 
              background-color: var(--background) !important; 
              color: var(--foreground) !important; 
            }
            * { 
              transition: background-color 0.3s ease, color 0.3s ease; 
            }
          `}
        </style>
      </head>
      <body className={`${inter.className} page-container`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
