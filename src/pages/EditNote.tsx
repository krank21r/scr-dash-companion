import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { notesCollection } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { ArrowLeft, Save, FileText, CheckCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditNote = () => {
  const { id } = useParams();
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError('Note identifier missing from stream.');
        setLoading(false);
        return;
      }
      try {
        const noteRef = doc(notesCollection, id);
        const noteSnap = await getDoc(noteRef);
        if (noteSnap.exists()) {
          setNoteText(noteSnap.data().text);
        } else {
          setError('Registry entry not found.');
        }
      } catch (e) {
        setError('Failed to fetch ledger data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      setError('Content required for synchronization.');
      return;
    }
    if (!id) return;
    try {
      setLoading(true);
      const noteRef = doc(notesCollection, id);
      await updateDoc(noteRef, {
        text: noteText,
        updatedAt: new Date()
      });
      setError('');
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate(-1);
      }, 1500);
    } catch (e) {
      setError('Update failed: Logic layer timeout.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !noteText) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
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
            Refine Memo
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></span>
            Entry Revision Protocol
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-none shadow-premium-shadow overflow-hidden"
      >
        <div className="bg-slate-900 p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <RefreshCcw size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans'] uppercase">Memo Patch</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">ID: {id?.slice(0, 12)}</p>
            </div>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
              >
                Patched Successfully
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-10 bg-white space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Memo Content *</label>
             <Textarea
              placeholder="Refine the recorded note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[220px] rounded-[1.5rem] border-slate-100 bg-slate-50/50 p-6 focus-visible:bg-white focus-visible:ring-indigo-500/10 transition-all font-medium text-lg leading-relaxed shadow-inner"
              autoFocus
             />
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
            <Button 
              onClick={handleSaveNote} 
              disabled={loading}
              className="btn-primary-glow flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base shadow-xl transition-all hover:-translate-y-1 active:scale-95 group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronizing...
                </div>
              ) : (
                <>
                  <Save size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  Apply Revisions
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-14 px-10 rounded-2xl font-black text-slate-400 border-slate-100 hover:bg-slate-50"
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditNote;