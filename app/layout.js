import './globals.css';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';

export const metadata = {
  title: 'Alza AI Hub',
  description: 'Interní katalog AI nástrojů pro zaměstnance Alza.cz',
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
