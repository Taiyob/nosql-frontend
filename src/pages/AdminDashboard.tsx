import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { type User } from '../types';
import { Users, Hash, Database, ChevronRight, Edit3, Trash2, StickyNote } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groupedInterests, setGroupedInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState<{ user: User, posts: any[] } | null>(null);
  const limit = 5;

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?page=${userPage}&limit=${limit}`);
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [groupedRes] = await Promise.all([
          api.get('/users/grouped-interests')
        ]);
        setGroupedInterests(groupedRes.data.data);
        await fetchUsers();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userPage]);

  const handleUserDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.patch(`/users/change-status/${id}`, { isDeleted: true }); // Assuming change-status can handle deletion or there's a delete route
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    try {
      if (editingUser) {
        await api.patch(`/users/change-status/${editingUser._id}`, data);
      } else {
        const payload = {
          password: data.password,
          admin: {
            email: data.email,
            name: {
              firstName: data.name.split(' ')[0] || 'Admin',
              lastName: data.name.split(' ')[1] || 'User'
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
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserPosts = async (user: User) => {
    try {
      const res = await api.get(`/posts/user-posts/${user.id}`);
      setSelectedUserPosts({ user, posts: res.data.data[0]?.posts || [] });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Admin Panel...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* User Management Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users color="#6366f1" />
              <h2 style={{ fontSize: '1.25rem' }}>User Management</h2>
            </div>
            <button className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}>
              Add User
            </button>
          </div>
          <div className="glass" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>User ID</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{u.id}</td>
                    <td style={{ padding: '1rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        background: u.role === 'admin' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: u.role === 'admin' ? '#4ade80' : '#818cf8'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => fetchUserPosts(u)} style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.4rem', color: '#818cf8', fontSize: '0.75rem' }}>
                          Posts
                        </button>
                        <button onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }} style={{ padding: '0.4rem', background: 'transparent' }}>
                          <Edit3 size={16} color="var(--text-muted)" />
                        </button>
                        <button onClick={() => handleUserDelete(u._id)} style={{ padding: '0.4rem', background: 'transparent' }}>
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem' }}>
            <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} className="secondary" style={{ padding: '0.5rem 1rem' }}>Prev</button>
            <span style={{ alignSelf: 'center', fontSize: '0.875rem' }}>Page {userPage}</span>
            <button disabled={users.length < limit} onClick={() => setUserPage(p => p + 1)} className="secondary" style={{ padding: '0.5rem 1rem' }}>Next</button>
          </div>
        </div>

        {/* Aggregation Insights */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Database color="#f59e0b" />
            <h2 style={{ fontSize: '1.25rem' }}>Aggregation: Interests</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {groupedInterests.map(group => (
              <div key={group._id} className="glass" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Hash size={16} color="var(--text-muted)" />
                    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{group._id}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {group.users.length} users interested
                  </div>
                </div>
                <div style={{ display: 'flex', WebkitMaskImage: 'linear-gradient(to left, transparent, black 20%)' }}>
                   {/* Avatars placeholder */}
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--card-bg)' }}></div>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', border: '2px solid var(--card-bg)', marginLeft: '-12px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario 2: User Posts Modal/Section */}
      {selectedUserPosts && (
        <div style={{ marginTop: '3rem' }} className="animate-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <StickyNote color="#10b981" />
            <h2 style={{ fontSize: '1.25rem' }}>Posts by {selectedUserPosts.user.id} ($lookup result)</h2>
            <button className="secondary" style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setSelectedUserPosts(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {selectedUserPosts.posts.length > 0 ? selectedUserPosts.posts.map((post: any) => (
              <div key={post._id} className="glass" style={{ padding: '1.25rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{post.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{post.content}</p>
              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)' }}>No posts found for this user.</div>
            )}
          </div>
        </div>
      )}

      {/* User Add/Edit Modal */}
      {isUserModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '400px', background: 'var(--card-bg)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Edit User Status' : 'Add New Admin'}</h2>
            <form onSubmit={handleUserSave}>
              {!editingUser && (
                <>
                  <label>Email</label>
                  <input name="email" type="email" required placeholder="admin@example.com" />
                  <label>Password</label>
                  <input name="password" type="password" required placeholder="••••••••" />
                  <label>Admin Name</label>
                  <input name="name" required placeholder="Admin Name" />
                </>
              )}
              {editingUser && (
                <>
                  <label>Status</label>
                  <select name="status" defaultValue={editingUser.status || 'in-progress'}>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="secondary" onClick={() => setIsUserModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
