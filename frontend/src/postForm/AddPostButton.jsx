import React from 'react';
import PropTypes from 'prop-types';
import './PostForm.css';
import addIcon from './add_button.png';

const AddPostButton = ({ onClick }) => (
  <button
    type="button"
    className="creator"
    aria-label="Create a new post"
    onClick={onClick}
  >
    <img className="btn-icon" src={addIcon} alt="" aria-hidden="true" />
  </button>
);

AddPostButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default AddPostButton;
