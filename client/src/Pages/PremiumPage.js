import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../Hooks/UserContext';
import { Link, useNavigate } from 'react-router-dom';

const PremiumPage = () => {
    const [isChecked, setIsChecked] = useState(false);
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

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const isVerified = userInfo?.isVerified;

    return (
        <div className="premium-page">
            <h1 className='premiumHeader'>Premium Avantajları</h1>
            <p>Premium üyelik ile şu avantajlara sahip olacaksınız:</p>
            <div className='prePage'>
                <span className='premiumAvantage'>Sohbet süresinden etkilenmez</span>
                <span className='premiumAvantage'>Kullanıcı adını yenileyebilir</span>
                {/* <span>Reklamsız deneyim imkanı</span> */}
                <span className='premiumAvantage'>Özel içeriklere erişebilir</span>
                <span className='premiumAvantage'>Ve daha fazlası...</span>
            </div>
            <p>
                Satın alma işleminden sonra bu işlemin bir daha geri alınamayacağını lütfen unutmayın.
            </p>

            {isVerified ? (
                <div className="verifiedAccount">
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="confirmation"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="confirmation">
                            Yukarıdaki bilgileri okudum ve kabul ediyorum.
                        </label>
                    </div>
                    <Link to={isChecked ? "/purchase" : "#"}>
                        <button
                            onClick={(e) => {
                                if (!isChecked) {
                                    e.preventDefault();
                                    alert('Devam etmeden önce onay kutusunu işaretlemelisiniz.');
                                }
                            }}
                            className="continue-button2"
                        >
                            Satın Almaya Devam Et
                        </button>
                    </Link>
                </div>
            ) : (
                <Link to="/verify">
                    <button className="continue-button">Hesabınızı doğrulayın</button>
                </Link>
            )}
            
            
        </div>
    );
};

export default PremiumPage;
