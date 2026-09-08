import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StructuredData from "./components/StructuredData";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7c3aed',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ducmcresult.vercel.app'),
  title: {
    default: 'DU CMC Result System - Dhaka University Constituent Engineering College and Medical College',
    template: '%s | DU CMC Result System'
  },
  description: 'Check DU CMC results online. Batch result lookup for Dhaka University Constituent Engineering College and Medical College. Search by registration number, program, session, and exam.',
  keywords: [
    'DU CMC',
    'Dhaka University',
    'Constituent Medical College',
    'Result System',
    'Batch Result',
    'DU Result',
    'CMC',
    'CMC Result',
    'Engineering',
    'Engineering College',
    'Engineering College Result',
    'Nursing',
    'Medical College Result',
    'Bangladesh Education',
    'University Result',
    'DU CMC Result'
  ],
  authors: [
    { name: 'Sultanum Mobin', url: 'https://sultanum-mobin.vercel.app/' }
  ],
  creator: 'Sultanum Mobin',
  publisher: 'Dhaka University Constituent Engineering College and Medical College',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ducmcresult.vercel.app',
    siteName: 'DU CMC Result System',
    title: 'DU CMC Result System - Dhaka University Constituent Engineering College and Medical College',
    description: 'Check DU CMC results online. Batch result lookup for Dhaka University Constituent Engineering College and Medical College.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DU CMC Result System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DU CMC Result System',
    description: 'Check DU CMC results online. Batch result lookup for Dhaka University Constituent Engineering College and Medical College.',
    images: ['/og-image.jpg'],
    creator: '@smsultan76',
  },
  alternates: {
    canonical: 'https://ducmcresult.vercel.app',
  },
  category: 'Education',
  classification: 'Educational Result System',
  verification: {
    google: 'your-google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}