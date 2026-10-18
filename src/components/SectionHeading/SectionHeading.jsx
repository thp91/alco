import './SectionHeading.css';

function SectionHeading({ children, subtitle, align = 'center', size, as: Tag = 'h2', className = '' }) {
  const classes = ['section-heading', `section-heading--${align}`, size && `section-heading--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <Tag className="section-heading__title">{children}</Tag>
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
      <span className="section-heading__bar" aria-hidden="true" />
    </div>
  );
}

export default SectionHeading;
