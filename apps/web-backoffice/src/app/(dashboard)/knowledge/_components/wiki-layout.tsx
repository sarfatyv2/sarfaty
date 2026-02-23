'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  Plus,
  Search,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  Button,
  Input,
  RichTextEditor,
  ScrollArea,
  Skeleton,
  cn,
} from '@nexus/ui';
import type { WikiCategory, WikiArticle } from '@nexus/types';

const WIKI_ARTICLE_SKELETONS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];

function buildCategoryTree(categories: WikiCategory[]): WikiCategory[] {
  const map = new Map<string, WikiCategory>();
  const roots: WikiCategory[] = [];

  for (const category of categories) {
    map.set(category.id, { ...category, children: [] });
  }

  for (const category of categories) {
    const node = map.get(category.id)!;
    if (category.parentId && map.has(category.parentId)) {
      const parent = map.get(category.parentId)!;
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
  const isSelected = selectedCategoryId === category.id;
  const hasChildren = (category.children?.length ?? 0) > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(category.id)}
        style={{ paddingLeft: `${depth > 0 ? 12 + depth * 14 : 10}px` }}
        className={cn(
          'group w-full flex items-center gap-2 pr-3 py-1.5 rounded-lg text-sm transition-all duration-150',
          isSelected
            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {hasChildren ? (
          <ChevronRight className={cn('w-3.5 h-3.5 flex-shrink-0', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground/50')} />
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        <span className="truncate">{category.name}</span>
      </button>
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
  );
}

function ArticleCard({
  article,
  onClick,
}: {
  article: WikiArticle;
  onClick: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(article.slug)}
      className="group w-full text-left rounded-xl border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Atualizado em {new Date(article.updatedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
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
        status: 'published',
        pageSize: 50,
      });
      setArticles(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, search]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

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

  const categoryTree = buildCategoryTree(categories);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] rounded-xl border bg-card overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-60 shrink-0 flex flex-col border-r bg-muted/30">
        <div className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">Base de Conhecimento</span>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2 py-3">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => { setSelectedCategoryId(null); setSelectedArticle(null); }}
              className={cn(
                'group w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
                selectedCategoryId === null
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Todos os artigos</span>
            </button>

            {categoryTree.length > 0 && (
              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1">
                  Categorias
                </p>
                <div className="space-y-0.5">
                  {categoryTree.map((category) => (
                    <CategoryNode
                      key={category.id}
                      category={category}
                      selectedCategoryId={selectedCategoryId}
                      onSelect={(id) => { setSelectedCategoryId(id); setSelectedArticle(null); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {canEdit && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={() => toast.info('Em desenvolvimento')}
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Categoria
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedArticle ? (
          <>
            <div className="px-6 py-4 border-b flex items-center gap-4 bg-background/50">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedArticle(null)}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div className="w-px h-5 bg-border" />
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight truncate">{selectedArticle.title}</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Atualizado em {new Date(selectedArticle.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="px-8 py-6 max-w-3xl">
                {loadingArticle ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                ) : (
                  <RichTextEditor
                    value={selectedArticle.content}
                    readOnly
                    toolbar={false}
                    minHeight="300px"
                  />
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <div className="px-6 py-4 border-b bg-background/50">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate">
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
                      placeholder="Buscar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-8 w-48 text-sm"
                    />
                  </div>
                  {canEdit && (
                    <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => toast.info('Em desenvolvimento')}>
                      <Plus className="w-3.5 h-3.5" />
                      Novo Artigo
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {WIKI_ARTICLE_SKELETONS.map((k) => (
                      <Skeleton key={k} className="h-24 rounded-xl" />
                    ))}
                  </div>
                ) : articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <FolderOpen className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Nenhum artigo publicado</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {search ? `Sem resultados para "${search}"` : 'Esta categoria ainda não tem artigos.'}
                    </p>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-1.5 text-xs"
                        onClick={() => toast.info('Em desenvolvimento')}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Criar artigo
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
