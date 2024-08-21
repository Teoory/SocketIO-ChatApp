import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { UserContext } from '../Hooks/UserContext';
import ChatSettings from '../Components/ChatSettings';

function Chat() {
    const { channelId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [messageCooldown, setMessageCooldown] = useState(0);
    const { setUserInfo, userInfo } = useContext(UserContext);
    const messagesEndRef = useRef(null);
    const [showSettings, setShowSettings] = useState(false);

    const socket = useRef(null);

    useEffect(() => {
        // Establish socket connection
        socket.current = io('http://localhost:3030', {
            credentials: 'include',
        });

        socket.current.on('connect', () => {
            console.log('Connected to socket server');
            socket.current.emit('joinChannel', channelId);
        });

        socket.current.on('newMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [channelId]);
    

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
                window.location.reload();
            });
    }, [setUserInfo]);

    useEffect(() => {
        fetchMessages();
    }, [channelId]);

    useEffect(() => {
        if (messageCooldown > 0) {
            const timer = setTimeout(() => {
                setMessageCooldown(messageCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [messageCooldown]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:3030/messages/${channelId}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!userInfo || !userInfo.generatedUsername) {
            console.error('User info is not available');
            return;
        }

        const isAdmin = userInfo.role.includes('admin');
        const isPremium = userInfo.role.includes('premium');
        const isUser = userInfo.role.includes('user');
        const isQuest = userInfo.role.includes('quest');

        if (!isAdmin && !isPremium && messageCooldown > 0) {
            console.log(`Tekrar mesaj gönderebilmek için kalan süren: ${messageCooldown}`);
            return;
        }

        try {
            const messageData = {
                content: newMessage,
                sender: userInfo.generatedUsername,
                senderInfo: userInfo,
                channel: channelId,
                userColor: userInfo.userColor,
                senderColor: userInfo.userColor,
            };

            // await fetch('http://localhost:3030/messages', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(messageData),
            // });

            // Emit the new message to the server
            socket.current.emit('sendMessage', messageData);
            setNewMessage('');
            // fetchMessages();
            if (!isAdmin && !isPremium) {
                setMessageCooldown(30);
            } else if (isUser) {
                setMessageCooldown(10);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleHideMessage = async (messageId) => {
        try {
            await fetch(`http://localhost:3030/hideMessage/${messageId}`, {
                method: 'POST'
            });
            console.log('Message hidden successfully');
            fetchMessages();
        } catch (error) {
            console.error('Error hiding message:', error);
        }
    };

    const handleHighlightMessage = async (messageId) => {
        try {
            await fetch(`http://localhost:3030/highlightMessage/${messageId}`, {
                method: 'POST'
            });
            console.log('Message highlighted successfully');
            fetchMessages();
        } catch (error) {
            console.error('Error highlighting message:', error);
        }
    };

    const handleBanUser = async (userId) => {
        try {
            await fetch(`http://localhost:3030/banUser/${userId}`, {
                method: 'POST'
            });
            console.log('User banned successfully');
            fetchMessages();
        } catch (error) {
            console.error('Error banning user:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const MessegaList = ({ messages }) => {
        return (
            <>
            {messages.map((message, index) => (
                !message.hidden || isAdmin ? (
                    <div key={index} className={`chat-message ${message.highlighted ? 'highlight' : ''}`}>
                        {isAdmin && (
                            <button className='delete' onClick={() => handleHideMessage(message._id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            </button>
                        )}
                        {isAdmin && (
                            <button className='highlight' onClick={() => handleHighlightMessage(message._id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                </svg>
                            </button>
                        )}
                        {(isAdmin && message.sender !== userInfo.generatedUsername) && (
                            <button className='ban' onClick={() => handleBanUser(message.senderInfo._id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </button>
                        )}
                        {message.sender === userInfo.generatedUsername
                            ?   <span className={`senderYou ${userColor}`}>
                                {isAdmin && (
                                    // <span style={{fontSize: "10px", fontWeight: "800"}} className='admin'>(ADMIN) </span>
                                    <span style={{fontSize: "10px", fontWeight: "800"}} className={`admin`}>(ADMIN) </span>
                                )}
                                {isPremium && (
                                    <>
                                    <span style={{fontSize: "10px", fontWeight: "800"}} className='premium'>(Premium)</span>
                                    </>
                                )}

                                You{<span style={{fontSize: "9px", fontWeight: "800"}}> ({message.sender})</span>}:
                                </span>
                            :   <span className='sender'>
                                    {message.senderInfo.role === "admin" ? (
                                        <span className={`senderAdmin ${message.senderInfo.userColor}`}>
                                            <span className={`admin`}>⚔️(ADMIN)</span> {message.sender}: 
                                        </span>
                                    ) : message.senderInfo.role === "premium" ? (
                                        <span className={`senderVip ${message.senderInfo.userColor}`}>
                                            <span className={`premium`}>💎(PREMIUM)</span> {message.sender}: 
                                        </span>
                                    ) : (
                                        <span className={`sender ${message.senderInfo.userColor}`}>{message.sender}:</span>
                                    )}
                                </span>
                        }
                        {message.hidden && isAdmin ? (
                            <span className='admin-hidden-text'>{message.content}</span>
                        ) : (
                            <span>{message.content}</span>
                        )}
                    </div>
                ) : null
            ))}
            </>
        )
    };



    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isAdmin = userInfo?.role?.includes('admin');
    const isPremium = userInfo?.role?.includes('premium');
    const userColor = userInfo?.userColor;

    return (
        <div className="chat-container">
            <div className="chat-messages">
                <MessegaList messages={messages} />
                <div ref={messagesEndRef} />
            </div>

            {!isAdmin && !isPremium && messageCooldown > 0 ? (
                <span> Sürenin kısalması için mail adresini doğrulayabilir veya premium hesaba geçiş yapabilirsiniz.</span>
            )
            : null
            }
            
            <div className="chat-input">
            {isAdmin || isPremium ? (
                <button className='settings-button' onClick={() => setShowSettings(true)}>⚙️</button>
            ) : null}
            {showSettings && (
                <ChatSettings onClose={() => setShowSettings(false)} />
            )}
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isAdmin && !isPremium && messageCooldown > 0}
                    placeholder={!isAdmin && !isPremium && messageCooldown > 0 ? `Bu süre içerisinde tekrar mesaj gönderemezsiniz: ${messageCooldown} saniye`  : 'Type a message'}
                />
                
                <button onClick={handleSendMessage} disabled={!isAdmin && !isPremium && messageCooldown > 0}>Send</button>
            </div>
        </div>
    );
}

export default Chat;
