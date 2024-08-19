import React from 'react';
import { useNavigate } from 'react-router-dom';
import img from './bgimg.jpg';
import img1 from './dslogo1.png';

const Instructions = () => {
  const navigate = useNavigate();

  const navigateToDash = () => {
    navigate('/dash');
  };
  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <div className='relative h-full w-full'>
      <img className="absolute inset-0 w-full h-full object-cover" src={img} alt="Background" />
      
      <div className='relative p-6 md:p-6 mx-auto bg-white/30 backdrop-blur-sm rounded-lg shadow-lg'>
        <div className='flex justify-between items-center mb-2'>
          <h1 className='text-3xl p-3 font-bold text-cyan-800'>Instructions</h1>
          <img src={img1} alt="Logo" className="h-[100px] w-auto" /> {/* Adjusted size and position */}
        </div>
        <div className='flex gap-2 backdrop-blur-lg rounded-lg p-8 shadow-xl border-4 border-dotted border-teal-700'>
          <ol className='text-lg list-decimal font-medium space-y-6'>
            <li>Welcome to the quiz! Please read the following instructions carefully before proceeding:</li>
            <li>This quiz consists of 20 multiple-choice questions. Each question has 4 possible options, with only one correct answer.</li>
            <li>You will have 60 minutes to complete the quiz. The timer will start as soon as you click the "Start" button.</li>
            <li>Once you begin the quiz, you will not be able to pause or stop the timer. Please ensure you have enough time to complete the quiz before starting.</li>
            <li>Each question must be answered before you can proceed to the next question. You cannot skip or return to previous questions.</li>
            <li>Your score will be displayed at the end of the quiz. To pass the quiz, you must achieve a minimum score of 80%.</li>
            <li>If you do not pass the quiz on your first attempt, you will be given the opportunity to retake it. However, the questions and answer choices may be rearranged.</li>
            <li>Cheating or sharing answers is strictly prohibited. Doing so may result in disqualification from the quiz and potential disciplinary action.</li>
            <li>By clicking the <span className='font-bold'>START</span> button, you agree to abide by these instructions and the terms and conditions of this quiz. If you do not agree, please exit the quiz now.</li>
          </ol>
        </div>

        <div className='flex justify-between mt-6'>
          <button className='px-8 py-2 text-white rounded-md bg-teal-600 hover:bg-teal-700 transition-colors' onClick={navigateToHome}>« Exit </button>
          <button className='px-8 py-2 text-white rounded-md bg-cyan-600 hover:bg-cyan-700 transition-colors' onClick={navigateToDash}>Start »</button>
        </div>
      </div>
    </div>
  );
}

export default Instructions;