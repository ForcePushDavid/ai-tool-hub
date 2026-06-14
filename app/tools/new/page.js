import ToolForm from '@/components/ToolForm';
import { getUserRole } from '@/utils/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Přidat nástroj | AI Tool Hub',
};

export default async function NewToolPage() {
  const role = await getUserRole();
  if (role !== 'admin') {
    redirect('/?message=' + encodeURIComponent('Přístup odepřen: Nástroje mohou přidávat pouze administrátoři.'));
  }

  return (
    <div className="container">
      <div className="form-page">
        <h1>Přidat nový nástroj</h1>
        <p className="subtitle">Vyplňte informace o AI nástroji pro zařazení do katalogu.</p>
        <ToolForm />
      </div>
    </div>
  );
}
