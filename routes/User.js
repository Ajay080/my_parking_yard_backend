import express from 'express';
import {getUsers, getUser, createUser, updateUser, deleteUser, registerUser} from '../controllers/userController.js';

const router= express.Router();

router.get('/', getUsers); // Route to get all users with pagination
router.get('/:id', getUser); // Route to get a single user by ID
router.post('/', registerUser); // Route to register a new user (changed from createUser)
router.put('/:id', updateUser); // Route to update an existing user by ID
router.delete('/:id', deleteUser); // Route to delete a user by ID

export default router; // Export the router to be used in server.js