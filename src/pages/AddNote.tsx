import React, { useState } from 'react';
import { addDoc } from 'firebase/firestore';
import { notesCollection } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, CheckCircle } from "lucide-react";

const AddNote = () => {
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      setError('Note text cannot be empty.');
      return;
    }
    try {
      await addDoc(notesCollection, {
        text: noteText,
        createdAt: new Date()
      });
      setError('');
      setNoteText('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Failed to save note to Firestore.');
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 shrink-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 shadow-sm">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add New To-Do</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Jot down your pending tasks</p>
          </div>
        </div>
      </div>

      <Card className="premium-card p-0 border border-slate-200/60 overflow-hidden">
        <div className="bg-slate-50/50 p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            Task Details
          </h3>
        </div>
        
        <div className="p-6 bg-white space-y-5">
          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">To-Do saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
             <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-1.5 block">Task Description *</label>
             <Textarea
              placeholder="What needs to be done?"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={6}
              className="rounded-xl border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary bg-slate-50 focus-visible:bg-white text-sm transition-colors resize-none p-4"
              autoFocus
             />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={handleSaveNote} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-semibold shadow-sm transition-all">
              <Save size={18} className="mr-2" />
              Save Task
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddNote;