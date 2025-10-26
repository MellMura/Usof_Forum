import React from 'react';
import PropTypes from 'prop-types';
import './Sidebar.css';

export default function Sidebar({ id = 'app-sidebar', activePath, onNavigate, isOpen = true, onClose, isAdmin = false, isLoggedIn = false,
}) {
  const navigation = [
    { key: 'home', label: 'Home', path: '/' },
    ...(isAdmin ? [{ key: 'admin', label: 'Admin Panel', path: '/admin' }] : []),
    ...(isLoggedIn ? [{ key: 'bookmarks', label: 'My bookmarks', path: '/bookmarks' }] : []),
    ...(isLoggedIn ? [{ key: 'blocklist', label: 'Blocklist', path: '/blocklist' }] : []),
    { key: 'rules', label: 'Rules of the forum', path: '/rules' },
  ];

  return (
      <aside
        id={id}
        className="sidebar"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        tabIndex={-1}
        >
        <nav className="sidebar_nav">
          {navigation.map(item => {
            const active = activePath === item.path || (item.path === '/' && activePath === '');
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebtn ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => {onNavigate(item.path); onClose?.();}}
                title={item.label}
              >
                <span className="sidebtn_label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
  );
}

Sidebar.propTypes = {
  id: PropTypes.string,
  activePath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
