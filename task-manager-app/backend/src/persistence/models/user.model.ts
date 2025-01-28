import * as mongoose from "mongoose";

export const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    loyaltyPoints: Number,
    reservations: [
        {
            flightId: mongoose.Types.ObjectId,
            seatNumber: String,
            status: String,
            bookingTime: Date,
        }
    ]
}));