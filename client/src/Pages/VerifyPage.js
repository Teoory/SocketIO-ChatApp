import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../Hooks/UserContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const VerifyPage = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const { setUserInfo, userInfo } = useContext(UserContext);
    const navigate = useNavigate();

    
  useEffect(() => {
        fetch('http://localhost:3030/profile', {
          credentials: 'include',
        }).then(response => {
          response.json().then(userInfo => {
            setUserInfo(userInfo);
          });
        });
    }, []);
    const email = userInfo?.email;

    const verifyEmail = async (ev) => {
        ev.preventDefault();

        const response = await fetch('http://localhost:3030/verify-email', {
            method: 'POST',
            body: JSON.stringify({ verificationCode }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            alert('E-posta doğrulama başarılı!');
            navigate('/login');
        } else {
            alert('E-posta doğrulama başarısız! Lütfen tekrar deneyin.');
        }
    };

    const requestNewCode = async () => {
        const response = await fetch('http://localhost:3030/request-verify-code', {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            alert('Yeni doğrulama kodu başarıyla gönderildi.');
        } else {
            alert('Yeni doğrulama kodu isteği başarısız! Lütfen tekrar deneyin.');
        }
    };


    return (
        <div className='loginArea Verify'>
            <form className="login" onSubmit={verifyEmail}>
                <h1>E-posta Doğrulama</h1>
                <input
                    type="text"
                    placeholder="Doğrulama Kodu"
                    value={verificationCode}
                    required
                    onChange={ev => setVerificationCode(ev.target.value)}
                />
                <button>E-Postayı Doğrula</button>
            </form>
            <div className='requestArea'>
                <button onClick={requestNewCode}>Yeni Kod İste</button>
            </div>
        </div>
    );
}

export default VerifyPage