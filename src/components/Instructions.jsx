import React from 'react';
import { useNavigate } from 'react-router-dom';
import img from './instr.png';

const Instructions = () => {
  const navigate = useNavigate();

  const navigateToDash = () => {
    navigate('/dash');
  };

  return (
    <div className='relative h-full w-full'>
      <img className="absolute inset-0 w-full h-full object-fill" src={img} alt="Instructions" />
      <div className='relative p-16 mx-auto'>
        <h1 className='text-3xl font-bold mb-4'>Instructions</h1>
        <ol className='text-lg p-2 list-decimal space-y-4'>
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
        <div className='flex justify-end'>
          <button className='px-12 py-2 text-white rounded-xl bg-black' onClick={navigateToDash}>Start</button>
        </div>
      </div>
    </div>
  );
}

export default Instructions;