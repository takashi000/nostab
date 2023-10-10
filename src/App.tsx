import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Auth from './components/Auth/Auth'; 

function App() {
  return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Auth />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
