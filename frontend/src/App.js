import React, { useState, useEffect }from 'react';
import Header from './header';
import Feed from './feed';
import AddPostButton from './postForm/AddPostButton';
import AddPostForm from './postForm/AddPostForm';
import Sidebar from './sidebar/Sidebar';
import Bookmarks from './bookmark/BookmarkList';
import BlockList from './block/BlockList';
import ProfilePage from './profile/ProfilePage';
import PostPage from './post/PostPage';
import FilterPanel from './filters/FilterPanel';
import SearchPage from './search/SearchPage';
import AdminPanel from './admin/AdminPanel';
import Rules from './common/Rules'
import { useDispatch } from 'react-redux';
import { refetchPosts } from './store/postsActions';

import {
  Login,
  Register,
  PasswordReset,
  VerifyEmailRequest,
  VerifyEmailConfirm,
} from './auth';

import { useAuthUser } from './auth/useAuth'; 
import { logoutUser } from './auth/Logout'; 

const Placeholder = ({ title }) => (
  <main className="feed">
    <h2 style={{ margin: '12px 0' }}>{title}</h2>
    <p>Coming soon…</p>
  </main>
);

const App = () => {

  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('sidebar-open', sidebarOpen);
    root.classList.toggle('sidebar-collapsed', !sidebarOpen);

    document.body.classList.toggle('no-scroll', sidebarOpen);
  }, [sidebarOpen]);

  const user = useAuthUser();
  console.log('auth user:', user);

  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setLocalFilters] = useState({
    categories: [],
    date_from: '',
    date_to: '',
    author_id: '',
    status: '',
  });

  const isAdmin = user?.status === 'admin';

  useEffect(() => {
    const p = window.location.pathname;
    if (p.startsWith('/api/auth/verify-email/')) {
      window.location.replace(`http://localhost:4000${p}`);
    }
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (to) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  if (path.startsWith('/login')) {
    return <Login onSuccess={() => go('/')} />;
  }

  if (path.startsWith('/register')) {
    return <Register onSuccess={() => go('/verify-email')} />;
  }

  if (path.startsWith('/remind/confirm')) {
    return <PasswordReset mode="confirm" />;
  }

  if (path.startsWith('/remind')) {
    return <PasswordReset mode="request" />;
  }

  if (path.startsWith('/verify-email/confirm')) {
    return <VerifyEmailConfirm />;
  } 

  if (path.startsWith('/verify-email')){
    return <VerifyEmailRequest />;
  } 

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/login';
  };
  
  const handleSearch = (query) => {
    go(`/search?q=${encodeURIComponent(query)}`);
  };

  const routes = {
    '/': <Feed onReload={() => {}} />,
    ...(isAdmin ? { '/admin': <Placeholder title="Admin Panel" /> } : {}),
    '/bookmarks': <Placeholder title="My bookmarks" />,
    '/blocklist': <Placeholder title="Blocklist" />,
    '/rules': <Placeholder title="Rules of the forum" />,
    '/profile': <ProfilePage />,
  };

  const content = routes[path] ?? (path.startsWith('/profile') ? <ProfilePage /> : <Placeholder title="Page" />);
    
  return (
    <>
      <Header
        userId={user ? user.id : null}
        userName={user ? user.login : 'Pawn'}
        userStatus={user ? user.status : 'guest'}
        onSearch={handleSearch}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onLogout={handleLogout}
      />
    <div className="page">
        <div
          className={`scrim ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <Sidebar 
          id="app-sidebar"
          isOpen={sidebarOpen}
          activePath={path}
          isAdmin={isAdmin}
          isLoggedIn={!!user}
          onNavigate={(to) => {
            if (!isDesktop()) setSidebarOpen(false);
            go(to);
          }}
          onClose={() => {
            if (!isDesktop()) setSidebarOpen(false);
          }}
        />

  <div className="content">
    {path === '/' && (<Feed
      filters={filters}
      setFilters={setLocalFilters}
      openFilters={openFilters}
      setOpenFilters={setOpenFilters}
      isAdmin={isAdmin}
      user={user}/>
      )}

    {path.startsWith('/search') && <SearchPage />}
    {path.startsWith('/profile') && <ProfilePage />}
    {path.startsWith('/post/') && <PostPage />}
    {path === '/admin' && (
      isAdmin ? <AdminPanel /> : <div className="feed"><h2>Not authorized</h2></div>
    )}
    {path === '/bookmarks' && <Bookmarks currentUserId={user?.id ?? null}
    authUser={user ?? null}
    isAdmin={isAdmin}/>}
    {path === '/blocklist' && <BlockList />}
    {path === '/rules' && <Rules />}
  </div>
      </div>

    {path === '/' && (
        <>
          <AddPostButton onClick={() => setOpen(true)} />
          <AddPostForm
            open={open}
            onClose={() => setOpen(false)}
            onCreated={() => {
              setOpen(false);
              dispatch(refetchPosts());
            }}
          />
        </>
    )}
    </>
  );
}

export default App;

