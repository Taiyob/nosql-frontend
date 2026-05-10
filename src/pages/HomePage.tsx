import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { type Post } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, X, Calendar, Shield, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Post | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/posts?page=${page}&limit=${limit}`);
        if (response.data.success) {
          setPosts(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;
    
    try {
      setIsPosting(true);
      await api.post('/posts', { title: newPostTitle, content: newPostContent });
      setNewPostTitle('');
      setNewPostContent('');
      // Refresh feed
      const response = await api.get(`/posts?page=1&limit=${limit}`);
      setPosts(response.data.data);
      setPage(1);
      toast.success('Post shared successfully!');
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        <div className="animate-spin" style={{ width: '48px', height: '48px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1.5rem' }}></div>
        <p style={{ fontWeight: 600, letterSpacing: '1px' }}>FETCHING FEED...</p>
      </div>
    );
  }

  return (
    <>
      <div className="feed-container animate-fade">
        <header className="feed-header">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Public Feed</h1>
          <p style={{ color: 'var(--text-muted)' }}>Discover insights from our community</p>
        </header>

        {/* Post Creation Box */}
        <section className="glass" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--border)', borderRadius: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Send size={20} color="var(--primary)" />
            Create a New Post
          </h2>
          <form onSubmit={handleCreatePost}>
            <input 
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Give your post a title..." 
              required
              style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)' }}
            />
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?" 
              required
              rows={3}
              style={{ background: 'rgba(255,255,255,0.03)', resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="primary" disabled={isPosting}>
                {isPosting ? 'Posting...' : 'Post to Feed'}
              </button>
            </div>
          </form>
        </section>

        {posts.length === 0 ? (
          <div className="post-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post._id} className="post-card">
              <div className="post-user">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="post-meta">
                  <h3>{typeof post.user === 'object' ? post.user.email.split('@')[0] : 'Member'}</h3>
                  <span className="post-time">
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h2 className="post-title">{post.title}</h2>
              <p className="post-content" style={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                {post.content}
              </p>

              <div className="post-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: typeof post.user === 'object' && post.user.role === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    color: typeof post.user === 'object' && post.user.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                    border: '1px solid currentColor'
                  }}>
                    {typeof post.user === 'object' ? post.user.role.toUpperCase() : 'USER'}
                  </span>
                </div>
                
                <button 
                  onClick={() => setSelectedNote(post)}
                  className="action-btn"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                  View Full Note →
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Note Detail Modal - Now outside the animated container */}
      <AnimatePresence>
        {selectedNote && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                padding: '2.5rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <button 
                onClick={() => setSelectedNote(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '50%',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div className="user-avatar" style={{ width: '50px', height: '50px' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {typeof selectedNote.user === 'object' ? selectedNote.user.email : 'Member'}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                    <span className="post-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {new Date(selectedNote.createdAt).toLocaleDateString()}
                    </span>
                    <span className="post-time" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                      <Shield size={14} />
                      {typeof selectedNote.user === 'object' ? selectedNote.user.role : 'user'}
                    </span>
                  </div>
                </div>
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                {selectedNote.title}
              </h1>
              
              <div style={{ 
                color: 'var(--text)', 
                lineHeight: 1.8, 
                fontSize: '1.1rem',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedNote.content}
              </div>

              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="primary"
                  style={{ width: '100%' }}
                >
                  Close Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;
