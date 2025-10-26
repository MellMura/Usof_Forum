import React from 'react';

export default function Rules() {
  return (
    <main className="feed" role="main" style={{ textAlign: 'justify' }} aria-labelledby="rules-title">
      <h2 id="rules-title" style={{ margin: '12px 0' }}>Rules of the Forum</h2>

      <section aria-labelledby="intro-title" style={{ marginBottom: 16 }}>
        <h3 id="intro-title" style={{ color: '#3c3332' }} className="sr-only">Introduction</h3>
        <p>
          Welcome to the <strong style={{ color: '#3c3332' }}>ZUGZWANG.com</strong> - a forum created specifically for Chess enjoyers from Chess enjoyers.
          It was made to provide a platform for experience and knowledge exchange and take up a certain niche
          for a wonderful community of chess geeks.
        </p>
        <p>
          Whether you are just starting or already advanced, this forum is your board for learning, analysis,
          and thoughtful discussion.
        </p>
      </section>

      <hr style={{ color: '#3c3332' }}/>

      <section aria-labelledby="conduct-title" style={{ marginTop: 16 }}>
        <h3 id="conduct-title" style={{ color: '#3c3332' }}>General Rules</h3>
        <ul>
          <li><strong>Respect others.</strong> Disagreements are fine - insults, harassment, and discrimination are not.</li>
          <li><strong>Stay on topic.</strong> Keep discussions related to chess and closely related subjects. Choose corresponding categories for your posts to not mislead other's</li>
          <li><strong>Use appropriate language.</strong> Avoid offensive, explicit, or inflammatory phrasing.</li>
          <li><strong>Avoid spam.</strong> Make your posts and comments informative and always think twice before posting. Better one good post than 10 bad ones.</li>
        </ul>
      </section>

      <section aria-labelledby="moderation-title" style={{ marginTop: 16 }}>
        <h3 id="moderation-title" style={{ color: '#3c3332' }}>Moderation and Consequences</h3>
        <ul>
          <li>Admins act to maintain a respectful and productive environment.</li>
          <li>Violations may result in content removal, making posts/comments inactive, warnings, or deletion of your account.</li>
        </ul>
      </section>
      <hr style={{ color: '#3c3332' }}/>

      <section aria-labelledby="final-title" style={{ marginTop: 16 }}>
        <h3 id="final-title" style={{ color: '#3c3332' }}>Final Note</h3>
        <p>
          By participating in <strong style={{ color: '#3c3332' }}>ZUGZWANG.com</strong>, you agree to follow these rules and uphold a culture of respect,
          fairness, and shared learning. Every move you make shapes the community—make yours count.
        </p>
      </section>
    </main>
  );
}
