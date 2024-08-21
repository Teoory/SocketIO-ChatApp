import { useEffect, useState, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { UserContext } from '../Hooks/UserContext';


const ProfilPage = () => {
    const { username } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const { setUserInfo, userInfo } = useContext(UserContext);

    useEffect(() => {
        fetch(`http://localhost:3030/profile/${username}`)
            .then(response => response.json())
            .then(data => setUserProfile(data));
    }, [username]);

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


    const handleUsernameChange = () => {
        fetch('http://localhost:3030/change-generated-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userInfo.username }),
        })
        .then(response => response.json())
        .then(data => {
            setUserInfo(data);
        })
        .catch(error => {
            console.error('Error changing username:', error);
        });
    };

    const vipRole = userInfo.role.includes('admin') || userInfo.role.includes('premium') || userInfo.role.includes('editor');
    const userColor = userInfo?.userColor;

    if (!userInfo) {
        return <Navigate to="/" />;
    }

    if (!userProfile) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className='user-profile-page'>
            <div className="ProfilePageMain">
                <h1>Profil</h1>
                <div className="ProfileCard">
                    <div className="infoArea">
                        {/* <div className="username">{userInfo.username}</div> */}
                        <div className={`username ${userColor}`}><span className='userInfo'>Username:</span> {userInfo.generatedUsername}</div>
                        <div className="email"><span className='userInfo'>Mail:</span> {userInfo.email}</div>
                        <div className={`role ${userInfo.role}`}>{userInfo.role}</div>
                    </div>
                </div>
                
                <div className="verifyArea">
                  <div className={`verify ${userInfo.isVerified ? 'MailVerified' : 'MailNotVerified'}`}>
                    {userInfo.isVerified ? 'E-posta doğrulanmış' : 'E-posta doğrulanmamış'}
                    {userInfo.username === username && !userInfo.isVerified && (
                      <Link to="/verify" className="verifyLink">
                        E-posta doğrulama
                      </Link>
                    )}
                  </div>
                </div>

                {vipRole && (
                    <div className="changeUsernameArea">
                        <button onClick={handleUsernameChange}>Kullanıcı Adını Yenile</button>
                    </div>
                )}

            </div>
        </div>
    )
}

export default ProfilPage