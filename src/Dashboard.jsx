import React, { useState, useEffect } from "react";
// import "mapbox-gl/dist/mapbox-gl.css";
// import ReactMapGl, { Marker } from "react-map-gl";
import axios from "axios";
import markerIcon from "./marker-icon.png";
import { Bar } from "react-chartjs-2";
// import { Map, Marker } from "react-map-gl";
// import "maplibre-gl/dist/maplibre-gl.css";
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

    // Fetch data from API
    // useEffect(() => {
    //     const fetchRequests = async () => {
    //         try {
    //             const response = await axios.get(
    //                 "http://192.168.31.12:3000/api/issue/requests"
    //             );
    //             if (response.data && response.data.data) {
    //                 setRequests(response.data.data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //         }
    //     };

    //     const intervalId = setInterval(fetchRequests, 1000);

    // // Cleanup interval on component unmount
    //     return () => clearInterval(intervalId);

    //     fetchRequests();
    // }, []);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://192.168.31.12:3000/api/issue/requests");
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
    }, []);

    // useEffect(() => {

    //     const fetchVolunteers = async () => {
            
    //             const response = await axios.get(
    //                 "http:/192.168.31.12.168:3000/api/volunteers/fetch"
    //             );
    //             console.log('Full response:', response.data); // Log the full response
            
    //             setVolunteer(response.data);
               
    //     };
        

    //     fetchVolunteers()

    // }, []);

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

    // const handleCityChange = (event) => {
    //     const city = event.target.value;
    //     let coordinates;
        
    //     switch (city) {
    //       case "Vadodara":
    //         coordinates = { latitude: 22.275193, longitude: 73.187928 };
    //         break;
    //       case "Ahmedabad":
    //         coordinates = { latitude: 23.0225, longitude: 72.5714 };
    //         break;
    //       case "Gandhinagar":
    //         coordinates = { latitude: 23.2156, longitude: 72.6369 };
    //         break;
    //       default:
    //         coordinates = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
    //     }
    //     setSelectedCity(coordinates);
    //   };

    // Filter requests by selected city
    const handleAreaChange = (area) => {
        setSelectedArea(area);
    };

    const filteredRequests = requests.filter(
        (request) => request.city === "Vadodara"
    );

    const filteredRequest2 = requests.filter(
        (request) => request.area === selectedCity
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
          const response = await axios.put('http://192.168.31.12:3000/api/issue/requests', {
            id: selectedRequest._id,
            status: newStatus,
          });

          console.log(selectedRequest._id);
          console.log(requests._id);
          
          setRequests(requests.map(req => req._id === selectedRequest._id ? response.data.data : req));
          closePopup();
        } catch (error) {
          console.log('Error updating status:', error);
        }
      };

    const areaFilteredRequests = selectedArea
        ? filteredRequests.filter((request) => request.area === selectedArea)
        : filteredRequests;


    const totalRequests = filteredRequests.length;
    const statusStats = filteredRequests.reduce(
        (acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
        },
        { pending: 0, completed: 0, inProgress: 0 }
    );

    const needsStats = filteredRequests.reduce((acc, request) => {
        request.needs.forEach((need) => {
            acc[need] = (acc[need] || 0) + 1;
        });
        return acc;
    }, {});

    const locationStats = filteredRequests.reduce((acc, request) => {
        const { area, numberOfPeople } = request;
        acc[area] = (acc[area] || 0) + numberOfPeople;
        return acc;
    }, {});

    const barChartData = {
        labels: Object.keys(needsStats),
        datasets: [
            {
                label: "Number of Requests",
                data: Object.values(needsStats),
                backgroundColor: "#4BC0C0",
            },
        ],
    };

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

            {/* City Selector */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "20px",
                }}
            >
                <select
                    onChange={(e) => handleCityChange(e.target.value)}
                    value={selectedCity}
                    className="form-select"
                    aria-label="Select city"
                    style={{
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        width: "200px",
                        textAlign: "center",
                    }}
                >
                    <option value="Manjalpur">Manjalpur</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Sayajiganj">Sayajiganj</option>
                    <option value="Gorwa">Gorwa</option>
                    <option value="Alkapuri">Alkapuri</option>
                    <option value="Atladara">Atladara</option>
                    <option value="Bhaily">Bhaily</option>
                    <option value="Chhani">Chhani</option>
                    <option value="Danteshwar">Danteshwar</option>
                    <option value="Wadi">Wadi</option>
                    <option value="Gotri">Gotri</option>
                    <option value="Harni">Harni</option>
                    <option value="Makarpura">Makarpura</option>
                    <option value="Mandvi">Mandvi</option>
                </select>
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
                            <li>Resolved: {statusStats.completed}</li>
                            <li>In Progress: {statusStats.inProgress}</li>
                        </ul>
                    </div>

                    {/* Needs Breakdown (Bar Chart) */}
                    {/* <div
                        style={{
                            backgroundColor: "#f2f2f2",
                            borderRadius: "8px",
                            padding: "20px",
                            marginTop: "20px",
                            flex: 1,
                        }}
                    >
                        <h3>Needs Breakdown</h3>
                        <Bar data={barChartData} options={{ responsive: true }} />
                    </div> */}

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
                        <h3>Location and Number of People Breakdown</h3>
                        <Bar data={locationChartData} options={{ responsive: true }} />
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
                        {/* <ReactMapGl
                            {...viewPort}
                            mapboxAccessToken="pk.eyJ1Ijoic2h1YmhhbTExNzMiLCJhIjoiY20zOW95eDV1MHg5bTJqcXhhNHFkbDJtMSJ9.tJ6JcbRbK3YD8MrfvZDg-w"
                            width="100%"
                            height="100%"
                            interactive={true}
                            transitionDuration={200}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            onViewportChange={(nextViewport) => setViewPort(nextViewport)}
                        >
                            {filteredRequests.map((request) => (
                                <Marker
                                    key={request._id}
                                    latitude={request.latitude}
                                    longitude={request.longitude}
                                >
                                    <img
                                        src={markerIcon}
                                        alt="marker"
                                        style={{ width: 30, height: 40 }}
                                    />
                                </Marker>
                            ))}
                        </ReactMapGl> */}

                        {/* <Map
                            initialViewState={viewPort}
                            style={{ width: "100%", height: "100%" }}
                            mapStyle="https://demotiles.maplibre.org/style.json"
                            onMove={evt => setViewPort(evt.viewState)}
                        >
                            {filteredRequests.map((request) => (
                                <Marker
                                    key={request._id}
                                    latitude={request.latitude}
                                    longitude={request.longitude}
                                >
                                    <img
                                        src={markerIcon}
                                        alt="marker"
                                        style={{ width: 30, height: 40 }}
                                    />
                                </Marker>
                            ))}
                        </Map> */}

                        <MapComponent filteredRequests={filteredRequests} markerIcon={markerIcon} city={selectedCity} />
                    </div>

                    {/* Issue card */}

                    <h3 style={{ margin: "30px" }}>Recent Issues</h3>
                    <div style={{ height: "350px", backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", overflowY: "auto" }}>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {filteredRequests.map((request) => {
                                const sentimentResult = sentiment.analyze(request.description);
                                const sentimentScore = sentimentResult.score;
                                const isHighPriority = sentimentScore < -2;
                                return (
                                    <li key={request._id} style={{ marginBottom: "15px", padding: "10px", backgroundColor: isHighPriority ? "#f8d7da" : "#fff", borderRadius: "4px", border: "1px solid #ddd", cursor: "pointer" }} onClick={() => setSelectedRequest(request)}>
                                        <div style={{ fontWeight: "bold" }}>{request.name}</div>
                                        <div>Area: {request.area}</div>
                                        <div>Status: {request.status}</div>
                                        {isHighPriority && (
                                            <div style={{ marginTop: "10px", padding: "5px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", fontWeight: "bold" }}>High Priority</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {selectedRequest && (
                        <div style={{ 
                            position: "fixed", 
                            top: 0, 
                            left: 0, 
                            width: "100vw", 
                            height: "100vh", 
                            backgroundColor: "rgba(0,0,0,0.5)", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            overflow: "hidden" // Prevents whole page scroll
                        }}>
                            <div style={{ 
                                backgroundColor: "#fff", 
                                padding: "20px", 
                                borderRadius: "8px", 
                                width: "600px", 
                                maxHeight: "80vh", // Limits the popup height
                                overflowY: "auto" // Enables scrolling inside the popup
                            }}>
                                <h2>{selectedRequest.name}</h2>
                                <p><strong>Area:</strong> {selectedRequest.area}</p>
                                <p><strong>Status:</strong> {selectedRequest.status}</p>
                                <p><strong>PhoneNo:</strong> {selectedRequest.phoneNo}</p>
                                <p><strong>Description:</strong> {selectedRequest.description}</p>
                                <p><strong>Sentiment Score:</strong> {sentiment.analyze(selectedRequest.description).score}</p>
                                <img src={`http://192.168.31.12:3000${selectedRequest.photo}`} alt="User Issue" 
                                    style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }} 
                                />
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: "100%", marginTop: "10px" }}>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <button onClick={updateStatus} 
                                    style={{ marginTop: "10px", padding: "10px", width: "100%", border: "none", backgroundColor: "#007BFF", color: "#fff", borderRadius: "5px" }}>
                                    Update
                                </button>
                                <button onClick={closePopup} 
                                    style={{ marginTop: "10px", padding: "10px", width: "100%", border: "none", backgroundColor: "#DC3545", color: "#fff", borderRadius: "5px" }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* <h3 style={{ margin: "30px" }}>Recent Issues</h3>
                    <div style={{ height: "350px", backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", overflowY: "auto" }}>

                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {filteredRequests.map((request) => {
                                const sentimentResult = sentiment.analyze(request.description);
                                const sentimentScore = sentimentResult.score;

                                const isHighPriority = sentimentScore < -2;

                                const itemStyle = {
                                    marginBottom: "15px",
                                    padding: "10px",
                                    backgroundColor: isHighPriority ? "#f8d7da" : "#fff",
                                    borderRadius: "4px",
                                    border: isHighPriority ? "1px solid #f5c6cb" : "1px solid #ddd",
                                };

                                return (
                                    <li key={request._id} style={itemStyle}>
                                        <div style={{ fontWeight: "bold" }}>{request.name}</div>
                                        <div>Area: {request.area}</div>
                                        <div>Status: {request.status}</div>
                                        <div>PhoneNo: {request.phoneNo}</div>
                                        <div>Description: {request.description}</div>
                                        <div>Sentiment Score: {sentimentScore}</div> */}

                                        {/* Optionally, display a "Priority" label */}
                                        {/* {isHighPriority && (
                                            <div style={{
                                                marginTop: "10px",
                                                padding: "5px",
                                                backgroundColor: "#f8d7da",
                                                color: "#721c24",
                                                borderRadius: "4px",
                                                fontWeight: "bold"
                                            }}>
                                                High Priority
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div> */}

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px", flex: 1 }}>
                        <h3>Category Breakdown for {selectedCity}</h3>
                        <Bar data={categoryAreaChartData} options={{ responsive: true }} />
                    </div>

                    

                    {/* Status report of area */}

                    <div style={{ backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
                        <h3>status of Reports in {selectedCity}</h3>
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
