import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/history');
            setHistory(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2 style={{ marginBottom: '2rem' }}>// ARCHIVED CHECKS</h2>

            {loading ? (
                <p>LOADING ARCHIVES...</p>
            ) : (
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {history.map((item) => (
                        <div key={item._id} className="brutal-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <span className={`badge ${item.grading?.score >= 50 ? 'safe' : 'risk'}`} style={{ fontWeight: 'bold', color: item.grading?.score >= 50 ? 'green' : 'red' }}>
                                    SCORE: {item.grading?.score || 'N/A'}
                                </span>
                                <p style={{ fontWeight: 'bold', marginTop: '1rem', fontSize: '1.2rem' }}>
                                    {item.query.length > 50 ? item.query.substring(0, 50) + '...' : item.query}
                                </p>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <Link to={`/app/result/${item._id}`} style={{ marginTop: '1rem', textDecoration: 'underline', color: 'black' }}>
                                VIEW FULL REPORT &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
