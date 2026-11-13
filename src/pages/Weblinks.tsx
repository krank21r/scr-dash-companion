import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Search,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

interface Weblink {
  id: string;
  title: string;
  url: string;
  category: string;
}

const toSafeUrl = (raw: string): string | null => {
  const value = raw.trim();
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

const Weblinks = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [weblinks, setWeblinks] = useState<Weblink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Weblink | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", url: "", category: "" });

  const loadWeblinks = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "weblinks"));
      const links: Weblink[] = [];
      querySnapshot.forEach((d) => {
        links.push({ id: d.id, ...d.data() } as Weblink);
      });
      setWeblinks(links);
    } catch (error) {
      console.error("Error fetching weblinks:", error);
      toast({
        title: "Could not load links",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadWeblinks();
  }, [loadWeblinks]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    weblinks.forEach((l) => {
      if (l.category?.trim()) set.add(l.category.trim());
    });
    return Array.from(set).sort();
  }, [weblinks]);

  const filteredLinks = useMemo(() => {
    return weblinks.filter((link) => {
      const matchesCategory =
        selectedCategory === "all" || link.category?.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        link.title?.toLowerCase().includes(q) ||
        link.url?.toLowerCase().includes(q) ||
        link.category?.toLowerCase().includes(q)
      );
    });
  }, [weblinks, selectedCategory, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formData.title.trim();
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const safeUrl = toSafeUrl(formData.url);
    if (!safeUrl) {
      toast({
        title: "Invalid URL",
        description: "Enter a valid link starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        url: safeUrl,
        category: formData.category.trim() || "General",
      };
      if (editingId) {
        await updateDoc(doc(db, "weblinks", editingId), payload);
        toast({ title: "Link updated successfully" });
      } else {
        await addDoc(collection(db, "weblinks"), { ...payload, createdAt: new Date() });
        toast({ title: "Link added successfully" });
      }
      setFormData({ title: "", url: "", category: "" });
      setShowForm(false);
      setEditingId(null);
      await loadWeblinks();
    } catch (error) {
      console.error("Error saving weblink:", error);
      toast({
        title: "Could not save link",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "weblinks", deleteTarget.id));
      toast({ title: "Link deleted" });
      await loadWeblinks();
    } catch (error) {
      console.error("Error deleting weblink:", error);
      toast({
        title: "Could not delete link",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Link copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-400 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-all"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Railway Web Portals &amp; Links
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {filteredLinks.length} Links
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Quick access directory for Indian Railways portals, databases &amp; departmental tools
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search portal or link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs rounded-xl border-slate-200/80 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {isAdmin && (
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ title: "", url: "", category: "" });
              }}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus size={15} />
              <span>Add Resource</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-teal-700 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Resources ({weblinks.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal/Drawer */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 border-b border-white/5 flex items-center justify-between text-white">
            <h3 className="font-bold text-sm tracking-tight">
              {editingId ? "Edit Resource Link" : "Add New Railway Resource Link"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="weblink-title"
                  className="text-xs font-semibold text-slate-700"
                >
                  Resource / Portal Title *
                </label>
                <Input
                  id="weblink-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. FOIS, IREPS, CRIS Portal, IPAS"
                  maxLength={200}
                  className="h-10 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="weblink-category"
                  className="text-xs font-semibold text-slate-700"
                >
                  Category
                </label>
                <Input
                  id="weblink-category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Official, Financial, Technical, HRMS"
                  maxLength={100}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="weblink-url" className="text-xs font-semibold text-slate-700">
                URL Address *
              </label>
              <Input
                id="weblink-url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.indianrail.gov.in"
                className="h-10 rounded-xl text-xs font-mono"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={saving} className="btn-primary h-9 px-5 rounded-xl text-xs font-semibold">
                {saving ? "Saving..." : editingId ? "Update Link" : "Save Resource"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-500"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid of Links (Animation preserved) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-8 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
            <Link2 size={24} />
          </div>
          <h2 className="text-sm font-bold text-slate-800">No Web Links Found</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No resources match "${searchQuery}".`
              : "No web portals have been registered in this category yet."}
          </p>
          {isAdmin && (
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ title: "", url: "", category: "" });
              }}
              className="btn-primary h-8 px-4 text-xs font-semibold rounded-xl mt-4 mx-auto"
            >
              <Plus size={14} className="mr-1" />
              Add First Link
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link, index) => {
            const safeHref = toSafeUrl(link.url);
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/60 group-hover:scale-105 transition-transform">
                        <Globe size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">
                          {link.title}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mt-1">
                          {link.category || "General"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-400 mt-3 truncate bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    {link.url}
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 pt-0 border-t border-slate-100 mt-2">
                  {safeHref ? (
                    <a
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors"
                    >
                      <span>Open Link</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="flex-1 flex items-center justify-center h-8 rounded-xl bg-slate-50 text-slate-400 text-xs font-semibold">
                      Invalid link
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(link.id, link.url)}
                    className="h-8 w-8 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === link.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(link.id);
                          setFormData({ title: link.title, url: link.url, category: link.category });
                          setShowForm(true);
                        }}
                        aria-label={`Edit ${link.title}`}
                        className="h-8 w-8 rounded-xl bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-center transition-colors"
                        title="Edit link"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(link)}
                        aria-label={`Delete ${link.title}`}
                        className="h-8 w-8 rounded-xl bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                        title="Delete link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this web resource?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed from the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Weblinks;
