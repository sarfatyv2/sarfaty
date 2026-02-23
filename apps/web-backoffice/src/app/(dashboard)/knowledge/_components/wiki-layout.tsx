'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Plus,
  Search,
  ArrowLeft,
  Layers,
  Pencil,
  Trash2,
  Globe,
  FileEdit,
  Loader2,
  Hash,
  Calendar,
  Tag,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  Button,
  Input,
  Label,
  Textarea,
  RichTextEditor,
  ScrollArea,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge,
  cn,
} from '@nexus/ui';
import type { WikiCategory, WikiArticle } from '@nexus/types';

const WIKI_ARTICLE_SKELETONS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildCategoryTree(categories: WikiCategory[]): WikiCategory[] {
  const map = new Map<string, WikiCategory>();
  const roots: WikiCategory[] = [];
  for (const category of categories) {
    map.set(category.id, { ...category, children: [] });
  }
  for (const category of categories) {
    const node = map.get(category.id);
    if (!node) continue;
    if (category.parentId && map.has(category.parentId)) {
      const parent = map.get(category.parentId);
      if (!parent) continue;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function CategoryNode({
  category,
  selectedCategoryId,
  onSelect,
  depth = 0,
}: {
  category: WikiCategory;
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedCategoryId === category.id;
  const hasChildren = (category.children?.length ?? 0) > 0;

  return (
    <div>
      <div className="flex items-center group/cat">
        <button
          type="button"
          onClick={() => onSelect(category.id)}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          className={cn(
            'flex-1 flex items-center gap-2 pr-2 py-1.5 rounded-lg text-[13px] transition-all duration-150 text-left',
            isSelected
              ? 'bg-[hsl(150,50%,10%)] text-white font-medium'
              : 'text-[hsl(150,15%,40%)] hover:bg-[hsl(150,30%,96%)] hover:text-[hsl(150,50%,15%)]',
          )}
        >
          <Hash className={cn('w-3 h-3 flex-shrink-0', isSelected ? 'text-white/60' : 'text-[hsl(150,20%,65%)]')} />
          <span className="truncate">{category.name}</span>
        </button>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0 mr-1"
          >
            {expanded
              ? <ChevronDown className="w-3 h-3" />
              : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {category.children?.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  onClick,
  canEdit,
  onEdit,
  onDelete,
}: {
  article: WikiArticle;
  onClick: (slug: string) => void;
  canEdit: boolean;
  onEdit: (article: WikiArticle) => void;
  onDelete: (article: WikiArticle) => void;
}) {
  const isDraft = article.status === 'draft';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(article.slug)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(article.slug); }}
      className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 hover:border-[hsl(150,30%,70%)] hover:shadow-sm transition-all duration-200 text-left w-full cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[hsl(150,50%,10%)]/8 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[hsl(150,50%,20%)]" />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isDraft && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
              Rascunho
            </span>
          )}
          {canEdit && (
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(article); }}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(article); }}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="font-semibold text-sm leading-snug text-foreground group-hover:text-[hsl(150,50%,20%)] transition-colors line-clamp-2 flex-1">
        {article.title}
      </p>
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {new Date(article.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

function CreateCategoryDialog({
  open,
  onClose,
  categories,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  categories: WikiCategory[];
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManual) setSlug(slugify(value));
  };

  const handleClose = () => {
    setName(''); setSlug(''); setDescription(''); setParentId(''); setSlugManual(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) { toast.error('Nome e slug são obrigatórios'); return; }
    setSaving(true);
    try {
      await api.post('/wiki/categories', {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
      });
      toast.success('Categoria criada');
      onCreated();
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar categoria');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Nome</Label>
            <Input id="cat-name" placeholder="Ex: Processos Internos" value={name} onChange={(e) => handleNameChange(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input id="cat-slug" placeholder="processos-internos" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }} />
            <p className="text-xs text-muted-foreground">Somente letras minúsculas, números e hifens.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Descrição (opcional)</Label>
            <Textarea id="cat-desc" placeholder="Breve descrição..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <Label>Categoria pai (opcional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger><SelectValue placeholder="Nenhuma (categoria raiz)" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim() || !slug.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ArticleEditor({
  article,
  categories,
  defaultCategoryId,
  onSaved,
  onCancel,
}: {
  article: WikiArticle | null;
  categories: WikiCategory[];
  defaultCategoryId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = article !== null;
  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? defaultCategoryId ?? '');
  const [content, setContent] = useState<unknown>(article?.content ?? null);
  const [slugManual, setSlugManual] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManual) setSlug(slugify(value));
  };

  const handleSave = async (publish = false) => {
    if (!title.trim() || !slug.trim() || !categoryId) {
      toast.error('Título, slug e categoria são obrigatórios');
      return;
    }
    if (publish) setPublishing(true);
    else setSaving(true);
    try {
      const payload = { title: title.trim(), slug: slug.trim(), categoryId, content, ...(publish ? { status: 'published' } : {}) };
      if (isEditing) {
        await api.patch(`/wiki/articles/${article.id}`, payload);
        toast.success(publish ? 'Artigo publicado' : 'Artigo salvo');
      } else {
        await api.post('/wiki/articles', publish ? { ...payload, status: 'published' } : payload);
        toast.success(publish ? 'Artigo criado e publicado' : 'Rascunho criado');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar artigo');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b flex items-center justify-between gap-4 bg-muted/20 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2.5" onClick={onCancel}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Button>
          <div className="w-px h-4 bg-border" />
          <span className="text-sm font-medium truncate text-foreground/80">
            {isEditing ? article.title : 'Novo Artigo'}
          </span>
          {isEditing && (
            <Badge variant={article.status === 'published' ? 'default' : 'secondary'} className="text-[10px] h-5 flex-shrink-0">
              {article.status === 'published' ? 'Publicado' : 'Rascunho'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => void handleSave(false)} disabled={saving || publishing}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileEdit className="w-3.5 h-3.5" />}
            Salvar rascunho
          </Button>
          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => void handleSave(true)} disabled={saving || publishing}>
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            {isEditing && article.status === 'published' ? 'Atualizar' : 'Publicar'}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-6 py-5 max-w-3xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="art-title">Título</Label>
              <Input id="art-title" placeholder="Título do artigo" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="text-base font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="art-slug">Slug</Label>
              <Input id="art-slug" placeholder="titulo-do-artigo" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <div className="rounded-lg border overflow-hidden">
              <RichTextEditor value={content} onChange={setContent} minHeight="420px" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function DeleteArticleDialog({ article, onClose, onDeleted }: { article: WikiArticle | null; onClose: () => void; onDeleted: () => void; }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!article) return;
    setDeleting(true);
    try {
      await api.delete(`/wiki/articles/${article.id}`);
      toast.success('Artigo excluído');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Dialog open={!!article} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Excluir artigo</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir <strong>"{article?.title}"</strong>? Esta ação não pode ser desfeita.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WikiLayout({ canEdit }: { canEdit: boolean }) {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null | undefined>(undefined);
  const [deletingArticle, setDeletingArticle] = useState<WikiArticle | null>(null);

  const loadCategories = useCallback(async () => {
    const res = await api.get<WikiCategory[]>('/wiki/categories');
    setCategories(res.data ?? []);
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<WikiArticle[]>('/wiki/articles', {
        categoryId: selectedCategoryId ?? undefined,
        search: search || undefined,
        pageSize: 50,
      });
      setArticles(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, search]);

  useEffect(() => { void loadCategories(); }, [loadCategories]);
  useEffect(() => { void loadArticles(); }, [loadArticles]);

  const openArticle = async (slug: string) => {
    setLoadingArticle(true);
    try {
      const res = await api.get<WikiArticle>(`/wiki/articles/${slug}`);
      setSelectedArticle(res.data);
    } catch {
      toast.error('Artigo não encontrado');
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleArticleSaved = () => {
    setEditingArticle(undefined);
    void loadArticles();
    void loadCategories();
  };

  const categoryTree = buildCategoryTree(categories);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const isEditorOpen = editingArticle !== undefined;

  function renderMainContent() {
    if (isEditorOpen) {
      return (
        <ArticleEditor
          article={editingArticle}
          categories={categories}
          defaultCategoryId={selectedCategoryId}
          onSaved={handleArticleSaved}
          onCancel={() => setEditingArticle(undefined)}
        />
      );
    }
    if (selectedArticle) {
      return renderArticleReader(selectedArticle);
    }
    return renderArticleList();
  }

  function renderArticleReader(article: WikiArticle) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          {canEdit && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setEditingArticle(article)}>
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {loadingArticle ? (
              <div className="space-y-4">
                <Skeleton className="h-9 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-48 rounded" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    {article.status === 'draft' && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                        Rascunho
                      </span>
                    )}
                    {article.category && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[hsl(150,30%,95%)] text-[hsl(150,40%,30%)] border border-[hsl(150,25%,87%)] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight mb-3">
                    {article.title}
                  </h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Atualizado em {new Date(article.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="mt-5 border-b border-border/60" />
                </div>
                <div className="prose-article">
                  <RichTextEditor value={article.content} readOnly toolbar={false} minHeight="200px" />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  function renderArticleList() {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 py-3.5 border-b border-border/60 bg-white flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground truncate">
                {selectedCategory ? selectedCategory.name : 'Todos os artigos'}
              </h2>
              {!loading && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {articles.length} {articles.length === 1 ? 'artigo' : 'artigos'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar artigos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 w-52 text-sm bg-muted/40 border-border/60 focus:bg-white"
                />
              </div>
              {canEdit && (
                <Button size="sm" className="h-8 gap-1.5 text-xs bg-[hsl(150,50%,10%)] hover:bg-[hsl(150,50%,15%)]" onClick={() => setEditingArticle(null)}>
                  <Plus className="w-3.5 h-3.5" />
                  Novo Artigo
                </Button>
              )}
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-5">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {WIKI_ARTICLE_SKELETONS.map((k) => <Skeleton key={k} className="h-28 rounded-xl" />)}
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 border border-border/40">
                  <FolderOpen className="w-7 h-7 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-semibold text-foreground/70">Nenhum artigo encontrado</p>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
                  {search ? `Sem resultados para "${search}"` : 'Esta seção ainda não tem artigos publicados.'}
                </p>
                {canEdit && (
                  <Button variant="outline" size="sm" className="mt-5 gap-1.5 text-xs" onClick={() => setEditingArticle(null)}>
                    <Plus className="w-3.5 h-3.5" />
                    Criar primeiro artigo
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={openArticle}
                    canEdit={canEdit}
                    onEdit={(a) => setEditingArticle(a)}
                    onDelete={(a) => setDeletingArticle(a)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">

      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col border-r border-border/60 bg-[hsl(150,25%,97%)]">
        {/* Logo/Title */}
        <div className="px-4 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[hsl(150,50%,10%)] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[hsl(150,50%,12%)] leading-tight">Base de Conhecimento</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-2.5 py-3">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => { setSelectedCategoryId(null); setSelectedArticle(null); setEditingArticle(undefined); }}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150',
                selectedCategoryId === null
                  ? 'bg-[hsl(150,50%,10%)] text-white font-medium'
                  : 'text-[hsl(150,15%,40%)] hover:bg-[hsl(150,30%,93%)] hover:text-[hsl(150,50%,15%)]',
              )}
            >
              <Layers className={cn('w-3.5 h-3.5 flex-shrink-0', selectedCategoryId === null ? 'text-white/70' : 'text-[hsl(150,20%,60%)]')} />
              <span>Todos os artigos</span>
            </button>

            {categoryTree.length > 0 && (
              <div className="pt-3">
                <p className="px-2.5 text-[10px] font-bold text-[hsl(150,15%,55%)] uppercase tracking-widest mb-1.5">
                  Categorias
                </p>
                <div className="space-y-0.5">
                  {categoryTree.map((category) => (
                    <CategoryNode
                      key={category.id}
                      category={category}
                      selectedCategoryId={selectedCategoryId}
                      onSelect={(id) => { setSelectedCategoryId(id); setSelectedArticle(null); setEditingArticle(undefined); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {canEdit && (
          <div className="p-2.5 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1.5 text-xs h-8 text-[hsl(150,20%,45%)] hover:text-[hsl(150,50%,15%)] hover:bg-[hsl(150,30%,93%)]"
              onClick={() => setShowCreateCategory(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Categoria
            </Button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {renderMainContent()}
      </div>

      <CreateCategoryDialog
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        categories={categories}
        onCreated={() => void loadCategories()}
      />

      <DeleteArticleDialog
        article={deletingArticle}
        onClose={() => setDeletingArticle(null)}
        onDeleted={() => { void loadArticles(); setSelectedArticle(null); }}
      />
    </div>
  );
}
