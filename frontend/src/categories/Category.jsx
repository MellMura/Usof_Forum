import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './Category.css';

export default function Category({
  id,
  name,
  description,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const toggleMenu = () => setMenuOpen((s) => !s);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuOpen) return;
      const m = menuRef.current;
      const b = btnRef.current;
      if (m && !m.contains(e.target) && b && !b.contains(e.target)) {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [menuOpen]);

  const handleEdit = () => { onEdit?.(id); closeMenu(); };
  const handleDelete = () => { onDelete?.(id); closeMenu(); };

  return (
    <section className="cat_card">
      <div className="cat_meta">
        <div className="cat_name" title={name}>{name}</div>
        {description && (
          <div className="cat_desc" title={description}>{description}</div>
        )}
      </div>

      <div className="cat_actions">
        <button
          ref={btnRef}
          id={`cat-kebab-${id}`}
          type="button"
          className="cat_kebab"
          aria-haspopup="menu"
          aria-expanded={menuOpen ? 'true' : 'false'}
          onClick={toggleMenu}
          title="More"
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="cat_menu"
            role="menu"
            aria-labelledby={`cat-kebab-${id}`}
          >
            {onEdit && (
              <button
                type="button"
                className="cat_menuItem"
                role="menuitem"
                onClick={handleEdit}
                title="Edit category"
              >
                <i className="bx bx-pencil" aria-hidden="true"></i>
                <span>Edit category</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="cat_menuItem"
                role="menuitem"
                onClick={handleDelete}
                title="Delete category"
              >
                <i className="bx bx-trash-alt" aria-hidden="true"></i>
                <span>Delete category</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

Category.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

Category.defaultProps = {
  description: '',
  onEdit: undefined,
  onDelete: undefined,
};