"use client";

import { useState, useEffect } from "react";

interface Answer {
  id: number;
  success: boolean;
  comment: string | null;
  user_relation: {
    id: number;
    username: string;
  } | null;
}

interface Result {
  id: number;
  success: boolean | null;
  description: string | null;
}

interface Agent {
  id: number;
  user_relation: {
    id: number;
    username: string;
  };
}

interface Owner {
  agent_rel: any;
  id: number;
  username: string;
}

interface Bet {
  id: number;
  bet: string;
  description: string | null;
  answers: Answer[];
  results: Result[];
  agents: Agent[];
  owners: Owner[];
}

interface UserScore {
  userId: number;
  username: string;
  correctAnswers: number;
  totalAnswers: number;
  percentage: number;
}

interface BetWithAgent {
  betTitle: string;
  betDescription: string | null;
  agentUsername: string;
  success: boolean;
}

export default function AdminPresentPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [currentBetIndex, setCurrentBetIndex] = useState(0);
  const [revealStage, setRevealStage] = useState<'bet' | 'answers' | 'result' | 'complete'>('bet');
  const [revealedAnswerCount, setRevealedAnswerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [revealedUserCount, setRevealedUserCount] = useState(0);
  const [showSuccessfulBets, setShowSuccessfulBets] = useState(false);
  const [revealedSuccessCount, setRevealedSuccessCount] = useState(0);
  const [showFailedBets, setShowFailedBets] = useState(false);
  const [revealedFailedCount, setRevealedFailedCount] = useState(0);

  async function checkAdminAndLoadBets() {
    try {
      const response = await fetch('/api/admin/check');
      if (!response.ok) {
        window.location.href = '/bets';
        return;
      }
      const data = await response.json();
      setIsAdmin(data.isAdmin);
      
      const betsResponse = await fetch('/api/admin/bets');
      const betsData = await betsResponse.json();
      setBets(betsData);
      setIsLoading(false);
    } catch (error) {
      window.location.href = '/bets';
    }
  }

  useEffect(() => {
    checkAdminAndLoadBets();
  }, []);

  const currentBet = bets[currentBetIndex];

  // Handle click to reveal next answer
  useEffect(() => {
    if (revealStage !== 'answers') return;
    if (!currentBet) return;

    const handleClick = () => {
      if (revealedAnswerCount < currentBet.answers.length) {
        setRevealedAnswerCount(prev => prev + 1);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [revealStage, revealedAnswerCount, currentBet]);

  // Handle click to reveal next user in leaderboard
  useEffect(() => {
    if (!showLeaderboard) return;

    const userScores = calculateUserScores();

    const handleClick = () => {
      if (revealedUserCount < userScores.length) {
        setRevealedUserCount(prev => prev + 1);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showLeaderboard, revealedUserCount, bets]);

  // Handle click to reveal next successful bet
  useEffect(() => {
    if (!showSuccessfulBets) return;

    const successfulBets = getSuccessfulBets();

    const handleClick = () => {
      if (revealedSuccessCount < successfulBets.length) {
        setRevealedSuccessCount(prev => prev + 1);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showSuccessfulBets, revealedSuccessCount, bets]);

  // Handle click to reveal next failed bet
  useEffect(() => {
    if (!showFailedBets) return;

    const failedBets = getFailedBets();

    const handleClick = () => {
      if (revealedFailedCount < failedBets.length) {
        setRevealedFailedCount(prev => prev + 1);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showFailedBets, revealedFailedCount, bets]);

  const hasResult = currentBet?.results && currentBet.results.length > 0;
  const result = hasResult ? currentBet.results[0] : null;

  function calculateUserScores(): UserScore[] {
    const userMap = new Map<number, UserScore>();

    bets.forEach(bet => {
      bet.answers.forEach(answer => {
        if (!answer.user_relation) return;
        
        const userId = answer.user_relation.id;
        const username = answer.user_relation.username;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            username,
            correctAnswers: 0,
            totalAnswers: 0,
            percentage: 0
          });
        }

        const userScore = userMap.get(userId)!;
        userScore.totalAnswers++;
        if (answer.success) {
          userScore.correctAnswers++;
        }
      });
    });

    // Calculate percentages and sort by correct answers (ascending - worst first)
    const scores = Array.from(userMap.values()).map(score => ({
      ...score,
      percentage: score.totalAnswers > 0 ? (score.correctAnswers / score.totalAnswers) * 100 : 0
    }));

    return scores.sort((a, b) => a.correctAnswers - b.correctAnswers);
  }

  function getSuccessfulBets(): BetWithAgent[] {
    const successfulBets: BetWithAgent[] = [];
    
    bets.forEach(bet => {
      const betResult = bet.results && bet.results.length > 0 ? bet.results[0] : null;
      if (betResult?.success) {
        bet.owners.forEach(owner => {
          successfulBets.push({
            betTitle: bet.bet,
            betDescription: bet.description,
            agentUsername: owner.agent_rel.user_relation.username,
            success: true
          });
        });
      }
    });
    
    return successfulBets;
  }

  function getFailedBets(): BetWithAgent[] {
    const failedBets: BetWithAgent[] = [];
    
    bets.forEach(bet => {
      const betResult = bet.results && bet.results.length > 0 ? bet.results[0] : null;
      if (betResult?.success === false) {
        bet.owners.forEach(owner => {
          failedBets.push({
            betTitle: bet.bet,
            betDescription: bet.description,
            agentUsername: owner.agent_rel.user_relation.username,
            success: false
          });
        });
      }
    });
    
    return failedBets;
  }

  function nextStage() {
    if (revealStage === 'bet') {
      setRevealStage('answers');
      setRevealedAnswerCount(0);
    } else if (revealStage === 'answers') {
      if (hasResult) {
        setRevealStage('result');
      } else {
        setRevealStage('complete');
      }
    } else if (revealStage === 'result') {
      setRevealStage('complete');
    }
  }

  function nextBet() {
    if (currentBetIndex < bets.length - 1) {
      setCurrentBetIndex(currentBetIndex + 1);
      setRevealStage('bet');
      setRevealedAnswerCount(0);
    }
  }

  function previousBet() {
    if (currentBetIndex > 0) {
      setCurrentBetIndex(currentBetIndex - 1);
      setRevealStage('bet');
      setRevealedAnswerCount(0);
    }
  }

  function goToLeaderboard() {
    setShowLeaderboard(true);
    setRevealedUserCount(0);
  }

  function goToSuccessfulBets() {
    setShowLeaderboard(false);
    setShowSuccessfulBets(true);
    setRevealedSuccessCount(0);
  }

  function goToFailedBets() {
    setShowSuccessfulBets(false);
    setShowFailedBets(true);
    setRevealedFailedCount(0);
  }

  function backToBets() {
    setShowLeaderboard(false);
    setShowSuccessfulBets(false);
    setShowFailedBets(false);
    setCurrentBetIndex(0);
    setRevealStage('bet');
    setRevealedAnswerCount(0);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (!currentBet && !showLeaderboard && !showSuccessfulBets && !showFailedBets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">No bets available</div>
      </div>
    );
  }

  // Failed Bets View (Finale)
  if (showFailedBets) {
    const failedBets = getFailedBets();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white !max-w-none w-full">
        {/* Controls */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              backToBets();
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            ← Back to Bets
          </button>
        </div>

        {/* Click instruction */}
        {revealedFailedCount < failedBets.length && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-600/90 px-6 py-3 rounded-full text-white font-medium animate-pulse">
            Click anywhere to reveal next dummstrut ({revealedFailedCount}/{failedBets.length})
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-screen p-8 w-full">
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 animate-bounce">𓉴</div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              ÅRETS DUMMSTRUTAR
            </h1>
            <p className="text-2xl text-gray-400 mt-4">
              Wall of shame
            </p>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {failedBets.map((bet, index) => {
              const isRevealed = index < revealedFailedCount;

              return (
                <div
                  key={index}
                  className={`
                    bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm rounded-xl p-6 border-2 border-red-500/50 shadow-2xl shadow-red-500/20 transition-all duration-700 transform
                    ${isRevealed 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg
                      transition-all duration-500
                      ${isRevealed ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
                    `}>
                      ✗
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-2xl text-red-300 mb-2 transition-all duration-500 ${
                        isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}>
                        {bet.agentUsername}
                      </div>
                      <div className={`text-gray-300 font-medium mb-1 transition-all duration-500 delay-100 ${
                        isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}>
                        {bet.betTitle}
                      </div>
                      {bet.betDescription && (
                        <div className={`text-sm text-gray-400 italic transition-all duration-500 delay-200 ${
                          isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}>
                          {bet.betDescription}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {failedBets.length === 0 && (
            <div className="text-center mt-12 animate-in fade-in duration-1000">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-4xl font-bold text-gray-300">
                Everyone completed their bets!
              </div>
            </div>
          )}

          {revealedFailedCount === failedBets.length && failedBets.length > 0 && (
            <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500">
              <div className="text-6xl mb-4">🎊</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Det var det!
              </div>
              <div className="text-2xl text-gray-400 mt-4">
                Tack till alla deltagare!
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Successful Bets View
  if (showSuccessfulBets) {
    const successfulBets = getSuccessfulBets();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white !max-w-none w-full">
        {/* Controls */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              backToBets();
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            ← Back to Bets
          </button>
        </div>

        {/* Click instruction */}
        {revealedSuccessCount < successfulBets.length && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-600/90 px-6 py-3 rounded-full text-white font-medium animate-pulse">
            Click anywhere to reveal next ({revealedSuccessCount}/{successfulBets.length})
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-screen p-8 w-full">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-12 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Hall of Fame
          </h1>
          <p className="text-2xl text-gray-400 mb-12">
            De som klarar av att hålla vad de lovar! 🎯
          </p>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {successfulBets.map((bet, index) => {
              const isRevealed = index < revealedSuccessCount;

              return (
                <div
                  key={index}
                  className={`
                    bg-gradient-to-br from-green-900/40 to-emerald-800/40 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/50 shadow-2xl shadow-green-500/20 transition-all duration-700 transform
                    ${isRevealed 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-3xl shadow-lg flex-shrink-0
                      transition-all duration-500
                      ${isRevealed ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
                    `}>
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-2xl text-green-300 mb-2 transition-all duration-500 ${
                        isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}>
                        {bet.agentUsername}
                      </div>
                      <div className={`text-gray-300 font-medium mb-1 transition-all duration-500 delay-100 ${
                        isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}>
                        {bet.betTitle}
                      </div>
                      {bet.betDescription && (
                        <div className={`text-sm text-gray-400 italic transition-all duration-500 delay-200 ${
                          isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}>
                          {bet.betDescription}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {revealedSuccessCount === successfulBets.length && (
            <div className="mt-12 text-center animate-in fade-in duration-1000">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToFailedBets();
                }}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg text-xl font-bold shadow-2xl shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
              >
                ÅRETS DUMMSTRUTAR 😬
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Leaderboard View
  if (showLeaderboard) {
    const userScores = calculateUserScores();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white !max-w-none w-full">
        {/* Controls */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              backToBets();
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            ← Back to Bets
          </button>
        </div>

        {/* Click instruction */}
        {revealedUserCount < userScores.length && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600/90 px-6 py-3 rounded-full text-white font-medium animate-pulse">
            Click anywhere to reveal next player ({revealedUserCount}/{userScores.length})
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-screen p-8 w-full">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Vem gissa bäst?
          </h1>

          <div className="w-full max-w-4xl space-y-4">
            {userScores.map((user, index) => {
              const isRevealed = index < revealedUserCount;
              const position = userScores.length - index;
              const isWinner = position === 1;
              const isSecond = position === 2;
              const isThird = position === 3;

              return (
                <div
                  key={user.userId}
                  className={`
                    backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-700 transform
                    ${isRevealed 
                      ? 'opacity-100 scale-100 translate-y-0 shadow-2xl' 
                      : 'opacity-0 scale-90 translate-y-8 border-transparent pointer-events-none'
                    }
                    ${isWinner ? 'bg-gradient-to-r from-yellow-600/30 to-yellow-500/30 border-yellow-400 shadow-yellow-500/40' :
                      isSecond ? 'bg-gradient-to-r from-gray-400/30 to-gray-300/30 border-gray-300 shadow-gray-400/40' :
                      isThird ? 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-400 shadow-orange-500/40' :
                      'bg-gray-800/90 border-gray-600 shadow-gray-500/20'}
                  `}
                  style={{ order: userScores.length - index }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg
                        transition-all duration-500
                        ${isRevealed 
                          ? 'scale-100 rotate-0' 
                          : 'scale-0 rotate-180'
                        }
                        ${isWinner ? 'bg-yellow-500 text-gray-900' :
                          isSecond ? 'bg-gray-300 text-gray-900' :
                          isThird ? 'bg-orange-500 text-gray-900' :
                          'bg-gray-700 text-white'}
                      `}>
                        {position}
                      </div>
                      <div>
                        <div className={`font-bold text-2xl transition-all duration-500 ${
                          isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}>
                          {user.username}
                          {isWinner && ' 🏆'}
                          {isSecond && ' 🥈'}
                          {isThird && ' 🥉'}
                        </div>
                        <div className={`text-gray-400 text-sm mt-1 transition-all duration-500 delay-100 ${
                          isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}>
                          {user.correctAnswers} / {user.totalAnswers} correct
                        </div>
                      </div>
                    </div>
                    <div className={`text-right transition-all duration-500 delay-200 ${
                      isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>
                      <div className="text-4xl font-bold">
                        {user.percentage.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        accuracy
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {revealedUserCount === userScores.length && (
            <div className="mt-12 text-center animate-in fade-in duration-1000">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToSuccessfulBets();
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-xl font-bold shadow-2xl shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                View Successful Bets 🎯
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bets Presentation View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white !max-w-none w-full">
      {/* Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            previousBet();
          }}
          disabled={currentBetIndex === 0}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextBet();
          }}
          disabled={currentBetIndex === bets.length - 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextStage();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {revealStage === 'bet' ? 'Show Answers' : 
           revealStage === 'answers' ? (hasResult ? 'Show Result' : 'Complete') :
           revealStage === 'result' ? 'Complete' : 'Next Bet'}
        </button>
      </div>

      {/* Bet Counter */}
      <div className="fixed top-4 left-4 z-50 text-sm text-gray-400">
        Bet {currentBetIndex + 1} of {bets.length}
      </div>

      {/* Click instruction during answers phase */}
      {revealStage === 'answers' && revealedAnswerCount < currentBet.answers.length && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600/90 px-6 py-3 rounded-full text-white font-medium animate-pulse">
          Click anywhere to reveal next answer ({revealedAnswerCount}/{currentBet.answers.length})
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen p-8 w-full">
        {/* Bet Title - Always visible */}
        <div className={`text-center mb-12 transition-all duration-1000 w-full ${
          revealStage === 'bet' ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
        }`}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {currentBet.bet}
          </h1>
          {currentBet.description && (
            <p className="text-xl sm:text-2xl text-gray-300 mt-4">
              {currentBet.description}
            </p>
          )}
        </div>

        {/* Answers - Revealed one by one on click */}
        {revealStage !== 'bet' && (
          <div className="w-full space-y-4">
            <h2 className={`text-4xl font-bold text-center mb-8 text-yellow-400 transition-all duration-1000 ${
              revealStage === 'answers' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              Answers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentBet.answers.map((answer, index) => {
                const isRevealed = index < revealedAnswerCount;
                return (
                  <div
                    key={answer.id}
                    className={`
                      bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-700 transform
                      ${isRevealed 
                        ? 'opacity-100 scale-100 translate-y-0 shadow-2xl' 
                        : 'opacity-0 scale-90 translate-y-8 border-transparent pointer-events-none'
                      }
                      ${answer.success ? 'border-green-500 shadow-green-500/20' : 'border-red-500 shadow-red-500/20'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg
                          transition-all duration-500
                          ${isRevealed 
                            ? (answer.success ? 'bg-green-500 scale-100 rotate-0' : 'bg-red-500 scale-100 rotate-0')
                            : 'scale-0 rotate-180'
                          }
                        `}>
                          {answer.success ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className={`font-bold text-xl transition-all duration-500 ${
                            isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                          }`}>
                            {answer.user_relation?.username || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {answer.comment && (
                      <div className={`mt-4 text-gray-300 italic border-l-4 pl-4 transition-all duration-700 ${
                        isRevealed 
                          ? 'opacity-100 translate-x-0 border-gray-500' 
                          : 'opacity-0 -translate-x-4 border-transparent'
                      }`}>
                        "{answer.comment}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result - Revealed last */}
        {revealStage === 'result' && result && (
          <div className={`
            mt-12 w-full bg-gradient-to-r rounded-2xl p-12 border-4
            ${result.success ? 'from-green-600 to-emerald-600 border-green-400 shadow-2xl shadow-green-500/50' : 'from-red-600 to-rose-600 border-red-400 shadow-2xl shadow-red-500/50'}
            animate-in fade-in zoom-in duration-1000
          `}>
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {result.success ? '🎉' : '😢'}
              </div>
              <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
                {result.success ? 'SUCCESS!' : 'FAILED'}
              </h2>
              {result.description && (
                <p className="text-2xl text-white/95 font-medium">
                  {result.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Complete State */}
        {revealStage === 'complete' && (
          <div className="mt-12 text-center">
            <div className="text-4xl font-bold text-gray-300 mb-8">
              Bet Complete
            </div>
            {currentBetIndex === bets.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToLeaderboard();
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xl font-bold shadow-2xl shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                View Final Leaderboard 🏆
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}