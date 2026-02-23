'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { MessageSquare } from 'lucide-react';

export default function CommunicationModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={MessageSquare}
        name="Módulo de Comunicação"
        domain="Módulo"
        description="Centraliza a comunicação interna da Sarfaty em dois sub-módulos: Wiki (base de conhecimento corporativo com categorias, artigos em rich text e controle de versão) e Intranet (canal de comunicados da empresa para todos os colaboradores)."
        color="sky"
        gradient="bg-gradient-to-br from-[hsl(200,55%,18%)] to-[hsl(200,45%,26%)]"
        roles={[
          'todas as roles (leitura)',
          'admin, governance, hr_admin, people_manager, legal, compliance_officer (criação/edição wiki)',
          'admin, governance, hr_admin, people_manager, legal, compliance_officer (criação comunicados)',
        ]}
        flowSteps={[
          { label: 'Categoria', desc: 'Categoria da wiki criada com nome, descrição e ícone opcional. Hierarquia plana (sem sub-categorias).' },
          { label: 'Artigo', desc: 'Artigo criado com título, conteúdo em rich text (Tiptap/JSONB), categoria e tags. Status: draft ou published.' },
          { label: 'Publicação', desc: 'Artigo publicado com published_at automático. Torna-se visível para todos os roles autenticados.' },
          { label: 'Revisão', desc: 'Artigo atualizado com incremento de revision_count. Histórico preservado via last_edited_by e last_edited_at.' },
          { label: 'Comunicado', desc: 'Comunicado criado na Intranet com título, corpo em rich text, categoria e cover_image_url. Publicado imediatamente.' },
        ]}
        features={[
          'Wiki corporativa com categorias e artigos em rich text (Tiptap)',
          'Conteúdo armazenado como JSONB — serialização nativa do Tiptap',
          'Controle de versão leve: revision_count, last_edited_by, last_edited_at',
          'Tags (array) para artigos — filtragem e busca por tópico',
          'Publicação de artigos: draft → published com timestamp automático',
          'Leitura da wiki disponível para todos os 19 roles autenticados',
          'Edição e criação restritas a roles específicos (EDITOR_ROLES)',
          'canEdit derivado no server component e passado via prop',
          'RichTextEditor em @nexus/ui com suporte a formatos rich text',
          'Intranet: comunicados corporativos com categorias e cover image',
          'Canal de leitura amplo — todos os colaboradores veem comunicados',
          '6 use-cases, 2 repositories, 2 controllers, 2 mappers',
        ]}
        tables={[
          {
            name: 'comm_wiki_categories',
            description: 'Categorias da base de conhecimento corporativa.',
            keyColumns: ['id', 'name', 'slug', 'description', 'icon', 'created_by'],
          },
          {
            name: 'comm_wiki_articles',
            description: 'Artigos da wiki com conteúdo JSONB (Tiptap) e controle de versão.',
            keyColumns: ['id', 'category_id', 'title', 'slug', 'content', 'tags', 'status', 'published_at', 'revision_count', 'last_edited_by'],
          },
          {
            name: 'comm_announcements',
            description: 'Comunicados da intranet corporativa.',
            keyColumns: ['id', 'title', 'body', 'category', 'cover_image_url', 'is_pinned', 'published_at', 'author_id'],
          },
        ]}
      />
    </PageWrapper>
  );
}
