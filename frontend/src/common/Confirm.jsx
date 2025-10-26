import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Confirm.css';

const Confirm = ({
  open,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  className = '',
  style = {},
}) => {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel?.();
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const overlay = (
    <div
      className="confirm_overlay"
      onMouseDown={onCancel}
      role="presentation"
    >
      <div
        className={`confirm ${className}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="confirm_text" id="confirm-title">
          {title}
        </p>
        {message ? <p className="confirm_sub">{message}</p> : null}
        <div className="confirm_actions">
          <button type="button" className="cfm_btn cfm_btn--cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className="cfm_btn cfm_btn--confirm"
            onClick={onConfirm}
            ref={confirmBtnRef}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
};

Confirm.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Confirm;
