import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { type Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, StickyNote, LogOut, Database, Settings } from 'lucide-react';

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [page, setPage] = useState(1);
  const { user, logout } = useAuth();
  const limit = 6;

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes?page=${page}&limit=${limit}`);
      setNotes(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    try {
      if (currentNote?._id) {
        await api.patch(`/notes/${currentNote._id}`, data);
      } else {
        await api.post('/notes', data);
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${id}`);
        fetchNotes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3rem',
        padding: '1.5rem',
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '1rem',
        border: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>My Notes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Logged in as: {user?.id} ({user?.role})</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user?.role === 'admin' && (
            <button className="secondary" onClick={() => window.location.href = '/admin'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} />
              Dashboard
            </button>
          )}
          <button className="primary" onClick={() => { setCurrentNote(null); setIsModalOpen(true); }}>
            <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            New Note
          </button>
          <button className="secondary" onClick={() => window.location.href = '/settings'} style={{ display: 'flex', alignItems: 'center' }}>
            <Settings size={18} />
          </button>
          <button className="secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {notes.length > 0 ? notes.map((note) => (
          <div key={note._id} className="glass animate-fade" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <StickyNote size={20} color="#6366f1" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setCurrentNote(note); setIsModalOpen(true); }} style={{ padding: '0.4rem', background: 'transparent' }}>
                  <Edit3 size={18} color="var(--text-muted)" />
                </button>
                <button onClick={() => handleDelete(note._id)} style={{ padding: '0.4rem', background: 'transparent' }}>
                  <Trash2 size={18} color="var(--danger)" />
                </button>
              </div>
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{note.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', whiteSpace: 'pre-wrap' }}>{note.content}</p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p>No notes found. Create your first note!</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="secondary" style={{ padding: '0.6rem 1.2rem' }}>Previous</button>
        <span style={{ alignSelf: 'center' }}>Page {page}</span>
        <button disabled={notes.length < limit} onClick={() => setPage(p => p + 1)} className="secondary" style={{ padding: '0.6rem 1.2rem' }}>Next</button>
      </div>

      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '500px', background: 'var(--card-bg)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{currentNote ? 'Edit Note' : 'Create Note'}</h2>
            <form onSubmit={handleSave}>
              <label>Title</label>
              <input name="title" defaultValue={currentNote?.title} required placeholder="Note title" />
              <label>Content</label>
              <textarea name="content" defaultValue={currentNote?.content} required placeholder="Write your note here..." style={{ minHeight: '150px' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
