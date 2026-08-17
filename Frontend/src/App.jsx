import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './Home';
import Projects from './Projects';
import Contact from './Contact';
import Tasks from './Tasks';

function App() {
  const sections = ['Home', 'Projects', 'Tasks', 'Contact'];

  return (
    <div className="app-shell">
      <Header name="Poojan Bhadani" themeColor="#0f172a" />
      <NavBar sections={sections} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;