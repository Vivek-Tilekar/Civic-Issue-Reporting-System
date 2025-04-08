const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

// const mongoose = require('mongoose');

// const userSchema = mongoose.Schema({
//     username : {
//         type : String,
//         required : true,
//         unique : true
//     },
//     email : {
//         type : String,
//         required : true,
//         unique : true
//     },
//     password : {
//         type : String,
//         required : true
//     },
    
// } , {timestamps : true}
// )

// const User = mongoose.model('User' , userSchema)

// module.exports = User;