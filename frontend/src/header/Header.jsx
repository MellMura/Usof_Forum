import React, { useState, useRef, useEffect} from 'react';
import UserLink from '../common/UserLink';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';
import './Header.css';
import { useAuthUser } from '../auth/useAuth';

const Header = ({ userId, userStatus, userName, onSearch, onLogout, sidebarOpen, onToggleSidebar }) => {
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);


  const authUser = useAuthUser() || null;
  const isLoggedIn = !!authUser?.id;

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    if (onSearch) onSearch(term);
    else window.location.href = `/search?q=${encodeURIComponent(term)}`;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const toggleMenu = (e) => {
    e.preventDefault();
    setMenuOpen((prev) => !prev);
  };

  const openMobileSearch = () => setSearchOpen(true);
  const closeMobileSearch = () => setSearchOpen(false);

  return (
    <header className={`hdr ${searchOpen ? 'search-open' : ''}`}>
      <button
        type="button"
        className="hdr_menu"
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        aria-controls="app-sidebar"
        aria-expanded={!!sidebarOpen}
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <i className="bx bx-menu hdr_menu-icon" aria-hidden="true"></i>
      </button>

      <div className="hdr_title">ZUGZWANG.COM</div>
      <span className="hdr_meta" aria-hidden="true"></span>

      <form
        className={`hdr_search ${searchOpen ? 'is-open' : ''}`}
        role="search"
        action="/search"
        method="GET"
        onSubmit={submit}
        onBlur={(e) => {
          if (window.matchMedia('(max-width: 1023px)').matches) {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              closeMobileSearch();
            }
          }
        }}
      >
        <button
          type="button"
          className="hdr_search-btn"
          aria-label="Open search"
          onClick={openMobileSearch}
          tabIndex={0}
        >
          <i className="bx bx-search hdr_search-icon" aria-hidden="true"></i>
        </button>

        <input
          ref={inputRef}
          className="hdr_input"
          type="search"
          name="q"
          placeholder="Search posts, users, life advice..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />

        <button className="hdr_submit" type="submit">
          Search
        </button>
      </form>

      {isLoggedIn ? (
        <div className="hdr_profile" ref={menuRef}>
          <button
            className="hdr_avatar-btn"
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="hdr_avatar" aria-hidden="true">
              <Avatar src={authUser.pic_url} name={userName} size={40} />
            </div>
            <span className="hdr_nick">
              {userStatus}: {userName}
            </span>
          </button>

          {menuOpen && (
            <div className="hdr_dropdown" role="menu">
              <UserLink
                id={authUser.id}
                login={authUser.login}
                className="hdr_menuitem"
                title="Profile"
              >
                <i className="bx bx-user" aria-hidden="true" />
                <span>Profile</span>
              </UserLink>

              <button
                className="hdr_menuitem"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (onLogout) onLogout();
                }}
              >
                <i className="bx bx-door-open" aria-hidden="true" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="hdr_profile" ref={menuRef}>
          <button
            className="hdr_avatar-btn"
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            title="Account"
          >
            <div className="hdr_avatar" aria-hidden="true">
              <Avatar src={null} name="Guest" size={40} />
            </div>
            <span className="hdr_nick">guest: Pawn</span>
          </button>

          {menuOpen && (
            <div className="hdr_dropdown" role="menu">
              <a
                className="hdr_menuitem"
                href="/login"
                onClick={() => setMenuOpen(false)}
              >
                <i className="bx bx-log-in" aria-hidden="true" />
                <span>Log in</span>
              </a>
              <a
                className="hdr_menuitem"
                href="/register"
                onClick={() => setMenuOpen(false)}
              >
                <i className="bx bx-user-plus" aria-hidden="true" />
                <span>Register</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  userName: PropTypes.string.isRequired,
  userStatus: PropTypes.string.isRequired,
  onSearch: PropTypes.func,
  onLogout: PropTypes.func,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sidebarOpen: PropTypes.bool,
  onToggleSidebar: PropTypes.func
};

Header.defaultProps = {
  title: 'ZUGZWANG.COM',
  onSearch: undefined,
  onLogout: undefined,
  userId: undefined,
  sidebarOpen: false,
  onToggleSidebar: () => {}
};

export default Header;
