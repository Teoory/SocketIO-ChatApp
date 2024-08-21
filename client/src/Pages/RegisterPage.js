import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './Login.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email,setEmail] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
    });

    async function register(ev) {
        ev.preventDefault();
        if (password !== confirmPassword) {
            alert('Şifreler birbiriyle eşleşmiyor!');
            return;
        }
        if (!passwordValidations.minLength || !passwordValidations.hasUppercase || !passwordValidations.hasLowercase || !passwordValidations.hasNumber)
        {
            alert('Lütfen şifrenizi kontrol edin!');
            return;
        }
        const response = await fetch('http://localhost:3030/register', {
            method: 'POST',
            body: JSON.stringify({username, password, email}),
            headers: {'Content-Type': 'application/json'},
        });
        if (response.ok) {
            alert('Kayıt Başarılı!');
            setRedirect(true);
        } else {
            alert('Kayıt olurken hata oluştu! Lütfen tekrar deneyin.');
        }
    }

    
    const validatePassword = (value) => {
        const validations = {
            minLength: value.length >= 8,
            hasUppercase: /[A-Z]/.test(value),
            hasLowercase: /[a-z]/.test(value),
            hasNumber: /\d/.test(value),
        };
        setPasswordValidations(validations);
    };

    const handleChangePassword = (ev) => {
        const value = ev.target.value;
        setPassword(value);
        validatePassword(value);
    };

    if(redirect) {
      return <Navigate to="/login"/>;
    }
    
    return (
        <div className='loginArea'>
          <form className="login" onSubmit={register}>
            <h1>Kayıt Ol</h1>
            <input type="email"
                    placeholder="email"
                    value={email}
                    required
                    onChange={ev => setEmail(ev.target.value)} />
            <input type="text"
                    placeholder="username"
                    value={username}
                    minLength={5}
                    maxLength={16}
                    required
                    onChange={ev => setUsername(ev.target.value)} />
            <input type="password"
                    placeholder="password"
                    value={password}
                    minLength={8}
                    required
                    autoComplete="off"
                    onChange={handleChangePassword} />
                    {password !== '' && 
                    <ul className="password-validations">
                        {!passwordValidations.minLength && <li>Minimum 8 karakter olmalı</li>}
                        {!passwordValidations.hasUppercase && <li>Minimum bir büyük harf içermeli</li>}
                        {!passwordValidations.hasLowercase && <li>Minimum bir küçük harf içermeli</li>}
                        {!passwordValidations.hasNumber && <li>Minimum bir numara içermeli</li>}
                    </ul>
                    }
            <input type="password"
                    placeholder="confirm password"
                    value={confirmPassword}
                    required
                    onChange={ev => setConfirmPassword(ev.target.value)} />
                    {confirmPassword !== '' && password !== confirmPassword && <div className="password-validations">Şifreler eşleşmiyor!</div>}
            <button>Kayıt Ol</button>
            <div className='newAccount'>Zaten bir hesabın var mı? <Link to="/login">Giriş Yap</Link></div>
          </form>
        </div>
    )
}

export default RegisterPage