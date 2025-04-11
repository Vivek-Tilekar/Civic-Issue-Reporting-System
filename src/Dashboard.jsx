import React, { useState, useEffect } from "react";
import axios from "axios";
import markerIcon from "./marker-icon.png";
import { Bar, Pie } from "react-chartjs-2";

import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { Link } from "react-router-dom";
import config from "./config.json"
import { useNavigate } from "react-router-dom";
import moment from 'moment';


ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);


import Sentiment from 'sentiment'
import MapComponent from "./MapComponent";
import IssueList from "./IssueList";

// Create a new Sentiment instance
const sentiment = new Sentiment();

// Example text


const Dashboard = () => {
    const [viewPort, setViewPort] = useState({
        latitude: 22.275193,
        longitude: 73.187928,
        zoom: 14,
    });
    const [requests, setRequests] = useState([]);
    const [selectedCity, setSelectedCity] = useState("Vadodara");
    const [volunteer, setVolunteer] = useState([]);
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Get user details from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
        setUserData(JSON.parse(storedUser));
        } else {
        navigate("/"); // Redirect to login if no user data found
        }
    }, [navigate]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests`);
                if (response.data && response.data.data) {
                    setRequests(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchRequests(); // Fetch immediately
        const intervalId = setInterval(fetchRequests, 10000); // Fetch every 10 seconds instead of 1 sec
    
        return () => clearInterval(intervalId); // Cleanup
    }, [requests]);

    


    useEffect(() => {
        if (selectedRequest) {
            fetchComments(selectedRequest._id);
        }
    }, [selectedRequest]);

    const fetchComments = async (requestId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests/${requestId}/comments`);
            setComments(response.data.comments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const Username = "ResQ Admin";
        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/issue/requests/comment`, {
                requestId: selectedRequest._id,
                username: Username,
                text: newComment
            });
            setComments(response.data.comments);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };
    

    const filteredRequests = requests.filter(
        (request) => request.city === "Vadodara"
    );

    const filteredRequest2 = requests.filter(
        (request) => request.area === userData?.area
    );


    const filteredVolunteers = volunteer.filter(
        (Volluntear) => Volluntear.city === selectedCity
    );
    // console.log(filteredVolunteers)

    const openPopup = (request) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setShowPopup(true);
      };
    
      const closePopup = () => {
        setShowPopup(false);
        setSelectedRequest(null);
      };
    
      const updateStatus = async () => {
        if (!selectedRequest) return;
        try {
          const response = await axios.put(`${config.API_BASE_URL}/api/issue/requests`, {
            id: selectedRequest._id,
            status: newStatus,
            userId: selectedRequest.userId,
          });

          console.log(`user id is: ${selectedRequest._id}`);
          console.log(requests._id);
          
          setRequests(requests.map(req => req._id === selectedRequest._id ? response.data.data : req));
          closePopup();
        } catch (error) {
          console.log('Error updating status:', error);
        }
      };


    const totalRequests = filteredRequest2.length;

    // Chart Content
    
    const statusStats = filteredRequest2.reduce(
        (acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
        },
        { pending: 0, completed: 0, inProgress: 0 }
    );

    

    const locationStats = filteredRequest2.reduce((acc, request) => {
        const { area, numberOfPeople } = request;
        acc[area] = (acc[area] || 0) + numberOfPeople;
        return acc;
    }, {});


    const categoryStats = filteredRequests.reduce((acc, request) => {
        acc[request.category] = (acc[request.category] || 0) + 1;
        return acc;
    }, {});
    
    const categoryChartData = {
        labels: Object.keys(categoryStats),
        datasets: [
            {
                label: "Number of People",
                data: Object.values(categoryStats),
                backgroundColor: "#4BC0C0",
            },
        ],
    };

    const categoryAreaStats = filteredRequest2.reduce((acc, request) => {
        acc[request.category] = (acc[request.category] || 0) + 1;
        return acc;
    }, {});

    const categoryAreaChartData = {
        labels: Object.keys(categoryAreaStats),
        datasets: [
            {
                label: "Number of People Who Reported",
                data: Object.values(categoryAreaStats),
                backgroundColor: "#36A2EB",
            },
        ],
    };

    const areaStats = requests
        .filter((request) => request.city.startsWith("Vadodara"))
        .reduce((acc, request) => {
            acc[request.area] = (acc[request.area] || 0) + 1;
            return acc;
        }, {});

    const sortedAreas = Object.entries(areaStats).sort((a, b) => b[1] - a[1]);

    // Status numbers

    const statusAreaStats = filteredRequest2.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
    }, {});

    const statusAreas = Object.entries(statusAreaStats).sort((a, b) => b[1] - a[1]);

    const statusStatistic = filteredRequest2.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
    }, {});
    
    const statusChartData = {
        labels: Object.keys(statusStatistic), // ["Pending", "In progress", "Complete"]
        datasets: [
            {
                label: "Number of Requests by Status",
                data: Object.values(statusStatistic), // [Count of Pending, In progress, Complete]
                backgroundColor: ["#FF6384", "#FFCE56", "#4BC0C0"], // Different colors for each status
            },
        ],
    };

    // 1. Response Time Analysis (Bar Chart)
    const responseTimeData = filteredRequest2.map(req => {
        const created = moment(req.createdAt);
        const updated = moment(req.updatedAt);
        const diffInHours = updated.diff(created, 'hours', true); // or use 'minutes' if you want finer granularity
        return {
            id: req.name,
            time: parseFloat(diffInHours.toFixed(2)),
        };
    });

    const responseTimeChartData = {
        labels: responseTimeData.map(item => item.id),
        datasets: [
            {
                label: "Response Time (hrs)",
                data: responseTimeData.map(item => item.time),
                backgroundColor: "#36A2EB",
            },
        ],
    };

    // 2. Issue Category Distribution (Pie Chart)
    const categoryCount = filteredRequest2.reduce((acc, req) => {
        acc[req.category] = (acc[req.category] || 0) + 1;
        return acc;
    }, {});

    const myCategoryChartData = {
        labels: Object.keys(categoryCount),
        datasets: [
            {
                data: Object.values(categoryCount),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"], // Add more if needed
            },
        ],
    };

    return (
        <div style={{ width: "100vw", height: "100vh", padding: "20px", boxSizing: "border-box" }}>
            {/* Header */}
            <div
                style={{
                    width: "100%",
                    height: "10vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: "10px",
                }}
            >
                <h1>ResQ Board</h1>
            </div>

            

            {/* Main content (Flex Layout) */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    marginBottom: "20px",
                }}
            >
                {/* Left side - Charts */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "48%",  // Adjusted for 2-column layout
                        height: "80vh",
                    }}
                >
                    {/* Total Requests and Status Breakdown */}
                    <div
                        style={{
                            backgroundColor: "#f2f2f2",
                            borderRadius: "8px",
                            padding: "20px",
                            flex: 1,
                        }}
                    >
                        <h3>Total Requests</h3>
                        <p>{totalRequests}</p>
                        <h3>Status Breakdown</h3>
                        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                            <li>Pending: {statusStats.pending}</li>
                            <li>Resolved: {statusStats.Completed}</li>
                            <li>In Progress: {statusStats.inProgress}</li>
                        </ul>
                    </div>

                    

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px", flex: 1 }}>
                        <h3>Category Breakdown</h3>
                        <Bar data={categoryChartData} options={{ responsive: true }} />
                    </div>

                    {/* area request count */}

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
                        <h3>Reports by Area in Vadodara</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#ddd" }}>
                                    <th style={{ padding: "10px", border: "1px solid #ccc" }}>Area</th>
                                    <th style={{ padding: "10px", border: "1px solid #ccc" }}>Number of Reports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAreas.map(([area, count]) => (
                                    <tr key={area}>
                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>{area}</td>
                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>{count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Location and Number of People Breakdown (Bar Chart) */}
                    <div
                        style={{
                            backgroundColor: "#f2f2f2",
                            borderRadius: "8px",
                            padding: "20px",
                            marginTop: "20px",
                            flex: 1,
                        }}
                    >
                        <h3>Status Chart of {userData?.area}</h3>
                        <Bar data={statusChartData} options={{ responsive: true }} />
                    </div>

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px", flex: 1 }}>
                        <h3>Category Breakdown for {userData?.area}</h3>
                        <Bar data={categoryAreaChartData} options={{ responsive: true }} />
                    </div>

                    <div style={{ width: "100%", marginTop: "40px" }}>
                        <h3>Response Time Analysis (in Hours)</h3>
                        <Bar data={responseTimeChartData} options={{ responsive: true }} />
                    </div>
                </div>

                {/* Right side - Map and List of Issues */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "48%",  // Adjusted for 2-column layout
                       
                    }}
                >
                    {/* Map */}
                    <div
                        style={{
                            width: "100%",
                            height: "40vh",  // Map takes 60% of the height
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <MapComponent filteredRequests={filteredRequests} markerIcon={markerIcon} city={userData?.area} />
                    </div>

                    {/* Issue card */}

                    <h3 style={{ margin: "30px" }}>Recent Issues</h3>
                    

                    <IssueList filteredRequests={filteredRequest2} setSelectedRequest={setSelectedRequest} selectedRequest={selectedRequest} setNewStatus={setNewStatus} newStatus={newStatus} updateStatus={updateStatus} closePopup={closePopup} comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} status="pending" />



                    <h3>In Progress issues</h3>
                    <IssueList filteredRequests={filteredRequest2} setSelectedRequest={setSelectedRequest} selectedRequest={selectedRequest} setNewStatus={setNewStatus} newStatus={newStatus} updateStatus={updateStatus} closePopup={closePopup} comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} status="inprogress" />

                    <h3>completed issues</h3>
                    <IssueList filteredRequests={filteredRequest2} setSelectedRequest={setSelectedRequest} selectedRequest={selectedRequest} setNewStatus={setNewStatus} newStatus={newStatus} updateStatus={updateStatus} closePopup={closePopup} comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} status="completed" />

                    

                    

                    {/* Status report of area */}

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
                        <h3>status of Reports in {userData?.area}</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#ddd" }}>
                                    <th style={{ padding: "10px", border: "1px solid #ccc" }}>Area</th>
                                    <th style={{ padding: "10px", border: "1px solid #ccc" }}>Number of Reports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statusAreas.map(([area, count]) => (
                                    <tr key={area}>
                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>{area}</td>
                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>{count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ width: "100%", margin: "40px", height: "400px" }}>
                        <h3>Issue Category Distribution</h3>
                        <Pie data={myCategoryChartData} options={{ responsive: true }} />
                    </div>
                    

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
