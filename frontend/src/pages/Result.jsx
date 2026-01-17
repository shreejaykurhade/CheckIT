import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader } from 'lucide-react';

const Result = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResult();
    }, [id]);

    const fetchResult = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/history/${id}`);
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError('Could not retrieve report data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Loader className="spin" size={48} />
            <p>DECRYPTING ARCHIVES...</p>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="brutal-box" style={{ borderColor: 'red' }}>
                <h2 style={{ color: 'red' }}>ERROR 404</h2>
                <p>{error}</p>
                <Link to="/app/history" className="brutal-btn" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> BACK TO ARCHIVES
                </Link>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Link to="/app/history" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'black', textDecoration: 'none', fontWeight: 'bold' }}>
                <ArrowLeft size={20} /> RETURN TO ARCHIVES
            </Link>

            <div className="brutal-box" style={{ marginBottom: '2rem' }}>
                <h3>// QUERY SUBMISSION</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>"{data.query}"</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    TIMESTAMP: {new Date(data.timestamp).toLocaleString()}
                </p>
            </div>

            {data.grading && (
                <div className={`score-card ${getScoreClass(data.grading.score)}`}>
                    <h1 style={{ fontSize: '6rem', margin: 0 }}>{data.grading.score}</h1>
                    <h3>TRUST SCORE</h3>
                    <p style={{ fontStyle: 'italic', fontSize: '1.2rem' }}>"{data.grading.reasoning}"</p>
                </div>
            )}

            <div className="analysis-box brutal-box">
                <h3>// DETAILED INVESTIGATION LOG</h3>
                <div className="markdown-content" style={{ textAlign: 'left', marginTop: '1rem', lineHeight: '1.8' }}>
                    {data.analysis}
                </div>
            </div>
        </div>
    );
};

function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
}

export default Result;
