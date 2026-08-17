import { NavLink } from 'react-router-dom';

function NavBar({ sections }) {
  const pathMap = {
    Home: '/',
    Projects: '/projects',
    Tasks: '/tasks',
    Contact: '/contact',
  };

  return (
    <nav className="site-nav" aria-label="Main navigation">
      {sections.map((section) => (
        <NavLink
          key={section}
          to={pathMap[section] || '/'}
          className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}
        >
          {section}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavBar;