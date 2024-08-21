import React, { useState, useContext } from 'react';
import { UserContext } from '../Hooks/UserContext';

const colorOptions = [
    'gray', 'red', 'blue', 'green', 'cherry', 'orange',
    'lime', 'orange2', 'green2', 'yellow', 'orange3', 'blue2',
    'blue3', 'pink', 'purple', 'green3'
];

const ChatSettings = ({ onClose }) => {
    const { userInfo, setUserInfo } = useContext(UserContext);
    const [selectedColor, setSelectedColor] = useState(userInfo.userColor);

    const handleColorChange = (color) => {
        setSelectedColor(color);
    };

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:3030/updateColor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userInfo._id, color: selectedColor }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUserInfo(updatedUser);
                onClose();
            } else {
                console.error('Failed to update color');
            }
        } catch (error) {
            console.error('Error updating color:', error);
        }
    };

    return (
        <div className="chat-settings">
            <div className="chat-settings-content">
                <h2>User Color</h2>
                <div className="color-picker">
                    {colorOptions.map(color => (
                        <div
                            key={color}
                            className={`color-option ${selectedColor === color ? 'selected' : ''} ${color}`}
                            onClick={() => handleColorChange(color)}
                        />
                    ))}
                </div>
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ChatSettings;
