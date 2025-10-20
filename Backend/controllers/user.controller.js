import User from '../models/user.model.js';
import uploadOnCloudinary from '../config/cloudinary.js';
import geminiResponse from '../gemini.js'; // Ensure this path is correct
import moment from 'moment/moment.js';
import mongoose from 'mongoose'; // Added for ObjectId validation

// --- Utility function for error response ---
const sendServerError = (res, message = 'Internal server error') => {
    return res.status(500).json({ message });
};

// --- getCurrentUser Controller ---
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Get Current User Error:', error);
        return sendServerError(res);
    }
};

// --- updateAssistant Controller ---
export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;

        let assistantImage;

        if (req.file) {
            if (req.file.path) {
                assistantImage = await uploadOnCloudinary(req.file.path);
            } else {
                throw new Error('File path missing for upload.');
            }
        } else if (imageUrl) {
            assistantImage = imageUrl;
        }

        if (!assistantName || !assistantImage) {
            return res.status(400).json({ message: 'Assistant name or image URL is missing.' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                assistantName,
                assistantImage
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found for update.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Update Assistant Error:', error);
        return res.status(500).json({ message: 'Failed to update assistant or upload image.' });
    }
};

// --- askToAssistant Controller (Fixed) ---
export const askToAssistant = async (req, res) => {
    const { command } = req.body;
    let user;

    try {
        // 1. Validate input
        if (!command || typeof command !== 'string') {
            return res.status(400).json({ message: 'Command is required and must be a string.' });
        }

        // 2. Fetch User Data
        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }
        user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ response: 'User data not found. Please log in again.' });
        }
        const userName = user.userName;
        const assistantName = user.assistantName;

        // 3. Call Gemini API
        const rawGeminiText = await geminiResponse(command, assistantName, userName);

        // 4. Robust JSON Parsing
        const jsonMatch = rawGeminiText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('Gemini output was not parsable JSON:', rawGeminiText);
            return res.status(500).json({
                type: 'general',
                userInput: command,
                response: 'I received a strange signal and couldn’t process the command. Please try again.'
            });
        }

        let gemResult;
        try {
            gemResult = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error('JSON Parsing Error:', e);
            return res.status(500).json({
                type: 'general',
                userInput: command,
                response: 'The server failed to read my instructions due to a formatting error.'
            });
        }

        const { type, userInput, response } = gemResult;

        // 5. Save to history (Fixed)
        user.history.push({
            content: command, // User’s command
            role: 'user' // Explicitly set role
        });
        user.history.push({
            content: response, // Assistant’s response
            role: 'assistant'
        });

        // 6. Save with validators
        await user.save({ runValidators: true });

        // 7. Switch Case for Local Tools
        switch (type) {
            case 'get-date':
                return res.json({
                    type,
                    userInput,
                    response: `The current date is ${moment().format('dddd, MMMM Do YYYY')}`
                });

            case 'get-time':
                return res.json({
                    type,
                    userInput,
                    response: `The time is ${moment().format('hh:mm A')}`
                });

            case 'get-day':
                return res.json({
                    type,
                    userInput,
                    response: `Today is ${moment().format('dddd')}`
                });

            case 'get-month':
                return res.json({
                    type,
                    userInput,
                    response: `The current month is ${moment().format('MMMM')}`
                });

            case 'google-search':
            case 'youtube-search':
            case 'youtube-play':
            case 'general':
            case 'calculator-open':
            case 'open-application':
            case 'instagram-open':
            case 'facebook-open':
            case 'weather-show':
            case 'close-application':
                return res.json(gemResult);

            default:
                return res.status(400).json({
                    type: 'general',
                    userInput: command,
                    response: `I know the intent is to ${type}, but I haven’t been programmed for that action yet.`
                });
        }
    } catch (error) {
        console.error('Ask to Assistant Global Error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        return sendServerError(res, 'An unexpected error occurred while processing your request.');
    }
};