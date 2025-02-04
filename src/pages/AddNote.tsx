import React, { useState } from 'react';
import { addDoc } from 'firebase/firestore';
import { notesCollection } from '../lib/firebase';

const AddNote = () => {
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');

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
      setNoteText(''); // Clear the textarea after saving
      alert('Note saved to Firestore!'); // Provide feedback to the user
    } catch (e) {
      setError('Failed to save note to Firestore.');
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <h1>Add New Note</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <textarea
        placeholder="Enter your note here..."
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        rows={10} // Adjust rows as needed
        cols={50} // Adjust cols as needed
      />
      <br />
      <button onClick={handleSaveNote}>Save Note</button>
    </div>
  );
};

export default AddNote;
