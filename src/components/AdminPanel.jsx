import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, OWNER_DISCORD_ID } from '../context/AppContext';
import { ShieldCheck, Search, Trash2, Ban, Star, User, ExternalLink, RefreshCw } from 'lucide-react';

export const AdminPanel = () => {
  const { currentUser, users, siteDatabase, updateUser, deleteUser } = useApp();
  const navigate = useNavigate();
  const isOwner = currentUser?.id === OWNER_DISCORD_ID || currentUser?.isOwner;
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    if (!isOwner) navigate('/app');
  }, [isOwner, navigate]);

  const showFeedback = (message, type = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const getAllUsers = useCallback(() => {
    const allUsers = [];
    const seenIds = new Set();
    if (users) {
      Object.entries(users).forEach(([id, user]) => {
        if (!seenIds.has(id)) {
          allUsers.push({ id, ...user, source: 'users' });
          seenIds.add(id);
        }
      });
    }
    if (siteDatabase) {
      Object.entries(siteDatabase).forEach(([id, site]) => {
        if (!seenIds.has(id)) {
          allUsers.push({ id, ...site, username: site.username || id, source: 'sites' });
          seenIds.add(id);
        } else {
          const existing = allUsers.find(u => u.id === id);
          if (existing) {
            existing.siteData = site;
            existing.source = 'both';
          }
        }
      });
    }
    return allUsers;
  }, [users, siteDatabase]);

  const allUsers = getAllUsers();

  const filteredUsers = allUsers.filter(user => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || user.username?.toLowerCase().includes(query) || user.displayName?.toLowerCase().includes(query) || user.id.includes(query);
    if (filter === 'all') return matchesSearch;
    if (filter === 'owners') return matchesSearch && (user.id === OWNER_DISCORD_ID || user.isOwner);
    if (filter === 'verified') return matchesSearch && user.badges?.includes('Verified');
    if (filter === 'banned') return matchesSearch && user.banned;
    if (filter === 'no-sites') return matchesSearch && !user.siteData;
    return matchesSearch;
  });

  const handleBan = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    if (userId === OWNER_DISCORD_ID) {
      showFeedback("Can't ban the owner", 'error');
      return;
    }
    const isBanned = user.banned;
    updateUser(userId, { banned: !isBanned });
    showFeedback(isBanned ? 'User unbanned' : 'User banned', isBanned ? 'info' : 'warning');
  };

  const handleBadge = (userId, badge) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const badges = [...(user.badges || [])];
    const index = badges.indexOf(badge);
    if (index > -1) {
      badges.splice(index, 1);
    } else {
      badges.push(badge);
    }
    updateUser(userId, { badges });
    showFeedback(index > -1 ? `Removed ${badge}` : `Added ${badge}`, 'success');
  };

  const handleDelete = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    if (userId === OWNER_DISCORD_ID) {
      showFeedback("Can't delete the owner", 'error');
      return;
    }
    if (window.confirm(`Delete ${user.username || user.id}? This cannot be undone.`)) {
      deleteUser(userId);
      showFeedback('User deleted', 'warning');
    }
  };

  const stats = {
    total: allUsers.length,
    owners: allUsers.filter(u => u.id === OWNER_DISCORD_ID || u.isOwner).length,
    verified: allUsers.filter(u => u.badges?.includes('Verified')).length,
    banned: allUsers.filter(u => u.banned).length,
    withSites: allUsers.filter(u => u.siteData).length,
  };

  if (!isOwner) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {actionFeedback && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-xl text-xs font-bold border backdrop-blur-xl animate-in slide-in-from-right ${actionFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : actionFeedback.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-amber-500/15 border-amber-500/30 text-amber-300'}`}>
          {actionFeedback.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> Admin Panel</h1>
          <p className="text-xs text-gray-500 font-mono">{stats.total} users / {stats.withSites} with sites</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[{l:'All',v:'all',c:stats.total},{l:'Owners',v:'owners',c:stats.owners},{l:'Verified',v:'verified',c:stats.verified},{l:'Banned',v:'banned',c:stats.banned}].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${filter === f.v ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {f.l} ({f.c})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-1.5 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <input type="text" placeholder="Search by name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white text-xs py-2.5 focus:outline-none placeholder-gray-600" />
        {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>}
      </div>

      <div className="space-y-1.5">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs font-mono">No users found</div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className={`bg-white/[0.03] backdrop-blur-xl rounded-xl border px-4 py-3 flex items-center gap-3 transition-all ${user.banned ? 'border-red-500/30 opacity-60' : 'border-white/[0.06]'}`}>
              <div className="relative shrink-0">
                <img src={user.avatar || user.avatarUrl || `https://api.dicebear.com/7.x/glass/svg?seed=${user.id}`} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                {user.id === OWNER_DISCORD_ID && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"><ShieldCheck className="w-2.5 h-2.5 text-white" /></div>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{user.displayName || user.username || 'Unknown'}</span>
                  {user.badges?.map((b, i) => (
                    <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${b === 'Verified' ? 'bg-cyan-500/15 text-cyan-300' : b === 'OG' ? 'bg-amber-500/15 text-amber-300' : 'bg-purple-500/15 text-purple-300'}`}>{b}</span>
                  ))}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">{user.id} / {user.username || 'no username'}</div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => navigate(`/${user.username}`)} className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="View Site"><ExternalLink className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleBadge(user.id, 'Verified')} className={`p-1.5 rounded-lg transition-all ${user.badges?.includes('Verified') ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10'}`} title="Toggle Verified"><Star className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleBadge(user.id, 'OG')} className={`p-1.5 rounded-lg transition-all ${user.badges?.includes('OG') ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'}`} title="Toggle OG"><Star className="w-3.5 h-3.5 fill-current" /></button>
                {user.id !== OWNER_DISCORD_ID && (
                  <>
                    <button onClick={() => handleBan(user.id)} className={`p-1.5 rounded-lg transition-all ${user.banned ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'}`} title={user.banned ? 'Unban' : 'Ban'}><Ban className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
