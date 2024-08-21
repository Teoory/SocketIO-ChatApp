import './App.css';
import { UserContextProvider } from './Hooks/UserContext';
import AppRouter from './Routes/AppRouter';

import Header from './Components/Header';
import BackgroundVideo from './Components/BackgroundVideo';

function App() {
  return (
    <UserContextProvider>
      <div className="App">
        <Header />
        <BackgroundVideo />
        <div className="content">
          <AppRouter />
        </div>
      </div>
    </UserContextProvider>
  );
}

export default App;
