import React, { useState, useEffect } from "react";
import axios from "axios";
import markerIcon from "./marker-icon.png";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import config from "./config.json"
import { useNavigate } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


import Sentiment from 'sentiment'
import MapComponent from "./MapComponent";

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

    

    const handleCityChange = (city) => {
        setSelectedCity(city);
        if (city === "Vadodara") {
            setViewPort({ latitude: 22.3072, longitude: 73.1812, zoom: 10 });
        } else if (city === "Ahmedabad") {
            setViewPort({ latitude: 23.0225, longitude: 72.5714, zoom: 10 });
        } else if (city === "Gandhinagar") {
            setViewPort({ latitude: 23.2156, longitude: 72.6369, zoom: 10 });
        }
    };

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

    console.log(volunteer)

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

    const areaFilteredRequests = userData?.area
        ? filteredRequests.filter((request) => request.area === userData?.area)
        : filteredRequests;


    const totalRequests = filteredRequest2.length;
    
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

    

    const locationChartData = {
        labels: Object.keys(locationStats),
        datasets: [
            {
                label: "Total Number of People",
                data: Object.values(locationStats),
                backgroundColor: "#FF6384",
            },
        ],
    };

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
                    <div style={{ height: "350px", backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", overflowY: "auto" }}>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {filteredRequest2.slice().reverse().map((request) => {
                                const sentimentResult = sentiment.analyze(request.description);
                                const sentimentScore = sentimentResult.score;
                                const isHighPriority = sentimentScore < -2;
                                return (
                                    <li key={request._id} style={{ position: "relative", marginBottom: "15px", padding: "10px", backgroundColor: isHighPriority ? "#f8d7da" : "#fff", borderRadius: "4px", border: "1px solid #ddd", cursor: "pointer" }} onClick={() => setSelectedRequest(request)}>
                                        <div style={{ fontWeight: "bold" }}>{request.name}</div>
                                        <div>Area: {request.area}</div>
                                        <div>Status: {request.status}</div>
                                        <div style={{ 
                                            position: "absolute", 
                                            top: "0", 
                                            right: "0", 
                                            padding: "5px"
                                        }}>
                                            Time: {new Date(request.createdAt).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: true,
                                                })}
                                        </div>
                                        {isHighPriority && (
                                            <div style={{ marginTop: "10px", padding: "5px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", fontWeight: "bold" }}>High Priority</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {selectedRequest && (
                        // <div style={{ 
                        //     position: "fixed", 
                        //     top: 0, 
                        //     left: 0, 
                        //     width: "100vw", 
                        //     height: "100vh", 
                        //     backgroundColor: "rgba(0,0,0,0.5)", 
                        //     display: "flex", 
                        //     justifyContent: "center", 
                        //     alignItems: "center",
                        //     overflow: "hidden" // Prevents whole page scroll
                        // }}>
                        //     <div style={{ 
                        //         backgroundColor: "#fff", 
                        //         padding: "20px", 
                        //         borderRadius: "8px", 
                        //         width: "600px", 
                        //         maxHeight: "80vh", // Limits the popup height
                        //         overflowY: "auto" // Enables scrolling inside the popup
                        //     }}>
                        //         <h2>{selectedRequest.name}</h2>
                        //         <p><strong>Area:</strong> {selectedRequest.area}</p>
                        //         <p><strong>Status:</strong> {selectedRequest.status}</p>
                        //         <p><strong>Category:</strong> {selectedRequest.category}</p>
                        //         <p><strong>Address:</strong> {selectedRequest.address}</p>
                        //         <p><strong>Description:</strong> {selectedRequest.description}</p>
                        //         <p><strong>Sentiment Score:</strong> {sentiment.analyze(selectedRequest.description).score}</p>
                        //         <img src={`${config.API_BASE_URL}${selectedRequest.photo}`} alt="User Issue" 
                        //             style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }} 
                        //         />
                        //         <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: "100%", marginTop: "10px" }}>
                        //             <option value="pending">Pending</option>
                        //             <option value="inProgress">In Progress</option>
                        //             <option value="Completed">Completed</option>
                        //         </select>
                        //         <button onClick={updateStatus} 
                        //             style={{ marginTop: "10px", padding: "10px", width: "100%", border: "none", backgroundColor: "#007BFF", color: "#fff", borderRadius: "5px" }}>
                        //             Update
                        //         </button>
                        //         <button onClick={closePopup} 
                        //             style={{ marginTop: "10px", padding: "10px", width: "100%", border: "none", backgroundColor: "#DC3545", color: "#fff", borderRadius: "5px" }}>
                        //             Close
                        //         </button>
                        //     </div>
                        // </div>

                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100vw",
                                height: "100vh",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden"
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#fff",
                                    padding: "20px",
                                    borderRadius: "8px",
                                    width: "600px",
                                    maxHeight: "80vh",
                                    overflowY: "auto",
                                    position: "relative"
                                }}
                            >
                                {/* Request Details */}
                                <h2>{selectedRequest.name}</h2>
                                <p>
                                    <strong>Area:</strong> {selectedRequest.area}
                                </p>
                                <p>
                                    <strong>Status:</strong> {selectedRequest.status}
                                </p>
                                <p>
                                    <strong>Category:</strong> {selectedRequest.category}
                                </p>
                                <p>
                                    <strong>Address:</strong> {selectedRequest.address}
                                </p>
                                <p>
                                    <strong>Description:</strong> {selectedRequest.description}
                                </p>
                                <p>
                                    <strong>Sentiment Score:</strong> {sentiment.analyze(selectedRequest.description).score}
                                </p>
                                <img
                                    src={`${config.API_BASE_URL}${selectedRequest.photo}`}
                                    alt="User Issue"
                                    style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }}
                                />

                                {/* Status Update Section (Moved Above Comments) */}
                                <div
                                    style={{
                                        background: "#f9f9f9",
                                        padding: "15px",
                                        borderRadius: "8px",
                                        marginTop: "15px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px"
                                    }}
                                >
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "5px",
                                            border: "1px solid #ccc"
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="inProgress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>

                                    <button
                                        onClick={updateStatus}
                                        style={{
                                            padding: "10px",
                                            width: "100%",
                                            border: "none",
                                            backgroundColor: "#007BFF",
                                            color: "#fff",
                                            borderRadius: "5px",
                                            fontSize: "14px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Update Status
                                    </button>

                                    <button
                                        onClick={closePopup}
                                        style={{
                                            padding: "10px",
                                            width: "100%",
                                            border: "none",
                                            backgroundColor: "#DC3545",
                                            color: "#fff",
                                            borderRadius: "5px",
                                            fontSize: "14px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div
                                    style={{
                                        marginTop: "15px",
                                        background: "#f9f9f9",
                                        padding: "15px",
                                        borderRadius: "8px",
                                        maxHeight: "250px",
                                        overflowY: "auto"
                                    }}
                                >
                                    <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>Comments ({comments.length})</h3>

                                    <div style={{ maxHeight: "150px", overflowY: "auto", paddingRight: "5px" }}>
                                        {comments.length > 0 ? (
                                            comments.map((comment, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        background: index % 2 === 0 ? "#fff" : "#f1f1f1",
                                                        padding: "10px",
                                                        borderRadius: "5px",
                                                        marginBottom: "5px",
                                                        fontSize: "14px",
                                                        lineHeight: "1.4"
                                                    }}
                                                >
                                                    <strong>{comment.username}:</strong> {comment.text}
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: "14px", color: "#777" }}>No comments yet.</p>
                                        )}
                                    </div>

                                    {/* Comment Input Section */}
                                    <div style={{ display: "flex", flexDirection: "column", marginTop: "10px", gap: "8px" }}>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "5px",
                                                border: "1px solid #ccc",
                                                fontSize: "14px",
                                                resize: "none",
                                                minHeight: "40px"
                                            }}
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            style={{
                                                padding: "10px",
                                                border: "none",
                                                backgroundColor: "#28a745",
                                                color: "#fff",
                                                borderRadius: "5px",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                transition: "background 0.2s ease"
                                            }}
                                            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
                                            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
                                        >
                                            Add Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    }

                    

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px", flex: 1 }}>
                        <h3>Category Breakdown for {userData?.area}</h3>
                        <Bar data={categoryAreaChartData} options={{ responsive: true }} />
                    </div>

                    

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

                    <div style={{
                        marginTop: "20px",
                      
                        width: "100%",
                        padding: "20px",
                     
                    }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Volunteers</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVolunteers.map((volunteer) => (
                                <div
                                    key={volunteer._id}
                                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {volunteer.name.charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-bold text-lg">{volunteer.name}</h3>
                                            <p className="text-gray-600">{volunteer.area}, {volunteer.city}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">Email:</span>
                                            <span className="text-gray-600">{volunteer.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">Phone:</span>
                                            <span className="text-gray-600">{volunteer.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">Joined:</span>
                                            <span className="text-gray-600">
                                                {new Date(volunteer.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" > <Link to="/add-volunteer" className="text-white hover:text-gray-300" style={{ color: '#007BFF', textDecoration: 'none' , marginTop : "30px"}}>Add Volunteer</Link></button>
                                </div>
                                
                            ))}
                        </div>

                        {filteredVolunteers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No volunteers found for this city
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
