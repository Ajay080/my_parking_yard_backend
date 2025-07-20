import express from 'express';
import {getUsers, getUser, createUser, updateUser, deleteUser} from '../controllers/userController.js';

const router= express.Router();

router.get('/', getUsers); // Route to get all users with pagination
router.get('/:id', getUser); // Route to get a single user by ID
router.post('/', createUser); // Route to create a new user
router.put('/:id', updateUser); // Route to update an existing user by ID
router.delete('/:id', deleteUser); // Route to delete a user by ID

export default router; // Export the router to be used in server.js