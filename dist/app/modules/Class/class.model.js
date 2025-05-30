"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/class.model.ts
const mongoose_1 = __importStar(require("mongoose"));
// Define the Mongoose schema for Class
const classSchema = new mongoose_1.Schema({
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    assignedTrainerId: {
        type: mongoose_1.Schema.Types.ObjectId, // Changed to ObjectId
        ref: 'Trainer', // Reference to Trainer _id
        default: null,
    },
    conductedOrNot: {
        type: Boolean,
        default: false,
    },
    enrolledTraineeIds: {
        type: [mongoose_1.Schema.Types.ObjectId], // Changed to array of ObjectId
        ref: 'Trainee', // Reference to Trainee _id
        default: [],
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
});
// Virtual field for id (string representation of _id)
// classSchema.virtual('id').get(function (this: Document) {
//   return this._id.toString();
// });
// Create and export the Class model
const Class = mongoose_1.default.model('Class', classSchema);
exports.default = Class;
