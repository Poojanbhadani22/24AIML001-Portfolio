function Projects() {
  return (
    <section className="projects-panel route-page">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>Selected work</h2>
      </div>

      <div className="projects-grid">
        <article className="project-card">
          <span>01</span>
          <h3>Portfolio website</h3>
          <p>Built a responsive personal portfolio with a modern UI and clean user flow.</p>
        </article>

        <article className="project-card">
          <span>02</span>
          <h3>AI learning</h3>
          <p>Exploring machine learning concepts, tools, and practical data-driven applications.</p>
        </article>

        <article className="project-card">
          <span>03</span>
          <h3>Creative problem solving</h3>
          <p>Turning concepts into simple, effective interfaces and digital experiences.</p>
        </article>
      </div>
    </section>
  );
}

export default Projects;
