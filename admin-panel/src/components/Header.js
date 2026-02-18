import React from 'react';

const Header = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
    {actions ? <div>{actions}</div> : null}
  </div>
);

export default Header;
