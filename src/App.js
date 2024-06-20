import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { FaTrashAlt } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

function App() {
    const [ollamaModels, setOllamaModels] = useState([]);
    const [message, setMessage] = useState('');
    const [actionInput, setActionInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false); // State for access control
    const [secretInput, setSecretInput] = useState(''); // State for secret code input



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://proxyembedding.vm-app.cloud.cbh.kth.se/OllamaServerInfo/listModels');
                setOllamaModels(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Ollama models:', error);
                setLoading(false);
            }
        };

        fetchData();

        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    const removeModel = (modelName) => {
        setLoading(true);
        axios.get(`https://proxyembedding.vm-app.cloud.cbh.kth.se/removeModel?model=${modelName}`)
            .then(response => {
                setMessage(response.data);
                axios.get('https://proxyembedding.vm-app.cloud.cbh.kth.se/OllamaServerInfo/listModels')
                    .then(response => {
                        setOllamaModels(response.data);
                        setLoading(false);
                    })
                    .catch(error => {
                        console.error('Error fetching Ollama models:', error);
                        setLoading(false);
                    });
            })
            .catch(error => {
                console.error('Error removing model:', error);
                setMessage('Error removing model.');
                setLoading(false);
            });
    };

    const performAction = (action) => {
        if (action === 'Pull') {
            console.log(actionInput);
            axios.post('https://proxyembedding.vm-app.cloud.cbh.kth.se/OllamaServerInfo/pullModel', null, {
                params: {
                    modelName : actionInput
                }
            });
        } else {
            setMessage(`Action ${action} performed successfully.`);
        }
    };

    const handleAccess = () => {
        if (secretInput === 'OllamaServerKTH') {
            setAccessGranted(true);
            localStorage.setItem('authenticated', 'true'); // Save authentication status in localStorage
        } else {
            setMessage('Incorrect secret code. Please try again.');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                {accessGranted ? (
                    <>
                        {loading ? (
                            <FiLoader className="loading-icon" />
                        ) : (
                            <>
                                {message && <p>{message}</p>}
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Size</th>
                                        <th>Modified</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {ollamaModels.map((model, index) => (
                                        <tr key={index}>
                                            <td>{model.name}</td>
                                            <td>{model.id}</td>
                                            <td>{model.size} {model.byteSize}</td>
                                            <td>{model.modified}</td>
                                            <td>
                                                <button onClick={() => removeModel(model.name)}><FaTrashAlt /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="action-box">
                                    <input
                                        type="text"
                                        value={actionInput}
                                        onChange={(e) => setActionInput(e.target.value)}
                                        placeholder="Enter action here"
                                    />
                                </div>
                                <div className="additional-actions">
                                    <button onClick={() => performAction('Copy')}>Copy</button>
                                    <button onClick={() => performAction('Push')}>Push</button>
                                    <button onClick={() => performAction('Pull')}>Pull</button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="access-container">
                        <h1>Welcome to Ollama Models</h1>
                        <input
                            type="password"
                            value={secretInput}
                            onChange={(e) => setSecretInput(e.target.value)}
                            placeholder="Enter secret code"
                        />
                        <button onClick={handleAccess}>Enter</button>
                        {message && <p>{message}</p>}
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
