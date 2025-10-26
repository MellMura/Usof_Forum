import React from 'react';
import PropTypes from 'prop-types';

export default function AdminTabs({ active, onChange }) {
  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'categories', label: 'Categories' },
    { key: 'posts', label: 'Posts' },
    { key: 'comments', label: 'Comments' },
  ];

  return (
    <div className="cats">
      <div className="cats-scroll">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={`cat ${active === t.key ? 'is-active' : ''}`}
            onClick={() => onChange?.(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

AdminTabs.propTypes = {
  active: PropTypes.oneOf(['users', 'categories', 'posts', 'comments']).isRequired,
  onChange: PropTypes.func.isRequired,
}; 