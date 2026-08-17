import { Link } from 'react-router-dom';
import About from './components/About';
import Skills from './components/Skills';

function Home() {
  const skills = ['Python', 'Machine Learning', 'React', 'JavaScript', 'CSS', 'Data Analysis'];

  return (
    <div className="route-page">
      <section className="hero" id="Home">
        <div className="hero-copy">
          <p className="eyebrow">AI & ML Student</p>
          <h2>Turning ideas into useful digital experiences.</h2>
          <p className="subtitle">
            I’m Poojan Bhadani, a student exploring AI, machine learning, and modern web development with a focus on building clean, practical solutions.
          </p>

          <div className="hero-actions">
            <Link to="/contact" className="primary-btn">Contact me</Link>
            <a href="#Skills" className="secondary-btn">My skills</a>
          </div>

          <div className="mini-stats">
            <div>
              <strong>2+</strong>
              <span>Projects</span>
            </div>
            <div>
              <strong>6+</strong>
              <span>Skills</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Curiosity</span>
            </div>
          </div>
        </div>

        <div className="hero-card profile-panel">
          <div className="profile-avatar">PB</div>
          <span className="card-label">Profile</span>
          <h3>Poojan Bhadani</h3>
          <p className="profile-role">AI & ML Student</p>

          <div className="social-row">
            <a href="mailto:poojan.bhadani@example.com">Email</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>

      <About />
      <Skills skillList={skills} />
    </div>
  );
}

export default Home;
