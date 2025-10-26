import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddCategoryForm from './AddCategoryForm';
import Category from '../categories/Category';
import EditCategoryForm from '../categories/EditCategoryForm';
import Confirm from '../common/Confirm';
import './AdminPanel.css';

import { loadCategories, updateCategoryThunk, deleteCategoryThunk } from '../store/categoriesActions';

export default function AdminCats() {
  const dispatch = useDispatch();
 
  const { items, status, error } = useSelector((s) => s.categories || {
    items: [], status: 'idle', error: null,
  });

  const [openAdd, setOpenAdd] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmDelOpen, setConfirmDelOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(loadCategories());
  }, [dispatch]);

  const sorted = [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  const openEdit = (id) => {
    const found = items.find(c => Number(c.id) === Number(id));
    if (found) {
      setEditing(found);
      setEditOpen(true);
    }
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmDelOpen(true);
  };

  const handleSave = async ({ id, name, description }) => {
    setBusy(true);
    try {
      await dispatch(updateCategoryThunk(id, { name, description }));
      await dispatch(loadCategories());
      setEditOpen(false);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    setBusy(true);
    try {
      await dispatch(deleteCategoryThunk(deleteId));
      await dispatch(loadCategories());
      setConfirmDelOpen(false);
      setDeleteId(null);
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return <div className="feed"><h2>Categories</h2><p>Loading…</p></div>;
  }
  if (status === 'error') {
    return <div className="feed"><h2>Categories</h2><p>Error: {error}</p></div>;
  }

  return (
    <div className="feed">
      <h2 style={{ margin: '12px 0' }}>Categories <small style={{ fontWeight: 400 }}>({sorted.length})</small></h2>
      
      <div className="admin_btn">
        <button className="btn" type="button" onClick={() => setOpenAdd(true)}>
          Create new category
        </button>
      </div>

      <div className="cards">
      {sorted.map(c => (
        <Category
          key={c.id}
          id={c.id}
          name={c.name}
          description={c.description || ''}
          onEdit={openEdit}
          onDelete={askDelete}
        />
        ))}
      </div>

      {sorted.length === 0 && <p>No categories.</p>}

      <AddCategoryForm
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => {
          setOpenAdd(false);
          dispatch(loadCategories());
        }}
      />

      <EditCategoryForm
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditing(null); }}
        category={editing}
        onSave={handleSave}
      />

      <Confirm
        open={confirmDelOpen}
        title="Delete this category?"
        message="This action cannot be undone."
        confirmText={busy ? 'Deleting…' : 'Delete'}
        confirmDisabled={busy}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmDelOpen(false); setDeleteId(null); }}
      />
    </div>
  );
}
