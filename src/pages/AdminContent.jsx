import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, BookOpen, HelpCircle, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "../components/SEOHead";

const articleCategories = [
  { value: "image-compression", label: "Image Compression" },
  { value: "video-compression", label: "Video Compression" },
  { value: "audio-compression", label: "Audio Compression" },
  { value: "file-formats", label: "File Formats" },
  { value: "web-optimization", label: "Web Optimization" },
  { value: "tutorials", label: "Tutorials" },
  { value: "tips-tricks", label: "Tips & Tricks" }
];

const faqCategories = [
  { value: "General", label: "General" },
  { value: "File Support", label: "File Support" },
  { value: "Compression & Quality", label: "Compression & Quality" },
  { value: "Privacy & Security", label: "Privacy & Security" },
  { value: "Features", label: "Features" },
  { value: "Pro Plan", label: "Pro Plan" },
  { value: "Troubleshooting", label: "Troubleshooting" }
];

export default function AdminContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articles");
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser?.role !== 'admin') {
          toast.error("Access denied. Admin only.");
        }
      } catch (e) {
        toast.error("Please sign in");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => base44.entities.Article.list('-created_date', 100),
    enabled: user?.role === 'admin'
  });

  const { data: faqs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => base44.entities.FAQItem.list('category', 100),
    enabled: user?.role === 'admin'
  });

  const articleMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.Article.update(data.id, data);
      }
      return base44.entities.Article.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setShowArticleDialog(false);
      setEditingArticle(null);
      toast.success("Article saved!");
    },
    onError: (e) => toast.error(e.message)
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success("Article deleted");
    }
  });

  const faqMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.FAQItem.update(data.id, data);
      }
      return base44.entities.FAQItem.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      setShowFaqDialog(false);
      setEditingFaq(null);
      toast.success("FAQ saved!");
    },
    onError: (e) => toast.error(e.message)
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id) => base44.entities.FAQItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success("FAQ deleted");
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-slate-600 dark:text-slate-400">This page is only accessible to administrators.</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Content Management - Admin" />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage blog articles and FAQ items</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="w-4 h-4" /> Articles ({articles.length})
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2">
              <HelpCircle className="w-4 h-4" /> FAQs ({faqs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setEditingArticle({}); setShowArticleDialog(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> New Article
              </Button>
            </div>
            
            {articlesLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-3">
                {articles.map(article => (
                  <Card key={article.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{article.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {article.category} • {article.published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => { setEditingArticle(article); setShowArticleDialog(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                        if (confirm("Delete this article?")) deleteArticleMutation.mutate(article.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {articles.length === 0 && (
                  <p className="text-center py-8 text-slate-500">No articles yet</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faqs">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setEditingFaq({}); setShowFaqDialog(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> New FAQ
              </Button>
            </div>
            
            {faqsLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-3">
                {faqs.map(faq => (
                  <Card key={faq.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{faq.question}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {faq.category} • {faq.published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => { setEditingFaq(faq); setShowFaqDialog(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                        if (confirm("Delete this FAQ?")) deleteFaqMutation.mutate(faq.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {faqs.length === 0 && (
                  <p className="text-center py-8 text-slate-500">No FAQ items yet</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Article Dialog */}
        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle?.id ? "Edit Article" : "New Article"}</DialogTitle>
            </DialogHeader>
            <ArticleForm 
              article={editingArticle} 
              onSave={(data) => articleMutation.mutate(data)}
              loading={articleMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* FAQ Dialog */}
        <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingFaq?.id ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            </DialogHeader>
            <FaqForm 
              faq={editingFaq} 
              onSave={(data) => faqMutation.mutate(data)}
              loading={faqMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function ArticleForm({ article, onSave, loading }) {
  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "tutorials",
    tags: article?.tags?.join(", ") || "",
    featured_image: article?.featured_image || "",
    read_time: article?.read_time || 5,
    published: article?.published ?? true,
    id: article?.id
  });

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input 
          value={form.title} 
          onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
          placeholder="Article title"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Slug</label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-friendly-slug" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {articleCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Read Time (min)</label>
          <Input type="number" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Excerpt</label>
        <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary..." rows={2} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Content (Markdown)</label>
        <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Article content in markdown..." rows={10} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
        <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Featured Image URL</label>
        <Input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <span className="text-sm">Published</span>
        </div>
        <Button onClick={() => onSave({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) })} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Article
        </Button>
      </div>
    </div>
  );
}

function FaqForm({ faq, onSave, loading }) {
  const [form, setForm] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "General",
    order: faq?.order || 0,
    published: faq?.published ?? true,
    id: faq?.id
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Question</label>
        <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What is...?" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Answer</label>
        <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="The answer..." rows={5} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {faqCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Order</label>
          <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <span className="text-sm">Published</span>
        </div>
        <Button onClick={() => onSave(form)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save FAQ
        </Button>
      </div>
    </div>
  );
}