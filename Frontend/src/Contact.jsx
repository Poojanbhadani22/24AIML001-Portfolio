import { useState } from 'react';

function Contact() {
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(true);

  return (
    <section className="contact-panel route-page">
      <div className="section-heading">
        <p className="eyebrow">Contact</p>
        <h2>Let’s connect</h2>
      </div>

      <div className="contact-box">
        <label htmlFor="message-input" className="contact-label">
          Message
        </label>

        <button type="button" className="hint-toggle" onClick={() => setShowHint((prev) => !prev)}>
          {showHint ? 'Hide tips' : 'Show tips'}
        </button>

        {showHint && (
          <p className="help-text">Share your idea, project discussion, or collaboration request.</p>
        )}

        <input
          id="message-input"
          className="contact-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
        />

        <p className="display-text">
          Preview: <strong>{message || 'Your message appears here'}</strong>
        </p>
      </div>
    </section>
  );
}

export default Contact;
