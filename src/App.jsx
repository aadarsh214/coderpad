import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import Home from './components/Home';
import QuizApp from './components/QuizApp'; // Your QuizApp component

const App = () => {

  useEffect(() => {
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content = 'upgrade-insecure-requests';
    document.getElementsByTagName('head')[0].appendChild(metaTag);
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<QuizApp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
