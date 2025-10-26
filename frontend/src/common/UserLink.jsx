import PropTypes from 'prop-types';

export default function UserLink({ id, login, children, className }) {
  if (!id) return <span className={className}>{children || login}</span>;
  return (
    <a href={`/profile?u=${id}`} className={className} title={login}>
      {children || login}
    </a>
  );

}
UserLink.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  login: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};
