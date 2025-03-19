const express = require("express");
const { createRequest, getRequests, updateRequestStatus, deleteRequest, getNearbyRequests, getUserRequests, addComment, getComments } = require("../controllers/issue_controller");

const router = express.Router();

// POST route to create a new request
router.post('/requests', createRequest);

// GET route to get all requests
router.get('/requests', getRequests);

// PUT route to update request status
router.put('/requests', updateRequestStatus);

// DELETE route to delete a request
router.delete('/requests/:id', deleteRequest);

router.get('/requests/nearby' , getNearbyRequests)

router.get("/requests/:userId", getUserRequests); // Get all requests of a user

router.post("/requests/comment", addComment);  // Add comment

router.get("/requests/:requestId/comments", getComments);  // Get comments

// module.exports = router;
module.exports = router;