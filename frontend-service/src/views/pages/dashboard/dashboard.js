import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Navbar, Nav, Pagination, Dropdown, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css'; 
import { format } from 'date-fns';
import { FaSync, FaDatabase, FaUser, FaTachometerAlt, FaChartBar } from 'react-icons/fa';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Include CSS for DatePicker
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    // State to store logs, current page, and date range
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState(null); // Use Date object instead of string
    const [toDate, setToDate] = useState(null); // Use Date object instead of string
    const [showGraph, setShowGraph] = useState(false);
    const [selectedGraph, setSelectedGraph] = useState('All');
    const recordsPerPage = 20;
    const navigate = useNavigate();
    const authToken = import.meta.env.VITE_API_TOKEN;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Fetch logs when the component mounts or when the current page or date range changes
    useEffect(() => {
        fetchLogs();
    }, [currentPage, fromDate, toDate]);

    // Function to fetch logs from API
    const fetchLogs = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/logs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setLogs(data);
            filterLogsByDate(data); // Call filter function after fetching the logs
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
   
    };

    // Function to filter logs based on the selected date range
    const filterLogsByDate = (logs) => {
        if (!fromDate || !toDate) {
            setFilteredLogs(logs);  // No date filter, show all logs
            return;
        }

        const filtered = logs.filter(log => {
            const logDate = new Date(log.date);
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);

            // Reset the time of both dates to 00:00:00 for accurate comparison
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            // If fromDate and toDate are the same, we check if the log date matches exactly
            return logDate >= startDate && logDate <= endDate;
        });

        setFilteredLogs(filtered); // Set filtered logs
    };

    const handleRefresh = () => {
        fetchLogs();
        setCurrentPage(1);// This will trigger useEffect and fetch logs for page 1
      };

    // Function to handle user sign-out
    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Pagination logic for filtered data
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredLogs.slice(indexOfFirstRecord, indexOfLastRecord);

    const toggleGraph = () => setShowGraph(!showGraph);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
    };

    const lineChartData = {
        labels: currentRecords.map(log => format(new Date(log.date), 'yyyy-MM-dd')),
        datasets: [
            {
                label: 'Trade Amount',
                data: currentRecords.map(log => log.trade_amnt),
                borderColor: 'rgb(255, 116, 52)',
                backgroundColor: 'rgba(184, 9, 9, 0.2)',
                fill: true,
            },
            {
                label: 'Expected Amount',
                data: currentRecords.map(log => log.expected_amnt),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true,
            },
            {
                label: 'Actual Amount',
                data: currentRecords.map(log => log.actual_amnt),
                borderColor: 'rgb(26, 126, 192)',
                backgroundColor: 'rgba(5, 47, 75, 0.2)',
                fill: true,
            }
        ]
    };

    const lineChartData_profit_loss = {
        labels: currentRecords.map(log => format(new Date(log.date), 'yyyy-MM-dd')),
        datasets: [
            {
                label: ' MEV Profit(%)',
                data: currentRecords.map(log => log.profit_percentage),
                borderColor: 'rgb(255, 116, 52)',
                backgroundColor: 'rgba(184, 9, 9, 0.2)',
                fill: true,
            },
            {
                label: 'Original Tx Loss(%)',
                data: currentRecords.map(log => (((log.expected_amnt-log.actual_amnt)/log.expected_amnt)*100).toFixed(2)),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true,
            },
        ]
        
    };

    const dataKeyMap = {
        "Trade Amount": "trade_amnt",
        "Expected Amount": "expected_amnt",
        "Actual Amount": "actual_amnt"
    };
    
    const selectedDataKey = dataKeyMap[selectedGraph] || "trade_amnt"; // Default fallback
    
    const barChartData = {
        labels: currentRecords.map(log => format(new Date(log.date), 'yyyy-MM-dd')),
        datasets: [
            {
                label: selectedGraph,
                data: currentRecords.map(log => log[selectedDataKey] || 0), // Ensure no undefined values
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
        ]
    };

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
                    <Button className="refresh-btn" onClick={handleRefresh}><FaSync /> Refresh Data</Button>
                    <Button className="graph-btn" onClick={toggleGraph}><FaChartBar /> Trade Statistics</Button>
                </div>

                {showGraph && (
                    <motion.div className="graph-container white-background" initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 5, y: -1 }}
                    transition={{ duration: 0.7 }}
                    style={{ background: '#f9f9f9', padding: '25px', borderRadius: '50px', paddingBottom: '20px' }}
                    >
                        <Dropdown onSelect={(eventKey) => setSelectedGraph(eventKey)}>
                            <Dropdown.Toggle variant="primary">
                                Select Graph ({selectedGraph})
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="All">All</Dropdown.Item>
                                <Dropdown.Item eventKey="Trade Amount">Trade Amount</Dropdown.Item>
                                <Dropdown.Item eventKey="Expected Amount">Expected Amount</Dropdown.Item>
                                <Dropdown.Item eventKey="Actual Amount">Actual Amount</Dropdown.Item>
                                <Dropdown.Item eventKey="Profit/Loss">MEV Profit / Loss</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        {selectedGraph === 'All' ? (<Line data={lineChartData} options={chartOptions} />) : selectedGraph === 'Profit/Loss' ? (<Line data={lineChartData_profit_loss} options={chartOptions} />) : (<Bar data={barChartData} options={chartOptions} />)}
                    </motion.div>
                )}

                {/* Date Picker Section */}
                <div className="date-filter-container d-flex justify-content-center mt-3">
                    <Form className="d-flex align-items-end gap-3">
                        <Form.Group controlId="fromDate">
                            <Form.Label>From Date : </Form.Label>
                            <DatePicker
                                selected={fromDate}
                                onChange={date => setFromDate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="From Date"
                                className="form-control date-picker-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="toDate">
                            <Form.Label>To Date :</Form.Label>
                            <DatePicker
                                selected={toDate}
                                onChange={date => setToDate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="To Date"
                                className="form-control date-picker-input"
                            />
                        </Form.Group>
                    </Form>
                </div>
                
                {/* Statistics Cards */}
                <div className="card-container">
                    <Card className="stat-card hover-card">
                        <Card.Body>
                            <h5>Total Transactions</h5>
                            <p>{filteredLogs.length}</p>
                            <div className="hover-details">
                                This represents the total number of transactions recorded.
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="stat-card hover-card">
                        <Card.Body>
                            <h5>Total Trade Amount</h5>
                            <p>
                                ${filteredLogs
                                    .reduce((sum, log) => sum + (parseFloat(log.trade_amnt) || 0), 0)
                                    .toFixed(2)
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </p>
                            <div className="hover-details">
                                This represents the total sum of trade amounts for transactions.
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="stat-card hover-card">
                        <Card.Body>
                            <h5>Total Expected Amount</h5>
                            <p>
                                ${filteredLogs
                                    .reduce((sum, log) => sum + (parseFloat(log.expected_amnt) || 0), 0)
                                    .toFixed(2)
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}  
                            </p>
                            <div className="hover-details">
                                    This represents the total sum of expected amounts for transactions.
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="stat-card hover-card">
                        <Card.Body>
                            <h5>Total Actual Amount</h5>
                            <p>
                                ${filteredLogs.reduce((sum, log) => sum + (parseFloat(log.actual_amnt) || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </p>
                            <div className="hover-details">
                                This represents the total sum of actual amounts for transactions.
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="stat-card hover-card">
                        <Card.Body>
                            <h5>Average Profit (%)</h5>
                            <p>
                                {(() => {
                                    const totalProfit = filteredLogs.reduce((sum, log) =>
                                        sum + (log.profit_percentage > 0 ? parseFloat(log.profit_percentage) || 0 : 0), 0
                                    );
                                    const profitCount = filteredLogs.filter(log => log.profit_percentage > 0).length;
                                    return profitCount > 0 ? (totalProfit / profitCount).toFixed(2) : 0;
                                })()}%
                            </p>
                            <div className="hover-details">
                                This represents average of profit across all transactions in %.
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="stat-card hover-card">
                        <Card.Body>
                            <h5>Average Loss (%)</h5>
                            <p>
                                {(
                                    (
                                        filteredLogs.reduce((sum, log) => sum + (parseFloat(log.expected_amnt) || 0), 0) -
                                        filteredLogs.reduce((sum, log) => sum + (parseFloat(log.actual_amnt) || 0), 0)
                                    ) /
                                    filteredLogs.reduce((sum, log) => sum + (parseFloat(log.expected_amnt) || 0), 0)
                                * 100).toFixed(2)}%
                            </p>
                            <div className="hover-details">
                                This represents average loss of transactions in % ((expected_amt-actual_amt/expected_amt)*100).
                            </div>
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
                                <th>Expected Amount</th>
                                <th>Actual Amount</th>
                                <th>MEV Profit(%)</th>
                                <th>Original Tx Loss(%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((log, index) => (
                                <tr key={index} className="table-row">
                                    <td>{format(new Date(log.date), 'yyyy-MM-dd')}</td>
                                    <td>{log.time}</td>
                                    <td>{log.trans_id.slice(0, 20)}...</td>
                                    <td>{log.mev_type}</td>
                                    <td>{log.trade_amnt}</td>
                                    <td>{log.expected_amnt}</td>
                                    <td>{log.actual_amnt}</td>
                                    <td className="profit">{log.profit_percentage.slice(0, 4)}</td>
                                    <td className="loss">{(((log.expected_amnt-log.actual_amnt)/log.expected_amnt)*100).toFixed(2)}</td>
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
