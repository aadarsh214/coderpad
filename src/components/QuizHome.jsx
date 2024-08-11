import React, { useState } from 'react';
import video from './quizvid.mp4';
import { useNavigate } from 'react-router-dom';

const Button = ({ children, onClick, logo }) => (
  <button className="bg-none border-none flex flex-col items-center" onClick={onClick}>
    <div className="relative transition-all duration-200 ease-in-out border-none bg-none group">
      <div className="w-[110px] aspect-square rounded-full overflow-hidden relative grid place-content-center border-r-[5px] border-r-white border-l-[5px] border-l-[rgba(128,128,128,0.147)] rotate-[-45deg] transition-all duration-500 ease-in-out">
        <div className="h-[60px] aspect-square rounded-full relative shadow-[rgba(100,100,111,0.5)_-10px_5px_10px_0px] transition-all duration-500 ease-in-out group-hover:scale-110 group-active:scale-70">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[rgb(1,85,103)] to-[rgb(147,245,255)]"></div>
          <div className="absolute inset-[5px] rounded-full bg-gradient-to-r from-[rgb(0,103,140)] to-[rgb(58,209,233)] grid place-content-center">
            <svg className="opacity-50 w-[30px] aspect-square rotate-[45deg] transition-all duration-200 ease-in group-hover:opacity-100 group-hover:filter-[drop-shadow(0_0_10px_white)]" viewBox="0 0 24 24">
              {logo}
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(255,255,255,0.888)] translate-y-[-50%] rotate-0 origin-bottom-center transition-all duration-500 ease-in-out group-hover:translate-y-[-40%]"></div>
      </div>
    </div>
    <span className="mt-2 text-white text-center text-sm font-medium">{children}</span>
  </button>
);

const logos = {
  home: <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />,
  python: <path d="M12.042 6.858c-3.94 0-3.695 1.725-3.695 1.725v1.784h3.752v0.53H6.917c0 0-2.626-0.297-2.626 3.847 0 4.144 2.291 3.995 2.291 3.995h1.368v-1.925c0 0-0.073-2.291 2.254-2.291h3.877c0 0 2.177 0.037 2.177-2.104V8.413c0 0 0.331-2.664-3.8-2.664L12.042 6.858zM9.193 7.592c0.373 0 0.674 0.301 0.674 0.674s-0.301 0.674-0.674 0.674c-0.373 0-0.674-0.301-0.674-0.674S8.82 7.592 9.193 7.592z" />,
  excel: <path d="M21.17 3H7.83C6.82 3 6 3.82 6 4.83v14.34c0 1.01.82 1.83 1.83 1.83h13.34c1.01 0 1.83-.82 1.83-1.83V4.83C23 3.82 22.18 3 21.17 3zM8 17.5h3.5V19H8v-1.5zm0-2h3.5V17H8v-1.5zm0-2h3.5V15H8v-1.5zm8 4h-3.5V19H16v-1.5zm0-2h-3.5V17H16v-1.5zm0-2h-3.5V15H16v-1.5zm0-2h-3.5V13H16v-1.5zm-8-2h3.5V11H8V9.5zm8 0h-3.5V11H16V9.5zm0-2h-3.5V9H16V7.5zm0-2h-3.5V7H16V5.5zm-8 4h3.5V11H8V9.5z" />,
  sql: <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1 15H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V7h3v2zm6 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />,
  powerbi: <path d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM11 19H4v-6h7v6zm0-8H4V5h7v6zm9 8h-7v-6h7v6zm0-8h-7V5h7v6z" />,
  tableau: <path d="M11.654 3H9.114v2.5h2.54V3zm5.903 0h-2.54v2.5h2.54V3zM5.75 3H3.21v2.5h2.54V3zm5.904 5.783h-2.54v2.5h2.54v-2.5zm5.903 0h-2.54v2.5h2.54v-2.5zM5.75 8.783H3.21v2.5h2.54v-2.5zm5.904 5.783h-2.54v2.5h2.54v-2.5zm5.903 0h-2.54v2.5h2.54v-2.5zM5.75 14.566H3.21v2.5h2.54v-2.5zm5.904 5.784h-2.54V23h2.54v-2.65zm5.903 0h-2.54V23h2.54v-2.65zM5.75 20.35H3.21V23h2.54v-2.65z" />
};

const QuizHome = () => {
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };
  const navigateToInstructions = () => {
    navigate('/instructions');
  };

  const topics = [
    { name: 'Home', logo: logos.home },
    { name: 'Python', logo: logos.python },
    { name: 'Excel', logo: logos.excel },
    { name: 'SQL', logo: logos.sql },
    { name: 'Power BI', logo: logos.powerbi },
    { name: 'Tableau', logo: logos.tableau }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 md:items-center max-w-4xl mx-auto ">
        <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4 text-center">Welcome to the World of Learning!</h1>
        <p className="text-white text-2xl font-semibold sm:text-2xl mb-8 text-center ">Select the Topic to Start</p>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {topics.map((topic, index) => (
            <Button key={index} onClick={handleClick} logo={topic.logo}>
              {topic.name}
            </Button>
          ))}
        </div>
      </div>
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-20 p-4">
          <div className="relative bg-gray-900 bg-opacity-100 text-white p-6 sm:p-8 rounded-3xl shadow-lg w-full max-w-2xl h-[20rem] border-2 border-gray-300">
            <button onClick={handleClose} className="absolute top-0 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
            <h2 className="text-3xl font-bold mb-4 text-center">Let's Get Started</h2>
            <p className="mb-10 text-xl font-base text-center">What would you like to do next?<br/> Practice questions or attempt a quiz?</p>
            <div className="flex flex-col sm:flex-row justify-around space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={navigateToInstructions} className="w-full sm:w-auto bg-gray-300 hover:bg-blue-600 text-black py-2 px-4 rounded-full transition duration-300 ease-in-out">
                Practice Questions
              </button>
              <button onClick={navigateToInstructions} className="w-full sm:w-auto bg-gray-300 hover:bg-green-600 text-black  py-2 px-4 rounded-full transition duration-300 ease-in-out">
                Take Quiz
              </button>
            </div>
            <div className='flex justify-end'>
              <button onClick={handleClose} className="mt-4 sm:mt-6 lg:mt-8 text-sm underline text-gray-400 hover:text-white">
                Decide Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizHome;