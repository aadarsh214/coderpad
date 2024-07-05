import React, { useEffect, useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigateTo = useNavigate();
  const [quizzes, setQuizzes] = useState([]);

  const parsed = queryString.parse(window.location.search);
  const userID = parsed.userID; // Retrieve the value of a specific query parameter
 


  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('https://13.239.62.23/quiz/quizzes');
      setQuizzes(response.data);

    
     
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleStartQuiz = async (quizID, userID) => {
    // Redirect to the quiz page
    navigateTo(`/quiz?quizID=${quizID}&userID=${userID}`);

  };

  const handleRegisterQuiz = async (quizID, userID) => {
    console.log(quizID+' '+userID);
    try {
      const response = await axios.post('https://13.239.62.23/sql-quiz/register', {
        userID: userID,
        quizID: quizID,
      }, {
        headers: {
          'Content-Type': 'application/json' // Ensure the content type is set to JSON
        }
      });
      console.log('Quiz registration successful:', response.data);
      // Assuming you want to show a message or perform some action upon success
      alert('Quiz registration successful');
      // Handle success (e.g., redirect to another page if needed)
    } catch (error) {
      console.error('Error registering quiz:', error);
      // Handle error (e.g., show an error message)
      alert('Failed to register for quiz');
    }
  };
  

  function registerORStart(quiz){
    if(determineButtonLabel(quiz) == 'Register'){
        handleRegisterQuiz(quiz._id, userID)
    }else if(determineButtonLabel(quiz) == 'Start'){
        //start quiz here
        handleStartQuiz(quiz._id, userID)
    }
  }
  


  const determineButtonLabel = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.start);
    const endDate = new Date(quiz.end);

    if (now < startDate) {
      return 'Register';
    } else if (now >= startDate && now <= endDate) {
      return 'Start';
    } else {
      return 'Ended';
    }
  };

  const determineButtonColor = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.start);
    const endDate = new Date(quiz.end);

    if (now < startDate) {
      return 'bg-blue-500 hover:bg-blue-700';
    } else if (now >= startDate && now <= endDate) {
      return 'bg-green-500 hover:bg-green-700';
    } else {
      return 'bg-gray-500 hover:bg-gray-700';
    }
  };

  return (
    <div className="flex flex-wrap justify-center p-4">
    {quizzes.map((quiz) => (
      <div key={quiz._id} className="max-w-sm rounded overflow-hidden shadow-lg m-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{quiz.quizName}</div>
          <p className="text-gray-700 text-base">
            Start Time: {new Date(quiz.start).toLocaleString()}<br />
            End Time: {new Date(quiz.end).toLocaleString()}
          </p>
        </div>
        <div className="px-6 py-4">
          <button
            onClick={() => handleStartQuiz(quiz._id, 'someuserID@example.com')}
            className={`text-white font-bold py-2 px-4 rounded ${determineButtonColor(quiz)}`}
            disabled={determineButtonLabel(quiz) === 'Ended'}
          >
            {determineButtonLabel(quiz)}
          </button>
        </div>
      </div>
    ))}
  </div>
);
};

export default Home;
