import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

function AddChatChannel({ onChannelAdded }) {
    const [channelName, setChannelName] = useState('');
    const [redirect, setRedirect] = useState(false);

    const handleAddChannel = async () => {
        try {
            const response = await fetch('http://localhost:3030/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: channelName }),
            });
            const data = await response.json();
            if (response.ok) {
                setRedirect(true);
            }
            onChannelAdded(data);
            setChannelName('');
        } catch (error) {
            console.error('Error adding channel:', error);
        }
    };
    
    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className='AddChannel'>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
            <button onClick={handleAddChannel}>Add Channel</button>
        </div>
    );
}

export default AddChatChannel;
