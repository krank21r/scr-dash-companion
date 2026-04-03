import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2, ExternalLink, Plus, Trash2, Edit3, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Weblink {
  id: string;
  title: string;
  url: string;
  category: string;
}

const Weblinks = () => {
  const navigate = useNavigate();
  const [weblinks, setWeblinks] = useState<Weblink[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", url: "", category: "" });

  const loadWeblinks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "weblinks"));
      const links: Weblink[] = [];
      querySnapshot.forEach((doc) => {
        links.push({ id: doc.id, ...doc.data() } as Weblink);
      });
      setWeblinks(links);
    } catch (error) {
      console.error("Error fetching weblinks:", error);
    }
  };

  useEffect(() => {
    loadWeblinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    try {
      if (editingId) {
        const docRef = doc(db, "weblinks", editingId);
        await deleteDoc(docRef);
      }
      await addDoc(collection(db, "weblinks"), {
        title: formData.title,
        url: formData.url,
        category: formData.category || "General",
        createdAt: new Date()
      });
      setFormData({ title: "", url: "", category: "" });
      setShowForm(false);
      setEditingId(null);
      loadWeblinks();
    } catch (error) {
      console.error("Error saving weblink:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "weblinks", id));
      loadWeblinks();
    } catch (error) {
      console.error("Error deleting weblink:", error);
    }
  };

  const handleEdit = (link: Weblink) => {
    setFormData({ title: link.title, url: link.url, category: link.category });
    setEditingId(link.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 group">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="h-14 w-14 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-500 active:scale-95"
          >
            <ArrowLeft size={24} />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
              Weblinks
            </h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
              Quick Access Resources
            </p>
          </div>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: "", url: "", category: "" }); }}
          className="btn-primary-glow h-12 px-6 rounded-2xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Link
        </Button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-none shadow-premium-shadow overflow-hidden"
        >
          <div className="bg-slate-900 p-6 border-b border-white/5">
            <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans'] uppercase">
              {editingId ? "Edit Link" : "Add New Link"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-8 bg-white space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter link title"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Official, Reference"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" className="btn-primary-glow h-12 px-8 rounded-xl font-bold">
                {editingId ? "Update Link" : "Save Link"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }} className="h-12 px-8 rounded-xl font-bold text-slate-500">
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weblinks.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Globe size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{link.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{link.category}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3 truncate">{link.url}</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  Open
                </a>
                <button
                  onClick={() => handleEdit(link)}
                  className="h-9 w-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="h-9 w-9 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {weblinks.length === 0 && !showForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Link2 size={28} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No weblinks yet</h3>
          <p className="text-slate-500 mt-2">Add your first resource link to get started</p>
          <Button 
            onClick={() => setShowForm(true)}
            className="mt-6 h-12 px-8 rounded-xl font-bold"
          >
            <Plus size={18} className="mr-2" />
            Add First Link
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Weblinks;
