import type { Metadata } from 'next';
import { CreateUserForm } from '../_components/create-user-form';

export const metadata: Metadata = {
  title: 'Novo Usuário | Sarfaty',
  description: 'Criar novo usuário na plataforma',
};

export default function NewUserPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-normal">Novo Usuário</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para criar um novo usuário na plataforma
        </p>
      </div>
      <CreateUserForm />
    </div>
  );
}
