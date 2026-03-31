import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, notesCollection } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { ArrowLeft, Save, FileText, CheckCircle } from "lucide-react";

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
        setError('Note ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const noteRef = doc(notesCollection, id);
        const noteSnap = await getDoc(noteRef);
        if (noteSnap.exists()) {
          setNoteText(noteSnap.data().text);
          setLoading(false);
        } else {
          setError('Note not found.');
          setLoading(false);
        }
      } catch (e) {
        setError('Failed to fetch note.');
        console.error("Error fetching note: ", e);
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      setError('Note text cannot be empty.');
      return;
    }
    try {
      setLoading(true);
      const noteRef = doc(notesCollection, id);
      await updateDoc(noteRef, {
        text: noteText,
        updatedAt: new Date()
      });
      setError('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Failed to update note.');
      console.error("Error updating note: ", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-slate-900">Edit Note</h1>
              <p className="text-sm text-slate-500">Update your note</p>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm p-6">
          {saved && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Note updated successfully!</span>
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
            <Button onClick={handleSaveNote} disabled={loading} className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 rounded-xl">
              <Save size={16} className="mr-2" />
              {loading ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditNote;