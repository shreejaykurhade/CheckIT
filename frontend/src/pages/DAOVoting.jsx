import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Users, Clock, Scale, Wallet, AlertCircle } from 'lucide-react';
import { BrowserProvider } from 'ethers';

const DAOVoting = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vote, setVote] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [voterAddress, setVoterAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [walletError, setWalletError] = useState('');

    useEffect(() => {
        fetchCase();
        checkWalletConnection();
    }, [caseId]);

    const checkWalletConnection = async () => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    setVoterAddress(accounts[0].address);
                }

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length > 0) {
                        setVoterAddress(accounts[0]);
                    } else {
                        setVoterAddress('');
                    }
                });

            } catch (err) {
                console.error("Error checking wallet connection:", err);
            }
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setWalletError("MetaMask is not installed. Please install it to vote.");
            return;
        }

        try {
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setVoterAddress(accounts[0]);
            setWalletError('');
        } catch (err) {
            console.error("User rejected request or error:", err);
            setWalletError("Connection failed. Please try again.");
        }
    };

    const fetchCase = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/dao/case/${caseId}`);
            setCaseData(response.data);
        } catch (error) {
            console.error('Error fetching case:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (e) => {
        e.preventDefault();
        if (!vote || !voterAddress) return;

        setSubmitting(true);
        try {
            await axios.post('http://localhost:3000/api/dao/vote', {
                caseId,
                voterAddress, // Using the connected wallet address
                vote,
                reasoning
            });
            alert('Vote submitted successfully!');
            fetchCase(); // Refresh case data
            setVote('');
            setReasoning('');
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container"><h2>Loading case...</h2></div>;
    }

    if (!caseData) {
        return <div className="container"><h2>Case not found</h2></div>;
    }

    const trueVotes = caseData.votes?.filter(v => v.vote === 'true').length || 0;
    const falseVotes = caseData.votes?.filter(v => v.vote === 'false').length || 0;
    const totalVotes = caseData.votes?.length || 0;

    return (
        <div className="container">
            <div className="brutal-box" style={{ background: 'var(--highlight-color)', marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Scale size={36} /> TRUTH DAO CASE
                </h1>
                <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
                    <strong>Query:</strong> {caseData.query}
                </p>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <Users size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        <strong>Total Votes:</strong> {totalVotes}
                    </div>
                    <div>
                        <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        <strong>Deadline:</strong> {new Date(caseData.votingDeadline).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Status:</strong> {caseData.status.toUpperCase()}
                    </div>
                </div>
            </div>

            <div className="brutal-box" style={{ marginBottom: '2rem' }}>
                <h3>AI ANALYSIS (Initial Score: {caseData.initialScore}/100)</h3>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                    {(() => {
                        let content = caseData.analysis;

                        // Helper to render structured data
                        const renderStructured = (data) => (
                            <div>
                                {data.summary && (
                                    <>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem', textTransform: 'uppercase' }}>SUMMARY</h4>
                                        <p>{data.summary}</p>
                                    </>
                                )}
                                {data.evidence && data.evidence.length > 0 && (
                                    <>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1.5rem', textTransform: 'uppercase' }}>EVIDENCE</h4>
                                        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                                            {data.evidence.map((ev, k) => <li key={k}>{ev}</li>)}
                                        </ul>
                                    </>
                                )}
                                {data.conclusion && (
                                    <>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1.5rem', textTransform: 'uppercase' }}>CONCLUSION</h4>
                                        <p>{data.conclusion}</p>
                                    </>
                                )}
                            </div>
                        );

                        // Case 1: Already an object
                        if (typeof content === 'object' && content !== null) {
                            return renderStructured(content);
                        }

                        // Case 2: String that might be JSON
                        if (typeof content === 'string') {
                            if (content.trim().startsWith('{') || content.includes('"summary":')) {
                                try {
                                    const json = JSON.parse(content);
                                    return renderStructured(json);
                                } catch (e) {
                                    // Fall through to text rendering
                                }
                            }

                            // Case 3: Regular text (Markdown cleanup)
                            return content.split('### Sources')[0].split('\n').map((line, i) => {
                                const cleanLine = line.replace(/\*\*/g, '').replace(/\{/g, '').replace(/\}/g, '').replace(/#/g, '');
                                if (line.trim().startsWith('SUMMARY') || line.trim().startsWith('CONCLUSION')) {
                                    return (
                                        <h4 key={i} style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            marginTop: '1.5rem',
                                            marginBottom: '0.5rem',
                                            color: 'black',
                                            textTransform: 'uppercase'
                                        }}>
                                            {cleanLine.trim()}
                                        </h4>
                                    );
                                }
                                return <div key={i}>{cleanLine}</div>;
                            });
                        }
                        return null;
                    })()}
                </div>
            </div>

            <div className="brutal-box" style={{ marginBottom: '2rem' }}>
                <h3>CURRENT VOTING RESULTS</h3>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: '#4cd137', border: '3px solid black' }}>
                        <ThumbsUp size={32} />
                        <h2 style={{ margin: '0.5rem 0' }}>{trueVotes}</h2>
                        <p>TRUE</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: '#e84118', color: 'white', border: '3px solid black' }}>
                        <ThumbsDown size={32} />
                        <h2 style={{ margin: '0.5rem 0' }}>{falseVotes}</h2>
                        <p>FALSE</p>
                    </div>
                </div>
            </div>

            {caseData.status === 'pending' && (
                <div className="brutal-box" style={{ borderLeft: '10px solid var(--secondary-color)' }}>
                    <h3>SUBMIT YOUR VOTE</h3>

                    {!voterAddress ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                Connect your Ethereum wallet to participate in the Truth DAO.
                            </p>
                            <button
                                onClick={connectWallet}
                                className="brutal-btn"
                                style={{
                                    background: '#f6851b', // MetaMask orange
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '1rem 2rem'
                                }}
                            >
                                <Wallet size={24} /> CONNECT WALLET
                            </button>
                            {walletError && (
                                <p style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={16} /> {walletError}
                                </p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleVote}>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f0f0', border: '2px solid black', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wallet size={20} />
                                <div>
                                    <span style={{ fontSize: '0.8rem', display: 'block', color: '#666' }}>CONNECTED WALLET</span>
                                    <strong>{voterAddress}</strong>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Your Vote:
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        className="brutal-btn"
                                        onClick={() => setVote('true')}
                                        style={{
                                            background: vote === 'true' ? '#4cd137' : 'white',
                                            color: vote === 'true' ? 'white' : 'black',
                                            flex: 1,
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ThumbsUp size={16} /> TRUE
                                    </button>
                                    <button
                                        type="button"
                                        className="brutal-btn"
                                        onClick={() => setVote('false')}
                                        style={{
                                            background: vote === 'false' ? '#e84118' : 'white',
                                            color: vote === 'false' ? 'white' : 'black',
                                            flex: 1,
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ThumbsDown size={16} /> FALSE
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Reasoning (Optional):
                                </label>
                                <textarea
                                    value={reasoning}
                                    onChange={(e) => setReasoning(e.target.value)}
                                    placeholder="Explain your vote..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        border: '4px solid black',
                                        padding: '1rem',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="brutal-btn"
                                disabled={!vote || submitting}
                                style={{ background: 'black', color: 'white', width: '100%' }}
                            >
                                {submitting ? 'SUBMITTING VOTE...' : 'SUBMIT VOTE'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {caseData.status === 'resolved' && (
                <div className="brutal-box" style={{ background: '#4cd137', border: '5px solid black' }}>
                    <h2>✅ CASE RESOLVED</h2>
                    <p style={{ fontSize: '1.3rem', marginTop: '1rem' }}>
                        <strong>Final Verdict:</strong> {caseData.finalVerdict.toUpperCase()}
                    </p>
                    <p style={{ fontSize: '1.3rem' }}>
                        <strong>Consensus Score:</strong> {caseData.consensusScore}%
                    </p>
                </div>
            )}
        </div>
    );
};

export default DAOVoting;
