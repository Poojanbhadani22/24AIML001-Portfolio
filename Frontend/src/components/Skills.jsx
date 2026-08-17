function Skills({ skillList }) {
  return (
    <section className="skills-section" id="Skills">
      <div className="section-heading">
        <p className="eyebrow">Skills</p>
        <h2>Core strengths</h2>
      </div>

      <div className="skill-list">
        {skillList.map((skill) => (
          <span key={skill} className="skill-item">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

export default Skills;