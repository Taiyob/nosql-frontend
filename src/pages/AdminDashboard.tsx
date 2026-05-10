import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { type User, type Note } from '../types';
import { Users, Database, Shield, Trash2, Edit3, Plus, ChevronLeft, ChevronRight, X, FileText, Search, Mail, Fingerprint, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState<{ user: User, posts: Note[] } | null>(null);
  const [selectedInterestUsers, setSelectedInterestUsers] = useState<{ name: string, users: any[] } | null>(null);
  const [interestSearch, setInterestSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const limit = 5;

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?page=${page}&limit=${limit}`);
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchInterests = async () => {
    try {
      const res = await api.get('/users/grouped-interests');
      setInterests(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch interests');
    }
  };

  const fetchAllPosts = async () => {
    try {
      const res = await api.get(`/posts?page=${postPage}&limit=${limit}`);
      setAllPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch community posts');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchInterests(), fetchAllPosts()]);
      setLoading(false);
    };
    init();
  }, [page, postPage]);

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmUserDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsSubmitting(true);
      await api.post(`/users/change-status/${userToDelete}`, { isDeleted: true });
      toast.success('User deleted successfully', { id: 'delete-user' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user', { id: 'delete-user' });
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    try {
      setIsSubmitting(true);
      if (editingUser) {
        await api.post(`/users/change-status/${editingUser._id}`, data);
      } else {
        const payload = {
          password: data.password as string,
          admin: {
            email: data.email as string,
            name: {
              firstName: (data.name as string).split(' ')[0] || 'Admin',
              lastName: (data.name as string).split(' ')[1] || 'User'
            },
            contactNo: '01700000000',
            emergencyContactNo: '01700000001',
            gender: 'male',
            bloodGroup: 'O+',
            presentAddress: 'N/A',
            permanentAddress: 'N/A',
            designation: 'Admin',
          }
        };
        await api.post('/users/create-admin', payload);
      }
      setIsUserModalOpen(false);
      toast.success(editingUser ? 'User status updated' : 'Admin created successfully', { id: 'save-user' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed', { id: 'save-user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserPosts = async (user: User) => {
    try {
      const res = await api.get(`/posts/user-posts/${user.id}`);
      const posts = res.data.data[0]?.posts || [];
      setSelectedUserPosts({ user, posts });
    } catch (err) {
      toast.error('Failed to fetch user posts');
    }
  };

  const filteredInterests = interests.filter(i => 
    i._id.toLowerCase().includes(interestSearch.toLowerCase())
  );

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Admin Panel...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header className="animate-fade" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2.5rem',
        padding: '1.5rem',
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '1rem',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield color="var(--primary)" size={32} />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage users and monitor community activity</p>
          </div>
        </div>
        <button className="primary" onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Admin
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
              <Users size={24} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Users</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{users.length}</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
              <Send size={24} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Community Posts</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{allPosts.length}</h3>
            </div>
          </div>
        </div>
        {/* User Management Section */}
        <section className="animate-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Users color="#6366f1" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>User Management</h2>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>User Email</th>
                  <th style={{ width: '100px' }}>Role</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{u.id}</td>
                    <td style={{ fontWeight: 500 }}>{u.email}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        background: u.role === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: u.role === 'admin' ? '#10b981' : '#6366f1',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        background: u.status === 'blocked' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: u.status === 'blocked' ? '#ef4444' : '#10b981',
                        border: `1px solid ${u.status === 'blocked' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                      }}>
                        {u.status || 'in-progress'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => fetchUserPosts(u)} 
                          className="secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                        >
                          Posts
                        </button>
                        <button 
                          onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                          className="table-action-btn"
                          title="Edit Status"
                        >
                          <Edit3 size={18} color="var(--primary)" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="table-action-btn"
                          title="Delete User"
                        >
                          <Trash2 size={18} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              className="secondary" 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Page {page}</span>
            <button 
              className="secondary" 
              onClick={() => setPage(p => p + 1)} 
              disabled={users.length < limit}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* Interests Section */}
        <section className="animate-fade" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database color="#f59e0b" size={24} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Community Interests</h2>
            </div>
            <div style={{ position: 'relative', width: '300px', height: '46px' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '1.25rem', 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                  display: 'block'
                }} 
              />
              <input 
                type="text" 
                placeholder="Search interests..." 
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                style={{ 
                  width: '100%',
                  height: '100%',
                  paddingLeft: '3.25rem', 
                  borderRadius: '2rem', 
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {filteredInterests.length > 0 ? filteredInterests.map(interest => (
              <motion.div 
                whileHover={{ scale: 1.02, translateY: -4 }}
                key={interest._id} 
                className="glass" 
                onClick={() => setSelectedInterestUsers({ name: interest._id, users: interest.users })}
                style={{ 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ color: 'var(--primary)', fontWeight: '700' }}># {interest._id}</h3>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem', borderRadius: '0.5rem' }}>
                    <Users size={16} color="#f59e0b" />
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text)', fontWeight: '600' }}>{interest.count}</span> users interested
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Click to view users <ChevronRight size={14} />
                </div>
              </motion.div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No interests found matching "{interestSearch}"
              </div>
            )}
          </div>
        </section>

        {/* Community Posts Monitoring Section */}
        <section className="animate-fade" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Send color="#10b981" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Community Feed Monitoring</h2>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Post Title</th>
                  <th>Author</th>
                  <th className="hidden md:table-cell">Content Preview</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPosts.length > 0 ? allPosts.map(post => (
                  <tr key={post._id}>
                    <td style={{ fontWeight: 600 }}>{post.title}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                      {typeof post.user === 'object' ? post.user.email : 'Unknown'}
                    </td>
                    <td className="hidden md:table-cell" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {post.content.substring(0, 50)}...
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {/* Admin delete of others' posts is restricted as per requirement "View everyone's notes" */}
                      {/* 
                      <button 
                        className="table-action-btn" 
                        onClick={async () => {
                          if(confirm('Are you sure you want to delete this community post?')) {
                            await api.delete(`/posts/${post._id}`);
                            toast.success('Post removed from feed');
                            fetchAllPosts();
                          }
                        }}
                      >
                        <Trash2 size={18} color="var(--danger)" />
                      </button>
                      */}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No community posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              className="secondary" 
              onClick={() => setPostPage(p => Math.max(1, p - 1))} 
              disabled={postPage === 1}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Page {postPage}</span>
            <button 
              className="secondary" 
              onClick={() => setPostPage(p => p + 1)} 
              disabled={allPosts.length < limit}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* User Posts Modal */}
      <AnimatePresence>
        {selectedUserPosts && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--card-bg)'
              }}
            >
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileText color="var(--primary)" size={24} />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Posts by User</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{selectedUserPosts.user.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUserPosts(null)} className="secondary" style={{ padding: '0.5rem' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                {selectedUserPosts.posts.length > 0 ? (
                  <div className="table-container" style={{ margin: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th style={{ width: '100px' }}>Status</th>
                          <th style={{ width: '150px' }}>Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUserPosts.posts.map((post: any, idx) => (
                          <tr key={post._id || idx}>
                            <td style={{ fontWeight: 500 }}>{post.title}</td>
                            <td>
                              <span style={{ 
                                padding: '0.15rem 0.5rem', 
                                borderRadius: '0.5rem', 
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                                background: post.isDeleted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: post.isDeleted ? '#ef4444' : '#10b981',
                                border: `1px solid ${post.isDeleted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                              }}>
                                {post.isDeleted ? 'Deleted' : 'Active'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No posts found.</p>
                )}
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                <button className="secondary" onClick={() => setSelectedUserPosts(null)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interest Users Modal */}
      <AnimatePresence>
        {selectedInterestUsers && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '600px',
                background: 'var(--card-bg)',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Database color="#f59e0b" size={24} />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Users interested in #{selectedInterestUsers.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{selectedInterestUsers.users.length} members found</p>
                  </div>
                </div>
                <button onClick={() => setSelectedInterestUsers(null)} className="secondary" style={{ padding: '0.5rem' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedInterestUsers.users.map((u, idx) => (
                    <div key={idx} style={{ 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                          <Mail size={16} color="var(--primary)" />
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <Fingerprint size={14} /> {u.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                <button className="secondary" onClick={() => setSelectedInterestUsers(null)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Edit Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2rem',
                background: 'var(--card-bg)'
              }}
            >
              <h2 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Edit User Status' : 'Create New Admin'}</h2>
              <form onSubmit={handleUserSave}>
                {!editingUser && (
                  <>
                    <label>Full Name</label>
                    <input name="name" required placeholder="John Doe" />
                    <label>Email</label>
                    <input name="email" type="email" required placeholder="admin@example.com" />
                    <label>Password</label>
                    <input name="password" type="password" required placeholder="••••••••" />
                  </>
                )}
                {editingUser && (
                  <>
                    <label>Status</label>
                    <select name="status" defaultValue={editingUser.status}>
                      <option value="in-progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="secondary" onClick={() => setIsUserModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="primary" style={{ flex: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Save Changes'}
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
        onConfirm={confirmUserDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This will soft-delete their account."
      />
    </div>
  );
};

export default AdminDashboard;
