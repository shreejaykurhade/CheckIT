import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader } from 'lucide-react';

const Home = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        // Mock API call for now if backend isn't ready, but we'll try the real one
        try {
            const response = await axios.post('http://localhost:3000/api/check', { query });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError('SYSTEM FAILURE: Unable to contact verification servers.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="brutal-box" style={{ borderBottomWidth: '5px' }}>
                <form onSubmit={handleCheck} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="INPUT CLAIM FOR VERIFICATION..."
                        disabled={loading}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="brutal-btn" disabled={loading}>
                        {loading ? <Loader className="spin" /> : <Search />}
                    </button>
                </form>
            </div>

            {error && (
                <div className="brutal-box" style={{ marginTop: '2rem', backgroundColor: '#ffe6e6', borderColor: 'red' }}>
                    <h3 style={{ color: 'red' }}>ERROR</h3>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="result-section">
                    {result.grading && (
                        <div className={`score-card ${getScoreClass(result.grading.score)}`}>
                            <h1 style={{ fontSize: '5rem', margin: 0 }}>{result.grading.score}</h1>
                            <h3>TRUST SCORE</h3>
                            <p style={{ fontStyle: 'italic' }}>"{result.grading.reasoning}"</p>
                        </div>
                    )}

                    <div className="analysis-box brutal-box">
                        <h3>// ANALYSIS LOG</h3>
                        <div className="markdown-content" style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                            {result.analysis?.split('### Sources')[0] || result.analysis}
                        </div>
                    </div>

                    {result.analysis?.includes('### Sources') && (
                        <div className="brutal-box" style={{ marginTop: '2rem', borderLeft: '10px solid var(--secondary-color)' }}>
                            <h3>// SOURCES & REFERENCES</h3>
                            <div style={{ textAlign: 'left' }}>
                                {result.analysis.split('### Sources')[1]?.split('\n')
                                    .filter(line => line.trim())
                                    .map((line, idx) => {
                                        const match = line.match(/(\d+)\.\s*\[([^\]]+)\]\(([^)]+)\)/);
                                        if (match) {
                                            const [, num, title, url] = match;
                                            return (
                                                <div key={idx} style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f9f9f9', border: '2px solid black' }}>
                                                    <strong>[{num}]</strong>{' '}
                                                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-color)', textDecoration: 'underline', fontWeight: 'bold' }}>
                                                        {title}
                                                    </a>
                                                    <br />
                                                    <span style={{ fontSize: '0.85rem', color: '#555', wordBreak: 'break-all' }}>{url}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
}

export default Home;
