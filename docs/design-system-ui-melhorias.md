# Melhorias de Design e UI — Web Backoffice

**Data:** 13 de Fevereiro de 2026  
**Documenta:** Alterações de layout, espaçamento, tipografia, responsividade e componentes.

---

## 1. Tipografia

### Fonte Inter

O sistema já utiliza a fonte **Inter** em todo o backoffice:

- **Layout raiz** (`apps/web-backoffice/src/app/layout.tsx`): `next/font/google` carrega Inter e aplica via `inter.className` no `<body>`
- **Tailwind** (`packages/config/tailwind/preset.ts`, `tailwind.config.ts`): `fontFamily.sans` definido como `['Inter', 'system-ui', 'sans-serif']`

Novos apps devem seguir o mesmo padrão: importar Inter no layout e manter `fontFamily.sans` no tema.

---

## 2. Espaçamento (Padding e Gaps)

### 2.1 Motivação

Aumentar o respiro visual entre elementos para evitar sensação de conteúdo "grudado".

### 2.2 Alterações

| Área | Antes | Depois |
|------|-------|--------|
| **Main** (área de conteúdo) | `p-6` (24px) | `p-4 sm:p-6 lg:p-10` (responsivo) |
| **Header** | `px-6` | `px-4 sm:px-6 lg:px-8` |
| **Sidebar logo** | `p-5` | `p-6` |
| **Sidebar nav** | `px-3 py-2` | `px-4 py-4` |
| **Sidebar itens** | `px-3 py-2.5` | `px-4 py-3` |
| **Cards** (CardHeader/CardContent) | `p-6` | `p-8` |
| **CardContent top** | `pt-0` | `pt-6` (espaço entre header e conteúdo) |
| **Tabelas** (TableCell, TableHead) | `p-2`, `h-10`, `px-2` | `p-4`, `h-12`, `px-4` |

### 2.3 Grids e páginas

- **Gap em grids**: `gap-4` → `gap-6`
- **Entre seções**: `space-y-6` → `space-y-8`
- **Tabs**: `mt-4` → `mt-6` entre tabs e conteúdo

Arquivos afetados: Overview, Admin Overview, Colaboradores, Usuários, Meu Time, Meu Perfil, formulários de edição, tabelas.

---

## 3. Sidebar

### 3.1 Aparência

- Remoção do setor abaixo do logo (já exibido no header)
- Logo centralizado
- Fundo: `bg-muted/30`
- Itens com `rounded-lg`, transições de 200ms
- Estado ativo: fundo `primary` sólido em vez de tom claro
- Seções com labels menores (`text-[11px]`, `tracking-widest`)

### 3.2 Responsividade

- **Desktop (≥1024px)**: Sidebar fixa à esquerda, visível sempre
- **Mobile (<1024px)**: Sidebar oculta; menu abre em Sheet deslizante da esquerda

---

## 4. Border Radius (Rounded)

### 4.1 Configuração global

**`apps/web-backoffice/src/app/globals.css`:**

```css
--radius: 0.75rem;  /* antes: 0.5rem */
```

**`apps/web-backoffice/tailwind.config.ts`:**

```ts
borderRadius: {
  sm: 'calc(var(--radius) - 4px)',   // 8px
  md: 'calc(var(--radius) - 2px)',   // 10px
  lg: 'var(--radius)',               // 12px
  xl: 'calc(var(--radius) + 4px)',   // 16px
  '2xl': 'calc(var(--radius) + 8px)', // 20px
},
```

Componentes que usam `rounded-md`, `rounded-lg`, `rounded-xl` passam a usar esses valores automaticamente.

---

## 5. Layout Responsivo

### 5.1 Componente Sheet

Novo componente em `packages/ui/src/sheet.tsx`:

- Baseado em Radix Dialog
- Variantes: `top`, `bottom`, `left`, `right`
- Usado como menu lateral no mobile
- Depende de `tailwindcss-animate` para animações

### 5.2 DashboardShell

Client component (`apps/web-backoffice/src/components/dashboard-shell.tsx`) que:

- Controla estado do menu mobile
- Renderiza Sidebar (desktop) e Sheet (mobile)
- Passa `onMenuClick` para o Header
- Define padding responsivo do main: `p-4 sm:p-6 lg:p-10`

### 5.3 Header responsivo

| Breakpoint | Hamburger | Logo | Badge setor | Nome usuário |
|------------|-----------|------|-------------|--------------|
| < lg (mobile) | ✅ | ✅ | ❌ | ❌ |
| ≥ lg (desktop) | ❌ | ❌ (sidebar) | ✅ | ✅ |

- Logo no header apenas em mobile (`lg:hidden`)
- Badge e nome do usuário ocultos em mobile (`hidden sm:inline-flex`, `hidden sm:inline`)
- Padding horizontal responsivo

### 5.4 SidebarContent

Conteúdo de navegação extraído para `sidebar-content.tsx` e reutilizado em:

- Sidebar desktop
- Sheet mobile

Em mobile, ao clicar em um link, o Sheet fecha via `onNavigate`.

### 5.5 Breakpoint principal

- **lg** (1024px): transição entre layout desktop (sidebar fixa) e mobile (Sheet + hamburger).

---

## 6. Acessibilidade

- **Sheet**: `SheetTitle` com `className="sr-only"` para leitores de tela (`Menu de navegação`)
- Evita aviso do Radix sobre Dialog sem título

---

## 7. Dependências

- **tailwindcss-animate**: adicionado em `web-backoffice` para animações do Sheet (slide-in/out, fade).

---

## 8. Estrutura de arquivos alterados/criados

```
packages/ui/
├── src/
│   ├── sheet.tsx          # NOVO
│   ├── card.tsx           # padding
│   └── table.tsx          # padding células
│   └── index.ts           # export Sheet

apps/web-backoffice/
├── src/
│   ├── app/(dashboard)/layout.tsx    # usa DashboardShell
│   ├── app/globals.css               # --radius
│   ├── components/
│   │   ├── dashboard-shell.tsx       # NOVO
│   │   ├── sidebar.tsx               # responsivo, usa SidebarContent
│   │   ├── sidebar-content.tsx       # NOVO (extraído)
│   │   └── header.tsx                # responsivo, logo mobile, hamburger
│   └── tailwind.config.ts            # borderRadius, tailwindcss-animate
└── package.json                      # tailwindcss-animate
```

---

## 9. Referências

- [shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet)
- [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Tailwind breakpoints](https://tailwindcss.com/docs/responsive-design) (sm: 640px, md: 768px, lg: 1024px)
