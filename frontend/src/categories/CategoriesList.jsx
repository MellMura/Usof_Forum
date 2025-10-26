import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { listCategories } from './CategoriesAPI';
import './CategoriesList.css';
import FilterPanelDropdown from '../filters/FilterPanelDropdown';

const labelOf = (c) => c?.name ?? String(c?.id ?? '');
const descOf  = (c) => c?.description ?? '';

const CategoriesList = ({ initial, onChange, showAllLabel = 'All', onOpenFilters, filtersActive,  openFilters,
  onCloseFilters,
  filters,
  onApplyFilters,
  isAdmin,}) => {
  const [items, setItems] = useState([]);
  const [picked, setPicked] = useState(() => new Set((initial || []).map(Number)));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = new Set((initial || []).map(Number));
    let changed = false;
    if (next.size !== picked.size) changed = true;
    else {
      for (const v of next) if (!picked.has(v)) { changed = true; break; }
    }
    if (changed) setPicked(next);
  }, [initial]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listCategories()
      .then((arr) => { if (alive) setItems(Array.isArray(arr) ? arr : []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    onChange?.(Array.from(picked));
  }, [picked, onChange]);

  const isAll = picked.size === 0;

  const toggle = (id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      const nid = Number(id);
      if (next.has(nid)) next.delete(nid);
      else next.add(nid);
      return next;
    });
  };

  const clearAll = () => setPicked(new Set());

  const orderedItems = useMemo(() => {
    const selectedOrder = Array.from(picked);
    const selectedSet = new Set(selectedOrder);

    const selected = [];
    const unselected = [];

    for (const c of items) {
      const cid = Number(c.id);
      if (selectedSet.has(cid)) selected.push(c);
      else unselected.push(c);
    }

    selected.sort((a, b) => selectedOrder.indexOf(Number(a.id)) - selectedOrder.indexOf(Number(b.id)));
    return [...selected, ...unselected];
  }, [items, picked]);

  const wrapRef = useRef(null);

  return (
    <nav className="cats" aria-label="Post categories">
      <div className="cats-scroll">
        <div className="cat-filt-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`cat cat--icon ${filtersActive ? 'cat--icon-on' : ''}`}
            onClick={onOpenFilters}
            aria-label="Open filters"
            title="Open filters"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" fill="currentColor" />
            </svg>
            {filtersActive && <span className="cat-dot" aria-hidden="true" />}
          </button>

          <FilterPanelDropdown
            anchorRef={wrapRef}
            open={openFilters}
            onClose={onCloseFilters}
            value={filters}
            onApply={onApplyFilters}
            isAdmin={isAdmin}
          />
        </div>
        <button
          type="button"
          className={`cat ${isAll ? 'is-active' : ''}`}
          onClick={clearAll}
          aria-pressed={isAll}
          title="All posts"
        >
          {showAllLabel}
        </button>

        {orderedItems.map((c) => {
          const id = c.id;
          const active = picked.has(id);
          const name = labelOf(c);
          const desc = descOf(c);
          return (
            <button
              key={id}
              type="button"
              className={`cat ${active ? 'is-active' : ''}`}
              onClick={() => toggle(id)}
              aria-pressed={active}
              title={desc || name}
            >
              {name}
            </button>
          );
        })}

        {loading ? <span className="cat cat--muted">Loading…</span> : null}
      </div>
    </nav>
  );
};


CategoriesList.propTypes = {
  initial: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  showAllLabel: PropTypes.string,
  onOpenFilters: PropTypes.func,
  filtersActive: PropTypes.bool,

  openFilters: PropTypes.bool,
  onCloseFilters: PropTypes.func,
  filters: PropTypes.object,
  onApplyFilters: PropTypes.func,
  isAdmin: PropTypes.bool,
};

CategoriesList.defaultProps = {
  initial: [],
  onChange: undefined,
  showAllLabel: 'All',
  onOpenFilters: undefined,
  filtersActive: false,
  openFilters: false,
  onCloseFilters: undefined,
  filters: {},
  onApplyFilters: undefined,
  isAdmin: false,
};

export default CategoriesList;
