import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgenLink Pro - Pembukuan BRILink',
  description: 'Aplikasi pembukuan dan manajemen transaksi profesional untuk agen BRILink dengan antarmuka modern dan responsif.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Menggunakan CDN untuk memastikan konfigurasi custom color bri-blue tetap jalan tanpa setup postcss lokal yang kompleks */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                      bri: {
                        blue: '#00529C',
                        dark: '#00386B',
                        orange: '#F87C1D',
                        light: '#EDF5FD'
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}