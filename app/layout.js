import './globals.css';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';

export const metadata = {
  title: 'AI Tool Hub | Firemní katalog AI nástrojů',
  description: 'Přehledný katalog AI aplikací s inteligentním chatbotem. Vyhledávejte AI nástroje, zjistěte licenční modely, bezpečnostní podmínky a tipy pro efektivní využití.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
        <ChatBot />
      </body>
    </html>
  );
}
