import React from 'react';
import PropTypes from 'prop-types';
import { BASE } from './APIUtils';
import './Avatar.css';

import pawnFallback from './pawn.webp';

function resolveSrc(src, apiBase) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (/^\/\//.test(src)) return src;
  if (src.startsWith('/')) return `${apiBase}${src}`;
  return `${apiBase}/${src.replace(/^\.?\//, '')}`;
}

const Avatar = ({ src, name, size, cacheKey, apiBase}) => {
  const [broken, setBroken] = React.useState(false);
  const [fallbackBroken, setFallbackBroken] = React.useState(false);

  React.useEffect(() => {
    setBroken(false);
  }, [src, cacheKey]);


  const style = size ? { width: size, height: size } : undefined;

  if (src && !broken) {
    const abs = resolveSrc(src, apiBase || BASE);
    const withCache = cacheKey ? `${abs}?v=${encodeURIComponent(cacheKey)}` : abs;

    return (
      <div className="avatar" style={style} aria-hidden="true">
        <img
          src={withCache}
          alt={name ? `${name} avatar` : 'avatar'}
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  if (!fallbackBroken) {
    return (
      <div className="avatar" style={style} aria-hidden="true">
        <img
          src={pawnFallback}
          alt="default avatar"
          onError={() => setFallbackBroken(true)}
          draggable={false}
        />
      </div>
    );
  }
  
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="avatar" style={style} aria-label={name ? `${name} avatar` : 'avatar'}>
      {initial}
    </div>
  );
};



Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  cacheKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  apiBase: PropTypes.string,
};

Avatar.defaultProps = {
  src: undefined,
  name: '',
  size: undefined,
  cacheKey: undefined,
  apiBase: undefined,
};

export default Avatar;
