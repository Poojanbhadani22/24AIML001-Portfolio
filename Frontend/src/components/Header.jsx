function Header({ name, themeColor }) {
  return (
    <header
      className="site-header"
      style={{ background: `linear-gradient(135deg, ${themeColor}, #111827 55%, #1f2937)` }}
    >
      <div className="brand-block">
        <span className="brand-mark">PB</span>
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>{name}</h1>
        </div>
      </div>

      <p className="header-tag">AI • ML • Web</p>
    </header>
  );
}

export default Header;