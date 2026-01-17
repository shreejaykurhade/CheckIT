import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, ShieldAlert } from 'lucide-react';

const Landing = () => {
    return (
        <div className="landing-page">
            <header className="hero-section brutal-box" style={{ margin: '2rem', border: '5px solid black' }}>
                <div className="hero-content">
                    <h1 className="hero-title">
                        THE <span style={{ color: 'var(--accent-color)' }}>TRUTH</span><br />
                        HAS NO<br />
                        AGENDA.
                    </h1>
                    <p className="hero-subtitle">
                        AI-Powered Indian Fact-Checking. Raw using Gemini & Tavily.
                        No filters. No bias. Just facts.
                    </p>
                    <Link to="/login">
                        <button className="brutal-btn" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>
                            Enter System <ArrowRight style={{ marginLeft: '10px' }} />
                        </button>
                    </Link>
                </div>
            </header>

            <section className="features-grid container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                <div className="brutal-box">
                    <Globe size={48} />
                    <h3>Deep Search</h3>
                    <p>Scans high-authority Indian domains including PIB, AltNews, and Government portals.</p>
                </div>
                <div className="brutal-box">
                    <ShieldAlert size={48} />
                    <h3>Conflict Detection</h3>
                    <p>Identifies contradictions between WhatsApp forwards and official records.</p>
                </div>
                <div className="brutal-box">
                    <h3>Trust Score</h3>
                    <p>Assigns a 0-100 reliability score based on source credibility and evidence strength.</p>
                </div>
            </section>
        </div>
    );
};

export default Landing;
