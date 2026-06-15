import ToolForm from '@/components/ToolForm';
import { getUserRole } from '@/utils/auth';

export const metadata = {
  title: 'Nový nástroj | AI Tool Hub',
};

export default async function NewToolPage() {
  const role = await getUserRole();

  return (
    <div className="container">
      <div className="form-page">
        <h1>{role === 'admin' ? 'Přidat nový nástroj' : 'Navrhnout nový nástroj'}</h1>
        <p className="subtitle">
          {role === 'admin'
            ? 'Vyplňte informace o AI nástroji pro zařazení do katalogu.'
            : 'Vyplňte informace o nástroji, který chcete navrhnout. Po schválení administrátorem bude zařazen do katalogu.'}
        </p>
        <ToolForm />
      </div>
    </div>
  );
}
