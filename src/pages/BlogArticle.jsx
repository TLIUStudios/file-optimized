import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import SEOHead from "../components/SEOHead";

const categoryLabels = {
  "image-compression": "Image Compression",
  "video-compression": "Video Compression", 
  "audio-compression": "Audio Compression",
  "file-formats": "File Formats",
  "web-optimization": "Web Optimization",
  "tutorials": "Tutorials",
  "tips-tricks": "Tips & Tricks"
};

export default function BlogArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => base44.entities.Article.filter({ slug, published: true }),
    enabled: !!slug,
  });

  const article = articles[0];

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', article?.category],
    queryFn: () => base44.entities.Article.filter({ 
      category: article.category, 
      published: true 
    }, '-created_date', 4),
    enabled: !!article?.category,
  });

  const filteredRelated = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Article Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link 
          to={createPageUrl('Blog')}
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${article.title} - File Optimized Blog`}
        description={article.excerpt || article.title}
        image={article.featured_image}
      />
      <article className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Link */}
        <Link 
          to={createPageUrl('Blog')}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
              {categoryLabels[article.category]}
            </span>
            {article.read_time && (
              <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                {article.read_time} min read
              </span>
            )}
            {article.created_date && (
              <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                {new Date(article.created_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-8">
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-12">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-slate-600 dark:text-slate-400 my-6">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) => inline ? (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                  {children}
                </code>
              ) : (
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-4">
                  <code>{children}</code>
                </pre>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-emerald-600 hover:text-emerald-700 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="rounded-lg my-6" />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
            <Tag className="w-4 h-4 text-slate-400" />
            {article.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Articles */}
        {filteredRelated.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {filteredRelated.map(related => (
                <Link
                  key={related.id}
                  to={createPageUrl(`BlogArticle?slug=${related.slug}`)}
                  className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-8 text-center border border-emerald-200 dark:border-emerald-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to Optimize Your Files?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Try File Optimized free - no signup required.
          </p>
          <Link
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Compressing Now
          </Link>
        </div>
      </article>
    </>
  );
}