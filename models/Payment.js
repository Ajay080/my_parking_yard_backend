import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: props => `Amount ${props.value} must be a positive number!`
        }
    },
    paymentMethod: {
        type: String,
        enum: ["Credit Card", "Debit Card", "Net Banking", "UPI"],
        required: true,
        default: "UPI"
    },
    transactionId: {
        type: String,
        unique: true,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z0-9]{10,}$/.test(value); // Example validation for transaction ID
            },
            message: props => `${props.value} is not a valid transaction ID!`
        }
    },
    paymentTimeStamp: {
        type: Date,
        default: null,
        validate: {
            validator: function(value) {
                return !value || value <= new Date();
            },
            message: props => `Payment timestamp ${props.value} cannot be in the future!`
        }
    }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema, 'payment');
