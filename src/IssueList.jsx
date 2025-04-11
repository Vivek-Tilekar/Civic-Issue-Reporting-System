import React from "react";
import Sentiment from "sentiment";
import config from "./config.json";
import markerIcon from "./marker-icon.png";
import MapComponent from "./MapComponent";

const sentiment = new Sentiment();

const statusColors = {
    pending: "#cce5ff",
    inprogress: "#fff3cd",
    completed: "#d4edda",
  };

const IssueList = ({
    filteredRequests,
    setSelectedRequest,
    selectedRequest,
    setNewStatus,
    newStatus,
    updateStatus,
    closePopup,
    comments,
    newComment,
    setNewComment,
    handleAddComment,
    status
}) => {
    return (
        <div style={{ height: "350px", backgroundColor: "#f2f2f2", borderRadius: "8px", padding: "20px", overflowY: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredRequests
                    .filter(request => request.status.toLowerCase() == status)
                    .slice()
                    .reverse()
                    .map((request) => {
                        const sentimentResult = sentiment.analyze(request.description);
                        const sentimentScore = sentimentResult.score;
                        const isHighPriority = sentimentScore < -2;

                        const createdAtDate = new Date(request.createdAt);
                        const currentDate = new Date();
                        const timeDifference = Math.floor((currentDate - createdAtDate) / (1000 * 60 * 60 * 24));
                        const isOldRequest = timeDifference >= 7;

                        return (
                            <li
                                key={request._id}
                                style={{
                                    position: "relative",
                                    marginBottom: "15px",
                                    padding: "10px",
                                    // backgroundColor: isOldRequest ? "#fff3cd" : isHighPriority ? "#f8d7da" : "#fff",
                                    backgroundColor: statusColors[status] || "#fff",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd",
                                    cursor: "pointer",
                                }}
                                onClick={() => setSelectedRequest(request)}
                            >
                                <div style={{ fontWeight: "bold" }}>{request.name}</div>
                                <div>Area: {request.area}</div>
                                <div>Status: {request.status}</div>
                                <div style={{ position: "absolute", top: "0", right: "0", padding: "5px" }}>
                                    Time: {createdAtDate.toLocaleString("en-IN", {
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
                                    <div style={{ marginTop: "10px", maxWidth: "50%", padding: "5px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", fontWeight: "bold" }}>
                                        High Priority
                                    </div>
                                )}
                                {isOldRequest && (
                                    <div style={{ position: "absolute", bottom: "5px", right: "5px", padding: "5px", backgroundColor: "#856404", color: "#fff", borderRadius: "4px", fontWeight: "bold" }}>
                                        {timeDifference} Days Old
                                    </div>
                                )}
                            </li>
                        );
                    })}
            </ul>
            {selectedRequest && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "600px", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
                        <h2>{selectedRequest.name}</h2>
                        <p><strong>Area:</strong> {selectedRequest.area}</p>
                        <p><strong>Status:</strong> {selectedRequest.status}</p>
                        <p><strong>Category:</strong> {selectedRequest.category}</p>
                        <p><strong>Address:</strong> {selectedRequest.address}</p>
                        <p><strong>Description:</strong> {selectedRequest.description}</p>
                        <p><strong>Sentiment Score:</strong> {sentiment.analyze(selectedRequest.description).score}</p>
                        <div
                            style={{
                                width: "100%",
                                height: "240px",  // Map takes 60% of the height
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                marginTop: "10px",
                            }}
                        >
                            <MapComponent filteredRequests={selectedRequest} markerIcon={markerIcon} city={selectedRequest.area} />
                        </div>
                        <img src={`${config.API_BASE_URL}${selectedRequest.photo}`} alt="User Issue" style={{ width: "100%", maxHeight: "250px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }} />
                        <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <button onClick={updateStatus} style={{ padding: "10px", width: "100%", border: "none", backgroundColor: "#007BFF", color: "#fff", borderRadius: "5px", fontSize: "14px", cursor: "pointer" }}>Update Status</button>
                            <button onClick={closePopup} style={{ padding: "10px", width: "100%", border: "none", backgroundColor: "#DC3545", color: "#fff", borderRadius: "5px", fontSize: "14px", cursor: "pointer" }}>Close</button>
                        </div>
                        <div style={{ marginTop: "15px", background: "#f9f9f9", padding: "15px", borderRadius: "8px", maxHeight: "250px", overflowY: "auto" }}>
                            <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>Comments ({comments.length})</h3>
                            {comments.length > 0 ? comments.map((comment, index) => (
                                <div key={index} style={{ background: index % 2 === 0 ? "#fff" : "#f1f1f1", padding: "10px", borderRadius: "5px", marginBottom: "5px", fontSize: "14px" }}>
                                    <strong>{comment.username}:</strong> {comment.text}
                                </div>
                            )) : <p style={{ fontSize: "14px", color: "#777" }}>No comments yet.</p>}
                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "14px", resize: "none", minHeight: "40px" }} />
                            <button onClick={handleAddComment} style={{ padding: "10px", border: "none", backgroundColor: "#28a745", color: "#fff", borderRadius: "5px", fontSize: "14px", cursor: "pointer" }}>Add Comment</button>
                        </div>
                    </div> 
                </div>
            )}
        </div>
    );
};

export default IssueList;