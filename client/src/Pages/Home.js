import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../Hooks/UserContext';
import { Link, Navigate } from 'react-router-dom';

const Home = () => {
    const { setUserInfo, userInfo } = useContext(UserContext);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3030/profile', {
          credentials: 'include',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Profile fetch failed');
            }
            return response.json();
        })
        .then(userInfo => {
            setUserInfo(userInfo);
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
        });
      }, [setUserInfo]);

    
    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await fetch('http://localhost:3030/channels');
            const data = await response.json();
            setChannels(data);
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    if (!userInfo) {
        return <Navigate to="/login" />;
    }


    return (
        <>
        <div className="contain">
            <div className="ChannelContainer">
                {channels.map(channel => (
                    <Link key={channel._id} className="channel" to={`/chat/${channel._id}`}>
                        <span >{channel.name}</span>
                    </Link>
                ))}
            </div>
        </div>
        </>
    )
}

export default Home