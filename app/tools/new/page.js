import ToolForm from '@/components/ToolForm';

export const metadata = {
  title: 'Přidat nástroj | AI Tool Hub',
};

export default function NewToolPage() {
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
