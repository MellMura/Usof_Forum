import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './FilterPanel.css';

export default function FilterPanel({ open, onClose, value, onApply, isAdmin }) {
  const [local, setLocal] = useState({
    date_from: '',
    date_to: '',
    sort: 'likes',
    order: 'desc',
    status: '',
  });

  useEffect(() => {
    if (open && value) setLocal((s) => ({ ...s, ...value }));
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => (e.key === 'Escape' ? onClose?.() : null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const validDates = useMemo(() => {
    if (!local.date_from || !local.date_to) return true;
    return new Date(local.date_from) <= new Date(local.date_to);
  }, [local.date_from, local.date_to]);

  const clear = () => setLocal({
    date_from: '',
    date_to: '',
    sort: 'likes',
    order: 'desc',
    status: '',
  });

  const apply = () => {
    if (!validDates) return;
    onApply?.({
      ...value,
      date_from: local.date_from,
      date_to: local.date_to,
      sort: local.sort,
      order: local.order,
      status: isAdmin ? local.status : '',
    });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="filt_dd" role="dialog" aria-label="Filters">
      <div className="filt_dd_arrow" aria-hidden="true" />

      <div className="filt_dd_row grid2">
        <label>
          <span>Date from</span>
          <input
            type="date"
            value={local.date_from}
            onChange={(e) => setLocal((s) => ({ ...s, date_from: e.target.value }))}
          />
        </label>
        <label>
          <span>Date to</span>
          <input
            type="date"
            value={local.date_to}
            onChange={(e) => setLocal((s) => ({ ...s, date_to: e.target.value }))}
          />
        </label>
        {!validDates && <div className="filt_dd_err">“From” must be before “To”.</div>}
      </div>

      <div className="filt_dd_row grid2">
        <label>
          <span>Sort by</span>
          <select
            value={local.sort}
            onChange={(e) => setLocal((s) => ({ ...s, sort: e.target.value }))}
          >
            <option value="likes">Score (likes−dislikes)</option>
            <option value="date">Date</option>
          </select>
        </label>

        <label>
          <span>Order</span>
          <select
            value={local.order}
            onChange={(e) => setLocal((s) => ({ ...s, order: e.target.value }))}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
      </div>

      {isAdmin && (
        <div className="filt_dd_row">
          <label>
            <span>Status</span>
            <select
              value={local.status}
              onChange={(e) => setLocal((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      )}

      <div className="filt_dd_actions">
        <button type="button" className="btn ghost" onClick={clear}>Clear</button>
        <button type="button" className="btn" disabled={!validDates} onClick={apply}>Apply</button>
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  value: PropTypes.object,
  onApply: PropTypes.func,
  isAdmin: PropTypes.bool,
};

FilterPanel.defaultProps = {
  open: false,
  value: {},
  isAdmin: false,
};
