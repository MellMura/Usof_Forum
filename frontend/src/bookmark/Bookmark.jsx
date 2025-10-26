import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { getToken } from '../common/APIUtils';
import { toggleBookmark } from '../store/bookmarksActions';
import './Bookmark.css';

const Bookmark = ({ postId, initial = false }) => {
  const dispatch = useDispatch();
  const saved = !!initial;

  const onClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!getToken()) {
      alert('Please log in to use bookmarks.');
      return;
    }
    dispatch(toggleBookmark(postId, !saved));
  }, [dispatch, postId, saved]);

  const icon = saved ? 'bxs-bookmark' : 'bx-bookmark';

  return (
    <button
      type="button"
      className={`bookmark ${saved ? 'is-saved' : ''}`}
      aria-pressed={saved}
      onClick={onClick}
    >
      <i className={`bx ${icon} bookmark_icon`} aria-hidden="true" />
    </button>
  );
};

Bookmark.propTypes = {
  postId: PropTypes.number.isRequired,
  initial: PropTypes.bool,
};

Bookmark.defaultProps = {
  initial: false,
};

export default Bookmark;
