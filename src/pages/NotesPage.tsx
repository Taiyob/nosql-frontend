import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { type Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, LogOut, Database, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const { user, logout } = useAuth();
  const limit = 8;

  const fetchNotes = async () => {
    try {
      const notesRes = await api.get(`/notes?page=${page}&limit=${limit}`);
      
      const postsEndpoint = user?.role === 'admin' 
        ? `/posts?limit=100` // Admins see all posts
        : `/posts/user-posts/${user?.id}`;
        
      const postsRes = await api.get(postsEndpoint);
      
      const userNotes = notesRes.data.data.map((n: any) => ({ ...n, isPublic: false }));
      
      const rawPosts = user?.role === 'admin' 
        ? postsRes.data.data 
        : (postsRes.data.data[0]?.posts || []);
        
      const userPosts = rawPosts.map((p: any) => ({ ...p, isPublic: true }));
      
      const combined = [...userNotes, ...userPosts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotes(combined);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch notes');
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
      setIsSubmitting(true);
      const payload = { title: data.title, content: data.content };
      
      if (currentNote?._id) {
        // Update existing
        if (currentNote.isPublic === isPublic) {
          // Same type, just patch
          const endpoint = isPublic ? `/posts/${currentNote._id}` : `/notes/${currentNote._id}`;
          await api.patch(endpoint, payload);
        } else {
          // Type changed, move between collections
          if (isPublic) {
            // Private -> Public
            await api.post('/posts', payload);
            await api.delete(`/notes/${currentNote._id}`);
          } else {
            // Public -> Private
            await api.post('/notes', payload);
            await api.delete(`/posts/${currentNote._id}`);
          }
        }
        toast.success('Updated successfully', { id: 'save-note' });
      } else {
        // Create new
        if (isPublic) {
          await api.post('/posts', payload);
          toast.success('Post shared successfully!', { id: 'save-note' });
        } else {
          await api.post('/notes', payload);
          toast.success('Note created successfully', { id: 'save-note' });
        }
      }
      setIsModalOpen(false);
      setIsPublic(false);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save note', { id: 'save-note' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setNoteToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    const note = notes.find(n => n._id === noteToDelete);
    const endpoint = note?.isPublic ? `/posts/${noteToDelete}` : `/notes/${noteToDelete}`;
    
    try {
      await api.delete(endpoint);
      toast.success('Deleted successfully', { id: 'delete-note' });
      fetchNotes();
    } catch (err: any) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header className="animate-fade" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '1rem',
        border: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>My Notes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Logged in as: {user?.email} ({user?.role || 'user'})</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user?.role === 'admin' && (
            <button className="secondary" onClick={() => window.location.href = '/admin'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}
          <button className="primary" onClick={() => { setCurrentNote(null); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            <span className="hidden sm:inline">New Note</span>
          </button>
          <button className="secondary" onClick={() => window.location.href = '/settings'} title="Settings">
            <Settings size={18} />
          </button>
          <button className="secondary" onClick={logout} title="Logout" style={{ color: 'var(--danger)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="table-container animate-fade">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Note Title</th>
              {user?.role === 'admin' && <th style={{ width: '180px' }}>Author</th>}
              <th className="hidden md:table-cell">Content Preview</th>
              <th style={{ width: '140px' }}>Date</th>
              {(user?.role !== 'admin' || notes.some(n => (n.user as any)?._id === user?._id)) && (
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {notes.length > 0 ? notes.map((note, index) => (
              <tr key={note._id}>
                <td>{((page - 1) * limit) + index + 1}</td>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {note.title}
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '4px',
                      background: note.isPublic ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      color: note.isPublic ? 'var(--primary)' : 'var(--text-muted)',
                      border: '1px solid currentColor'
                    }}>
                      {note.isPublic ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </div>
                </td>
                {user?.role === 'admin' && (
                  <td style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 500 }}>
                    {(note.user as any)?.email || 'Unknown'}
                  </td>
                )}
                <td className="hidden md:table-cell" style={{ color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.content}
                </td>
                <td style={{ fontSize: '0.8125rem' }}>{new Date(note.createdAt).toLocaleDateString()}</td>
                {(user?.role !== 'admin' || notes.some(n => (n.user as any)?._id === user?._id)) && (
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {(user?.role !== 'admin' || (note.user as any)?._id === user?._id) && (
                        <>
                          <button className="table-action-btn" onClick={() => { 
                            setCurrentNote(note); 
                            setIsPublic(!!note.isPublic);
                            setIsModalOpen(true); 
                          }} title="Edit">
                            <Edit3 size={18} color="#6366f1" />
                          </button>
                          <button className="table-action-btn" onClick={() => handleDelete(note._id)} title="Delete">
                            <Trash2 size={18} color="var(--danger)" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  No notes found. Start by creating a new one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        <button 
          className="secondary" 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Page {page}</span>
        <button 
          className="secondary" 
          onClick={() => setPage(p => p + 1)} 
          disabled={notes.length < limit}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '2rem',
                background: 'var(--card-bg)',
                position: 'relative'
              }}
            >
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                {currentNote?._id ? 'Edit Note' : 'Create New Note'}
              </h2>
              <form onSubmit={handleSave}>
                <label>Title</label>
                <input 
                  name="title" 
                  defaultValue={currentNote?.title} 
                  required 
                  placeholder="Enter note title..."
                />
                <label>Content</label>
                <textarea 
                  name="content" 
                  defaultValue={currentNote?.content} 
                  required 
                  rows={6}
                  placeholder="Write your note here..."
                  style={{ resize: 'none' }}
                />
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  marginTop: '1.25rem', 
                  padding: '0.875rem', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  borderRadius: '0.75rem', 
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  cursor: 'pointer'
                }} onClick={() => setIsPublic(!isPublic)}>
                  <input 
                    type="checkbox" 
                    id="isPublic" 
                    checked={isPublic} 
                    onChange={(e) => setIsPublic(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      cursor: 'pointer',
                      margin: 0,
                      flexShrink: 0
                    }}
                  />
                  <label 
                    htmlFor="isPublic" 
                    style={{ 
                      cursor: 'pointer', 
                      margin: 0, 
                      fontSize: '0.95rem', 
                      color: 'var(--primary)', 
                      fontWeight: 600,
                      lineHeight: 1,
                      userSelect: 'none'
                    }}
                  >
                    Share with Public (Post)
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="secondary" 
                    onClick={() => setIsModalOpen(false)} 
                    style={{ flex: 1 }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary" 
                    style={{ flex: 1 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
};

export default NotesPage;
