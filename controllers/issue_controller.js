
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Request = require('../models/issue_model');
const { io } = require("../index");

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers

  return distance;
};


const getNearbyRequests = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in kilometers, default 5km
    console.log(latitude , longitude)
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required query parameters' 
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);


    const allRequests = await Request.find();

    
    const nearbyRequests = allRequests
      .map(request => {
        const distance = calculateDistance(
          userLat,
          userLon,
          request.latitude,
          request.longitude
        );
        return { ...request.toObject(), distance };
      })
      .filter(request => request.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      message: 'Nearby requests fetched successfully',
      data: nearbyRequests.map(request => ({
        ...request,
        distance: Math.round(request.distance * 100) / 100
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/images'); // Use path.join for cross-platform compatibility
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Add file type validation
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

// Add file filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('photo');

// Create a new request

const createRequest = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ message: 'Unknown error occurred', error: err.message });
    }

    try {
      const { userId, name, city, area, latitude, longitude, category, description, address } = req.body;

      // Prepare the photo path
      const photoPath = req.file ? `/uploads/images/${req.file.filename}` : null;

      const newRequest = new Request({
        userId,
        name,
        city,
        area,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category,  // Changed from "needs" to "category"
        description,
        status: 'pending', // Default status
        photo: photoPath,
        address
      });

      await newRequest.save();
      res.status(201).json({ 
        message: 'Request created successfully', 
        data: newRequest 
      });

    } catch (error) {
      console.error('Error creating request:', error);
      if (req.file) {
        const filePath = path.join(__dirname, '..', req.file.path);
        fs.unlink(filePath, (unlinkError) => {
          if (unlinkError) console.error('Error deleting file:', unlinkError);
        });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};


// Get all requests
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json({ message: 'Requests fetched successfully', data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userRequests = await Request.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(userRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a request status
// const updateRequestStatus = async (req, res) => {
//   const { id } = req.body
//   const { status } = req.body;
  

//   try {
//     const updatedRequest = await Request.findByIdAndUpdate(id, { status }, { new: true });

//     if (!updatedRequest) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     res.status(200).json({ message: 'Request status updated', data: updatedRequest });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const updateRequestStatus = async (req, res) => {
//   const { id, status } = req.body;

//   try {
//       const updatedRequest = await Request.findByIdAndUpdate(id, { status }, { new: true });

//       if (!updatedRequest) {
//           return res.status(404).json({ message: "Request not found" });
//       }

//       // Emit a notification to the frontend via Socket.IO
//       const io = req.app.get("socketio");
//       io.emit("statusUpdate", {
//           requestId: id,
//           status: updatedRequest.status,
//           message: `Your request status has changed to ${updatedRequest.status}`,
//       });

//       res.status(200).json({ message: "Request status updated", data: updatedRequest });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

const updateRequestStatus = async (req, res) => {
  const { id, status, userId } = req.body; // Ensure request contains userId

  try {
      const updatedRequest = await Request.findByIdAndUpdate(id, { status }, { new: true });

      if (!updatedRequest) {
          return res.status(404).json({ message: "Request not found" });
      }

      // Emit event only to the specific user
      if (io) {
          console.log(`🔔 Sending update to user ${userId}`);
          io.to(userId).emit("statusUpdate", {
              userId,
              message: `Your request status changed to: ${status}`
          });
      } else {
          console.error("❌ Socket.IO is not initialized.");
      }

      res.status(200).json({ message: "✅ Request status updated", data: updatedRequest });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

// Delete a request
const deleteRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRequest = await Request.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Comments

const addComment = async (req, res) => {
  try {
    const { requestId, userId, username, text } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      userId,
      username,
      text,
      createdAt: new Date(),
    };

    request.comments.push(newComment);
    await request.save();

    res.status(201).json({ message: "Comment added successfully", comments: request.comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId).populate("comments.userId", "name"); // Populate user details
    if (!request) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ comments: request.comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
    getNearbyRequests,
    createRequest,
    getRequests,
    updateRequestStatus,
    deleteRequest,
    getUserRequests,
    getComments,
    addComment,
  };