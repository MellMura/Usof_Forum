import React from 'react';
import PropTypes from 'prop-types';
import './AuthTheme.css';

import boardImg from './chessboard.webp';
import knightImg from './knight.webp';
import bishopImg from './bishop.webp';

const AuthLayout = ({ title, children, below }) => {
    return (
      <div className="au_wrap">
        <div className="au_brand">ZUGZWANG.COM</div>
  
        <img src={knightImg} alt="" aria-hidden="true" className="au_piece au_piece--left" />
        <img src={bishopImg} alt="" aria-hidden="true" className="au_piece au_piece--right" />

        <div
          className="au_card"
          style={{ ['--board-url']: `url(${boardImg})` }}
        >
          <h1 className="au_title">{title}</h1>
          <div className="au_body">{children}</div>
        </div>
  
        {below ? <div className="au_below">{below}</div> : null}
      </div>
    );
  };
  
  AuthLayout.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    below: PropTypes.node,
  };
  
  AuthLayout.defaultProps = {
    below: null,
  };
  
  export default AuthLayout;
