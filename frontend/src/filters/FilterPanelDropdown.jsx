import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import FilterPanel from './FilterPanel';

export default function FilterPanelDropdown({
  anchorRef,
  open,
  onClose,
  value,
  onApply,
  isAdmin,
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    const el = anchorRef?.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const panelWidth = 320;
    const margin = 8;
    const maxLeft = Math.max(0, window.innerWidth - panelWidth - margin);
    const left = Math.min(Math.max(r.left, margin), maxLeft);
    const top = Math.min(r.bottom + margin, window.innerHeight - margin);
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 4000 }}>
      <FilterPanel
        open={open}
        onClose={onClose}
        value={value}
        onApply={onApply}
        isAdmin={isAdmin}
      />
    </div>,
    document.body
  );
}

FilterPanelDropdown.propTypes = {
  anchorRef: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  value: PropTypes.object,
  onApply: PropTypes.func,
  isAdmin: PropTypes.bool,
};

FilterPanelDropdown.defaultProps = {
  open: false,
  value: {},
  isAdmin: false,
};
