import React, { useState, useContext } from "react";
// import axios from "axios";
import { UserContext } from "../Hooks/UserContext";
import { Navigate } from "react-router-dom";

const PurchasePage = () => {
  const {userInfo, setUserInfo} = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [price] = useState("30");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!price || isNaN(price) || price <= 0) {
      setMessage("Lütfen geçerli bir tutar girin.");
      return;
    }
    if (!cardNumber || !cardHolderName || !expiryDate || !cvc) {
      setMessage("Lütfen tüm kart bilgilerini eksiksiz girin.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3030/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo?._id,
          price,
          paymentCard: {
            cardNumber,
            cardHolderName,
            expireMonth: expiryDate.split("/")[0],
            expireYear: `20${expiryDate.split("/")[1]}`,
            cvc,
          },
        }),
      });

      if (response.data.message === "Ödeme başarılı, Premium aktif edildi") {
        setMessage("Ödeme başarılı! Premium üyelik aktif edildi.");
        logoutUser();
        // setRedirect(true);
      } else {
        setMessage("Ödeme işlemi sırasında bir hata oluştu.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    // await fetch('https://cofiwo-api.vercel.app/logout', {
    await fetch(`http://localhost:3030/logout`, {
        credentials: 'include',
        method: 'POST',
    });
    
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
    setUserInfo(null);
  };

  if (redirect) {
    return <Navigate to="/home" />;
  }

  return (
    <div style={styles.container}>
      <h2>Ödeme Sayfası</h2>
      <div style={styles.userInfo}>
        <p>
          <strong>E-posta:</strong> {userInfo?.email || "Bilinmiyor"}
        </p>
        <p>
          <strong>Kullanıcı Adı:</strong> {userInfo?.username || "Bilinmiyor"}
        </p>
        <p>
          <strong>id:</strong> {userInfo?._id || "Bilinmiyor"}
        </p>
        <p>
          <strong>Rol:</strong> {userInfo?.role || "Bilinmiyor"}
        </p>
      </div>

      <div style={styles.paymentForm}>
        <label>
          <strong>Premium Üyelik Fiyatı:</strong>
        </label>
        <input
          type="number"
          value={price}
          placeholder="Ödenecek tutarı girin"
          readOnly
          style={styles.input}
        />

        <label>
          <strong>Kart Numarası:</strong>
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="Kart numarasını girin"
          style={styles.input}
        />

        <label>
          <strong>Kart Sahibinin Adı:</strong>
        </label>
        <input
          type="text"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
          placeholder="Kart sahibinin adını girin"
          style={styles.input}
        />

        <label>
          <strong>Son Kullanma Tarihi (MM/YY):</strong>
        </label>
        <input
          type="text"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          placeholder="Örn: 12/25"
          style={styles.input}
        />

        <label>
          <strong>CVC:</strong>
        </label>
        <input
          type="text"
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
          placeholder="Kartın arkasındaki 3 haneli CVC"
          style={styles.input}
        />

        <button onClick={handlePayment} style={styles.button} disabled={loading}>
          {loading ? "Ödeme İşleniyor..." : "Ödemeyi Tamamla"}
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
  },
  userInfo: {
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "left",
  },
  paymentForm: {
    marginTop: "20px",
  },
  input: {
    display: "block",
    margin: "10px auto",
    padding: "8px",
    width: "100%",
    maxWidth: "300px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  message: {
    marginTop: "20px",
    color: "green",
  },
};

export default PurchasePage;