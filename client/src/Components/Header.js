import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../Hooks/UserContext';

function Header() {
    const { setUserInfo, userInfo } = useContext(UserContext);

    useEffect(() => {
        try {
            fetch('http://localhost:3030/profile', {
                credentials: 'include',
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Profile fetch failed');
                }
                return response.json();
            }).then(userInfo => {
                setUserInfo(userInfo);
            }).catch(error => {
                console.error('Error fetching profile:', error);
            });
        }
        catch (error) {
            console.error('Error fetching profile:', error);
        }
    }, []);

    const username = userInfo?.username;

    const role = userInfo?.role;
    const isAdmin = role?.includes('admin');
    const isEditor = role?.includes('editor') || isAdmin;
    const isPremium = role?.includes('premium') || isEditor;
    const isUser = role?.includes('user') || isPremium;
    const isQuest = role?.includes('quest') || isUser;

    function deleteCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999;';  
    }
    
    function logout() {
        fetch('http://localhost:3030/logout', {
            credentials: 'include',
            method: 'POST',
        }).then(() => {
            deleteCookie('token');
            setUserInfo(null);
            console.log(userInfo);
        });
    }


    return (
        <header>
            <div className="about">
                <h1>PrivChat</h1>
            </div>
            <div className="links">

                {isQuest && (
                    <>
                    <Link to="/">Home</Link>
                    <Link to={`/profile/${username}`}>Profile</Link>
                    
                {isAdmin && (
                    <Link to="/addchannel">AddChannel</Link>
                )}
                {!isPremium && (
                    <Link className='premiumHeader' to="/premium">Buy Premium</Link>
                )}
                    <a onClick={logout} style={{ cursor: 'pointer' }}>Logout</a>
                    </>
                )}

                {!isQuest && (
                    <>
                    <Link to="/login">Home</Link>
                    <Link to="/login">Login</Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;