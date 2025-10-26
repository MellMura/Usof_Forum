import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css';

function pickTier(rating) {
  if (rating == null) return { label: '—', icon: '•', color: 'gray' };
  if (rating <= 50)   return { label: 'Newbie', icon: '♙', color: 'green' };
  if (rating <= 200)  return { label: 'Advanced', icon: '♘', color: 'blue' };
  if (rating <= 500)  return { label: 'Expert', icon: '♖', color: 'orange' };
  return { label: 'Grandmaster', icon: '♕', color: 'red' };
}

const Badge = ({ rating, className }) => {
  const tier = pickTier(Number(rating));
  return (
    <span
      className={`badge badge--${tier.color}${className ? ` ${className}` : ''}`}
      title={`Rating: ${rating ?? 'n/a'}`}
      aria-label={`${tier.label} badge`}
    >
      <span className="badge_icon" aria-hidden="true">{tier.icon}</span>
      <strong><span className="badge_text">{tier.label.toLowerCase()}</span></strong>
    </span>
  );
};

Badge.propTypes = {
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};

Badge.defaultProps = {
  rating: undefined,
  className: '',
};

export default Badge;