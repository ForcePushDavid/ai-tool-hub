import './globals.css';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { getUserRole } from '@/utils/auth';

export const metadata = {
  title: 'Alza AI Hub',
  description: 'Interní katalog AI nástrojů pro zaměstnance Alza.cz',
};

export default async function RootLayout({ children }) {
  const role = await getUserRole();

  return (
    <html lang="cs">
      <body>
        <Navbar role={role} />
        <main className="main-content">
          {children}
        </main>
        <ChatBot />
      </body>
    </html>
  );
}
