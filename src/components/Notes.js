import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import "../styles/Notes.css";

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newHeading, setNewHeading] = useState(""); 
    const [newNote, setNewNote] = useState("");
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingNoteText, setEditingNoteText] = useState("");
    const [editingNoteHeading, setEditingNoteHeading] = useState(""); 

    useEffect(() => {
      const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const notesRef = collection(userRef, "notes");

          const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
            setNotes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          });

          return () => {
            unsubscribeNotes();
          };
        } else {
          setNotes([]);
        }
      });

      return () => unsubscribeAuth();
    }, []);

    const addNote = async () => {
        if (!newNote.trim() || !newHeading.trim()) return;
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const notesRef = collection(userRef, "notes");

          await addDoc(notesRef, {
            heading: newHeading,  
            text: newNote,         
            createdAt: new Date(),
          });

          setNewHeading(""); 
          setNewNote("");
        } catch (error) {
          console.error("Error adding note:", error);
        }
    };

    const deleteNote = async (id) => {
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const noteRef = doc(db, "users", auth.currentUser.uid, "notes", id);
          await deleteDoc(noteRef);
        } catch (error) {
          console.error("Error deleting note:", error);
        }
    };

    const startEditingNote = (id, heading, text) => {
        setEditingNoteId(id);
        setEditingNoteHeading(heading);
        setEditingNoteText(text);
    };

    const saveEditingNote = async (id) => {
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const noteRef = doc(db, "users", auth.currentUser.uid, "notes", id);
          await updateDoc(noteRef, { heading: editingNoteHeading, text: editingNoteText });
        } catch (error) {
          console.error("Error updating note:", error);
        }

        setEditingNoteId(null);
    };

    return (
      <div className="notes-container">
        <h2>📝 Notes</h2>
        <div className="note-input">
          <input
            type="text"
            value={newHeading}
            onChange={(e) => setNewHeading(e.target.value)}
            placeholder="Note Heading..."
            className="note-heading-input"
          />
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
            className="note-textarea"
          />
          <button className="add-note-btn" onClick={addNote}>Add</button>
        </div>
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              {editingNoteId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editingNoteHeading}
                    onChange={(e) => setEditingNoteHeading(e.target.value)}
                    className="edit-heading-input"
                  />
                  <textarea
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    className="note-textarea"
                  />
                </>
              ) : (
                <>
                  <h3>{note.heading}</h3>
                  <p onClick={() => startEditingNote(note.id, note.heading, note.text)}>
                    {note.text}
                  </p>
                </>
              )}
              {editingNoteId === note.id ? (
                <button className="save-note-btn" onClick={() => saveEditingNote(note.id)}>Save</button>
              ) : (
                <button className="delete-note-btn" onClick={() => deleteNote(note.id)}>Delete</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
}

export default Notes;