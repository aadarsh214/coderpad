import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import Home from './components/Home';
import QuizApp from './components/QuizApp';
import PythonQuizApp from './components/PythonQuizApp';
import Quiz from './components/Quiz';
import QuizHome from './components/QuizHome'; // Import the QuizHome component
import Instructions from './components/Instructions';
import DataSkillsDashboard from './components/dash';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dash" element={<DataSkillsDashboard />} />
        <Route path="/quiz" element={<QuizApp />} />
        <Route path="/pyQuiz" element={<PythonQuizApp />} />
        <Route path="/mcqQuiz" element={<Quiz />} />
        {<Route path="/" element={<QuizHome />} /> /* Add a new route for QuizHome */}
        <Route path="/instructions" element={<Instructions />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;