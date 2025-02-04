import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, notesCollection } from '../lib/firebase';

const EditNote = () => {
  const { id } = useParams(); // Get note ID from URL params
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
      alert('Note updated successfully!');
    } catch (e) {
      setError('Failed to update note.');
      console.error("Error updating note: ", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Edit Note</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <textarea
        placeholder="Enter your note here..."
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        rows={10}
        cols={50}
      />
      <br />
      <button onClick={handleSaveNote} disabled={loading}>
        {loading ? 'Saving...' : 'Save Note'}
      </button>
    </div>
  );
};

export default EditNote;
