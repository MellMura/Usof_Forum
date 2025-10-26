import React, { useState } from 'react';
import AdminTabs from './AdminTabs';
import AdminUsers from './AdminUsers';
import AdminCats from './AdminCats';
import AdminPosts from './AdminPosts';
import AdminComments from './AdminComments';
import '../categories/CategoriesList.css';
import { useAuthUser } from '../auth/useAuth';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  const authUser = useAuthUser() || null;
  const currentUserId = authUser?.id ?? null;
  const isAdmin = authUser?.status === 'admin';

  return (
    <div className="page">
      <AdminTabs active={tab} onChange={setTab} />

      <div className="content">
        {tab === 'users' && <AdminUsers authUserId={authUser} isAdmin={isAdmin}/>}

        {tab === 'categories' && <AdminCats />}
        
        {tab === 'posts' && <AdminPosts isAdmin={isAdmin}/>}

        {tab === 'comments' && <AdminComments />}
      </div>
    </div>
  );
}
