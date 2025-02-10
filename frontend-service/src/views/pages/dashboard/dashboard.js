import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Navbar, Nav, Pagination, Dropdown, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css'; 
import { FaSync, FaDatabase, FaUser, FaTachometerAlt } from 'react-icons/fa';

const Dashboard = () => {
    // State to store logs and current page
    const [logs, setLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 20;
    const navigate = useNavigate();
    const authToken = import.meta.env.VITE_API_TOKEN;

    // Fetch logs when the component mounts or when the current page changes
    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    // Function to fetch logs from API
    const fetchLogs = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/logs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Function to handle user sign-out
    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Pagination logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = logs.slice(indexOfFirstRecord, indexOfLastRecord);

    return (
        <>
            {/* Navigation Bar */}
            <Navbar expand="lg" className="custom-navbar">
                <Navbar.Brand className="brand">
                    <FaTachometerAlt /> Dashboard
                </Navbar.Brand>
                <Nav className="ms-auto">
                    <Dropdown>
                        <Dropdown.Toggle className="account-dropdown">
                            <FaUser /> Account
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Navbar>

            {/* Main Container */}
            <Container className="dashboard-container">
                <div className="header-section">
                    <h2 className="dashboard-title"><FaDatabase /> MEV Details</h2>
                    <Button className="refresh-btn" onClick={fetchLogs}><FaSync /> Refresh Data</Button>
                </div>

                {/* Statistics Cards */}
                <div className="card-container">
                    <Card className="stat-card">
                        <Card.Body>
                            <h5>Total Transactions</h5>
                            <p>{logs.length}</p>
                        </Card.Body>
                    </Card>
                    <Card className="stat-card">
                        <Card.Body>
                            <h5>Profitable Trades</h5>
                            <p>{logs.filter(log => log.profit > 0).length}</p>
                        </Card.Body>
                    </Card>
                    <Card className="stat-card">
                        <Card.Body>
                            <h5>Loss Trades</h5>
                            <p>{logs.filter(log => log.loss > 0).length}</p>
                        </Card.Body>
                    </Card>
                </div>

                {/* Logs Table */}
                <div className="table-responsive">
                    <Table striped bordered hover className="fade-in mev-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Transaction ID</th>
                                <th>MEV Type</th>
                                <th>Trade Amount</th>
                                <th>Swap Amount</th>
                                <th>Profit</th>
                                <th>Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((log, index) => (
                                <tr key={index} className="table-row">
                                    <td>{log.date}</td>
                                    <td>{log.time}</td>
                                    <td>{log.trans_id}</td>
                                    <td>{log.mev_type}</td>
                                    <td>{log.trade_amnt}</td>
                                    <td>{log.swap_amnt}</td>
                                    <td className="profit">{log.profit}</td>
                                    <td className="loss">{log.loss}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <Pagination className="pagination-container">
                    <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                    <Pagination.Item active>{currentPage}</Pagination.Item>
                    <Pagination.Next onClick={() => setCurrentPage(prev => prev + 1)} />
                </Pagination>
            </Container>
        </>
    );
};

export default Dashboard;
