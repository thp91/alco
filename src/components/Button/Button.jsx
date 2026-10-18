import { Link } from 'react-router-dom';
import './Button.css';

function Button({ to, href, variant = 'primary', size, className = '', children, ...props }) {
  const classes = ['button', `button--${variant}`, size && `button--${size}`, className].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
