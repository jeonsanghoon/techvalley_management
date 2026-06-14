import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PrevNextNav } from "@/components/PrevNextNav";
import { TableOfContents } from "@/components/TableOfContents";
import { loadDocPage } from "@/lib/docs";
import { getAdjacentDocs, getAllDocEntries, getDocBySlug } from "@/lib/manifest";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllDocEntries().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getDocBySlug(slug);
  const page = loadDocPage(slug);
  if (!meta || !page) return { title: "문서 없음" };
  return {
    title: page.title,
    description: page.description || `${meta.group.title} — ${page.rel}`,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const meta = getDocBySlug(slug);
  const page = loadDocPage(slug);
  if (!meta || !page) notFound();

  const { prev, next } = getAdjacentDocs(slug);
  const docLabel = meta.label ?? page.title;

  return (
    <PageMain className="!px-4 !py-4 sm:!px-5 md:!px-6 lg:!py-6 xl:!px-8">
      <div className="mx-auto w-full max-w-[1480px]">
        <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: docLabel }]} />

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="font-mono text-[11px] text-navy/70">02.arch/{page.rel}</span>
          <span>·</span>
          <span>약 {page.readingMinutes}분</span>
          {meta.generated && (
            <>
              <span>·</span>
              <span className="text-accent">자동 생성</span>
            </>
          )}
        </div>

        <TableOfContents items={page.toc} variant="mobile" />

        <div className="mt-4 grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_13rem] 2xl:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="min-w-0 rounded-xl border border-border bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-7 md:px-8">
            <MarkdownContent content={page.content} />
            <PrevNextNav prev={prev} next={next} />
          </div>

          <aside className="hidden min-w-0 lg:block">
            <TableOfContents items={page.toc} variant="sidebar" />
          </aside>
        </div>
      </div>
    </PageMain>
  );
}
