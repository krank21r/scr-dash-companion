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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add New Note</h1>
              <p className="text-sm text-slate-500">Create and save a new note</p>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm p-6">
          {saved && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Note saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <Textarea
            placeholder="Enter your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={8}
            className="rounded-xl border-slate-200 focus:border-violet-300 focus:ring-violet-200 resize-none"
          />

          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveNote} className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 rounded-xl">
              <Save size={16} className="mr-2" />
              Save Note
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddNote;