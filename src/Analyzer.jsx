import React, { useState, useEffect, useRef } from "react";

function Pattern({ goBack }) {
  const maxCards = 5000;
  const maxBalls = 44;

  const [numCardsInput, setNumCardsInput] = useState(10);
  const [ballsCalledInput, setBallsCalledInput] = useState(25);
  const [cards, setCards] = useState([]);
  const [highlightNumbers, setHighlightNumbers] = useState([]);
  const [currentPattern, setCurrentPattern] = useState("blackout");
  const [winners, setWinners] = useState({ 
    blackout: [], 
    t: [], 
    x: [], 
    twoLines: [],
    threeLines: [],
    fourLines: [],
    fourCorners: [],
    sideToSide: [],
    emptyCross: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [targetWinPercentage, setTargetWinPercentage] = useState(98);
  const [cardWinPercentages, setCardWinPercentages] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [pinnedCards, setPinnedCards] = useState({});
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [showSavedCards, setShowSavedCards] = useState(false);
  
  // Floating panel state
  const [showFloatingPanel, setShowFloatingPanel] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inputNumber, setInputNumber] = useState("");
  const [recentCalls, setRecentCalls] = useState([]);
  const [showRecent, setShowRecent] = useState(true);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const [touchStartPos, setTouchStartPos] = useState(null);
  
  // Ball records state
  const [ballRecords, setBallRecords] = useState([]);
  const [showBallRecords, setShowBallRecords] = useState(false);
  const [ballRecordName, setBallRecordName] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Favorite numbers state
  const [favoriteNumbers, setFavoriteNumbers] = useState("");
  const [favoriteNumbersList, setFavoriteNumbersList] = useState([]);
  const [favoriteBias, setFavoriteBias] = useState(70);
  const [showFavoriteStats, setShowFavoriteStats] = useState(false);
  const [showNumberSelector, setShowNumberSelector] = useState(false);
  
  // Favorite lists state
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [showFavoriteLists, setShowFavoriteLists] = useState(false);
  const [currentListName, setCurrentListName] = useState("");
  const [editingListName, setEditingListName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Bingo results state
  const [gameResults, setGameResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentGameResult, setCurrentGameResult] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  /* ------------------ FLOATING PANEL DRAG FUNCTIONALITY (Mouse + Touch) ------------------ */
  const handleDragStart = (e) => {
    // Check if the drag handle was clicked/touched
    const target = e.target.closest('.drag-handle');
    if (target) {
      setIsDragging(true);
      
      // Get client coordinates (works for both mouse and touch)
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX && clientY && panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        setDragOffset({
          x: clientX - rect.left,
          y: clientY - rect.top
        });
      }
      
      e.preventDefault();
    }
  };

  const handleDragMove = (e) => {
    if (isDragging && panelRef.current) {
      // Get client coordinates (works for both mouse and touch)
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX && clientY) {
        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;
        
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - panelRef.current.offsetWidth;
        const maxY = window.innerHeight - panelRef.current.offsetHeight;
        
        setPanelPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
      
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTouchStartPos(null);
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  /* ------------------ FLOATING PANEL NUMBER INPUT ------------------ */
  const handleNumberInput = (e) => {
    e.preventDefault();
    const num = parseInt(inputNumber);
    if (num >= 1 && num <= 75) {
      toggleNumber(num);
      setRecentCalls(prev => [num, ...prev.filter(n => n !== num)].slice(0, 10));
      setInputNumber("");
    } else if (inputNumber !== "") {
      alert("Please enter a number between 1 and 75");
    }
  };

  const quickCallNumber = (num) => {
    toggleNumber(num);
    setRecentCalls(prev => [num, ...prev.filter(n => n !== num)].slice(0, 10));
  };

  const clearRecentCalls = () => {
    setRecentCalls([]);
  };

  /* ------------------ BALL RECORDS HANDLING ------------------ */
  const predefinedRecords = {
    "Record 1": [32, 24, 18, 12, 39, 26, 48, 17, 37, 64, 3, 68, 52, 40, 11, 28, 23, 69, 65, 4, 62, 34, 54, 56, 7, 47, 35, 61, 71, 43, 41, 70, 75, 6, 27, 22, 51, 31, 50, 29, 42, 38, 8, 14],
    "Record 2": [47, 41, 32, 56, 60, 23, 53, 62, 4, 66, 18, 12, 22, 54, 30, 28, 25, 38, 26, 65, 6, 8, 70, 3, 57, 64, 69, 19, 15, 49, 50, 11, 35, 20, 21, 45, 59, 51, 36, 31, 24, 68, 67, 75]
  };

  const saveBallRecord = () => {
    if (highlightNumbers.length === 0) {
      alert("No balls have been called yet!");
      return;
    }
    if (!ballRecordName.trim()) {
      alert("Please enter a name for this ball record");
      return;
    }
    const newRecord = {
      id: Date.now(),
      name: ballRecordName,
      balls: [...highlightNumbers],
      count: highlightNumbers.length,
      date: new Date().toLocaleString(),
      sequence: highlightNumbers.join(", ")
    };
    setBallRecords(prev => [...prev, newRecord]);
    setBallRecordName("");
    alert(`Ball record "${ballRecordName}" saved successfully!`);
  };

  const loadBallRecord = (record) => {
    setHighlightNumbers([...record.balls]);
    setSelectedRecord(record);
    setShowBallRecords(false);
    alert(`Loaded "${record.name}" with ${record.count} balls`);
  };

  const deleteBallRecord = (recordId) => {
    if (window.confirm("Are you sure you want to delete this ball record?")) {
      setBallRecords(prev => prev.filter(record => record.id !== recordId));
    }
  };

  const loadPredefinedRecord = (recordName, balls) => {
    setHighlightNumbers([...balls]);
    setSelectedRecord({ name: recordName, balls: balls, count: balls.length });
    setShowBallRecords(false);
    alert(`Loaded "${recordName}" with ${balls.length} balls`);
  };

  const exportBallRecords = () => {
    const dataStr = JSON.stringify(ballRecords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ball-records-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importBallRecords = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setBallRecords(prev => [...prev, ...imported]);
          alert(`Imported ${imported.length} ball records successfully!`);
        } else {
          alert("Invalid file format");
        }
      } catch (error) {
        alert("Error importing file");
      }
    };
    reader.readAsText(file);
  };

  const clearBallRecord = () => {
    if (window.confirm("Clear all called balls?")) {
      setHighlightNumbers([]);
      setSelectedRecord(null);
      setRecentCalls([]);
    }
  };

  /* ------------------ FAVORITE NUMBERS HANDLING ------------------ */
  const parseFavoriteNumbers = () => {
    const numbers = favoriteNumbers
      .split(/[,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 75);
    const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
    setFavoriteNumbersList(uniqueNumbers);
    setShowFavoriteStats(true);
    setFavoriteNumbers(uniqueNumbers.join(", "));
    return uniqueNumbers;
  };

  const toggleFavoriteNumber = (num) => {
    let newList;
    if (favoriteNumbersList.includes(num)) {
      newList = favoriteNumbersList.filter(n => n !== num);
    } else {
      newList = [...favoriteNumbersList, num].sort((a, b) => a - b);
    }
    setFavoriteNumbersList(newList);
    setFavoriteNumbers(newList.join(", "));
    if (newList.length > 0) setShowFavoriteStats(true);
  };

  const addRangeFavorite = (start, end) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const newList = [...new Set([...favoriteNumbersList, ...range])].sort((a, b) => a - b);
    setFavoriteNumbersList(newList);
    setFavoriteNumbers(newList.join(", "));
    setShowFavoriteStats(true);
  };

  const clearFavorites = () => {
    if (window.confirm("Clear all favorite numbers?")) {
      setFavoriteNumbersList([]);
      setFavoriteNumbers("");
      setShowFavoriteStats(false);
    }
  };

  const selectAllInColumn = (column) => {
    let start, end;
    switch(column) {
      case 'B': start = 1; end = 15; break;
      case 'I': start = 16; end = 30; break;
      case 'N': start = 31; end = 45; break;
      case 'G': start = 46; end = 60; break;
      case 'O': start = 61; end = 75; break;
      default: return;
    }
    addRangeFavorite(start, end);
  };

  const saveCurrentList = () => {
    if (favoriteNumbersList.length === 0) {
      alert("No favorite numbers to save!");
      return;
    }
    if (!currentListName.trim()) {
      alert("Please enter a name for this list");
      return;
    }
    const newList = {
      id: Date.now(),
      name: currentListName,
      numbers: [...favoriteNumbersList],
      count: favoriteNumbersList.length,
      date: new Date().toLocaleString()
    };
    setFavoriteLists(prev => [...prev, newList]);
    setCurrentListName("");
    alert(`List "${currentListName}" saved successfully!`);
  };

  const loadFavoriteList = (list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  };

  const deleteFavoriteList = (listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setFavoriteLists(prev => prev.filter(list => list.id !== listId));
    }
  };

  const updateListName = (listId, newName) => {
    setFavoriteLists(prev => prev.map(list => 
      list.id === listId ? { ...list, name: newName } : list
    ));
    setEditingListName(null);
  };

  const exportFavoriteLists = () => {
    const dataStr = JSON.stringify(favoriteLists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `favorite-lists-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFavoriteLists = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setFavoriteLists(prev => [...prev, ...imported]);
          alert(`Imported ${imported.length} lists successfully!`);
        } else {
          alert("Invalid file format");
        }
      } catch (error) {
        alert("Error importing file");
      }
    };
    reader.readAsText(file);
  };

  const getPredefinedLists = () => {
    return [
      { id: 'popular', name: '🎲 Most Popular Numbers', numbers: [7, 11, 21, 34, 42, 50, 67, 69, 75], description: 'Commonly chosen numbers' },
      { id: 'corners', name: '⬛ Corner Numbers', numbers: [1, 15, 16, 30, 31, 45, 46, 60, 61, 75], description: 'Numbers at the edges' },
      { id: 'center', name: '🎯 Center Column', numbers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], description: 'All N column numbers' },
      { id: 'lucky', name: '🍀 Lucky Sevens', numbers: [7, 17, 27, 37, 47, 57, 67], description: 'Numbers ending with 7' },
      { id: 'decades', name: '📊 Decade Numbers', numbers: [10, 20, 30, 40, 50, 60, 70], description: 'Round numbers by decade' },
      { id: 'bingo', name: '🔤 B-I-N-G-O', numbers: [2, 9, 16, 23, 30, 37, 44, 51, 58, 65, 72], description: 'Numbers that spell BINGO' }
    ];
  };

  const getFilteredNumbers = () => {
    if (!searchTerm) return Array.from({ length: 75 }, (_, i) => i + 1);
    const term = searchTerm.toLowerCase();
    return Array.from({ length: 75 }, (_, i) => i + 1).filter(num => {
      return num.toString().includes(term) || 
             getColumnForNumber(num).toLowerCase().includes(term) ||
             (term === 'even' && num % 2 === 0) ||
             (term === 'odd' && num % 2 === 1) ||
             (term === 'prime' && isPrime(num));
    });
  };

  const getFavoriteStats = () => {
    const stats = { total: favoriteNumbersList.length, byColumn: { B: 0, I: 0, N: 0, G: 0, O: 0 }, even: 0, odd: 0, prime: 0 };
    favoriteNumbersList.forEach(num => {
      const col = getColumnForNumber(num);
      stats.byColumn[col]++;
      if (num % 2 === 0) stats.even++;
      else stats.odd++;
      if (isPrime(num)) stats.prime++;
    });
    return stats;
  };

  /* ------------------ BINGO RESULTS RECORDING ------------------ */
  const recordBingoResult = () => {
    if (cards.length === 0) {
      alert("Please generate cards first!");
      return;
    }
    const patternWinners = winners[currentPattern] || [];
    if (patternWinners.length === 0) {
      alert(`No winners yet for the ${currentPattern} pattern!`);
      return;
    }
    const result = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      pattern: currentPattern,
      patternIcon: getPatternIcon(currentPattern),
      patternName: getPatternName(currentPattern),
      ballsDrawn: [...highlightNumbers].sort((a, b) => a - b),
      ballsDrawnCount: highlightNumbers.length,
      totalCards: cards.length,
      winners: patternWinners.map(idx => ({
        cardIndex: idx,
        serial: formatSerial(idx),
        card: cards[idx],
        winPercentage: cardWinPercentages[idx],
        winningPatterns: checkAllPatterns(cards[idx])
      })),
      winnerCount: patternWinners.length,
      gameDuration: calculateGameDuration(),
      notes: ""
    };
    setGameResults(prev => [...prev, result]);
    setGameHistory(prev => [{
      id: result.id,
      timestamp: result.timestamp,
      pattern: result.pattern,
      patternIcon: result.patternIcon,
      winnerCount: result.winnerCount,
      ballsDrawn: result.ballsDrawnCount
    }, ...prev]);
    setCurrentGameResult(result);
    setShowResults(true);
  };

  const getPatternIcon = (patternId) => {
    const icons = { blackout: "⬛", t: "📐", x: "❌", twoLines: "📏", threeLines: "📊", fourLines: "📈", fourCorners: "🔲", sideToSide: "⬆️⬇️", emptyCross: "✖️" };
    return icons[patternId] || "🎯";
  };

  const getPatternName = (patternId) => {
    const names = { blackout: "Blackout", t: "T Pattern", x: "X Pattern", twoLines: "2 Lines", threeLines: "3 Lines", fourLines: "4 Lines", fourCorners: "4 Corners", sideToSide: "Side to Side", emptyCross: "Empty Cross" };
    return names[patternId] || patternId;
  };

  const calculateGameDuration = () => "N/A";

  const saveGameResult = (resultId, notes) => {
    setGameResults(prev => prev.map(result => result.id === resultId ? { ...result, notes, saved: true } : result));
    alert("Game result saved successfully!");
  };

  const deleteGameResult = (resultId) => {
    if (window.confirm("Are you sure you want to delete this game result?")) {
      setGameResults(prev => prev.filter(r => r.id !== resultId));
      setGameHistory(prev => prev.filter(h => h.id !== resultId));
      if (currentGameResult?.id === resultId) {
        setCurrentGameResult(null);
        setShowResults(false);
      }
      alert("Game result deleted.");
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(gameResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `bingo-results-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const calculateStatistics = () => {
    if (gameResults.length === 0) return null;
    const stats = {
      totalGames: gameResults.length,
      averageBallsToWin: Math.round(gameResults.reduce((acc, r) => acc + r.ballsDrawnCount, 0) / gameResults.length),
      mostWinningPattern: getMostFrequentPattern(),
      patternStats: {},
      averageWinnersPerGame: (gameResults.reduce((acc, r) => acc + r.winnerCount, 0) / gameResults.length).toFixed(1)
    };
    gameResults.forEach(result => {
      if (!stats.patternStats[result.pattern]) {
        stats.patternStats[result.pattern] = { count: 0, totalWinners: 0, icon: result.patternIcon, name: result.patternName };
      }
      stats.patternStats[result.pattern].count++;
      stats.patternStats[result.pattern].totalWinners += result.winnerCount;
    });
    return stats;
  };

  const getMostFrequentPattern = () => {
    const patternCounts = {};
    gameResults.forEach(r => patternCounts[r.pattern] = (patternCounts[r.pattern] || 0) + 1);
    let maxCount = 0, mostFrequent = null;
    Object.entries(patternCounts).forEach(([pattern, count]) => {
      if (count > maxCount) { maxCount = count; mostFrequent = pattern; }
    });
    return mostFrequent ? getPatternName(mostFrequent) : "N/A";
  };

  /* ------------------ WINNING PERCENTAGE CALCULATION ------------------ */
  const calculateWinPercentage = (card, pattern) => {
    const totalNumbers = card.flat().filter(n => n !== "FREE").length;
    let numbersNeeded = 0;
    switch(pattern) {
      case "blackout": numbersNeeded = totalNumbers; break;
      case "t": numbersNeeded = 9; break;
      case "x": numbersNeeded = 9; break;
      case "twoLines": numbersNeeded = 10; break;
      case "threeLines": numbersNeeded = 15; break;
      case "fourLines": numbersNeeded = 20; break;
      case "fourCorners": numbersNeeded = 4; break;
      case "sideToSide": numbersNeeded = 20; break;
      case "emptyCross": numbersNeeded = 16; break;
      default: numbersNeeded = totalNumbers;
    }
    const cardNumbers = card.flat().filter(n => n !== "FREE");
    const matchedNumbers = cardNumbers.filter(n => highlightNumbers.includes(n)).length;
    const percentage = (matchedNumbers / numbersNeeded) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  /* ------------------ CHECK ALL PATTERNS FOR A CARD ------------------ */
  const checkAllPatterns = (card) => {
    const patterns = [];
    if (checkBlackout(card)) patterns.push({ id: "blackout", name: "Blackout", icon: "⬛" });
    if (checkTPattern(card)) patterns.push({ id: "t", name: "T Pattern", icon: "📐" });
    if (checkXPattern(card)) patterns.push({ id: "x", name: "X Pattern", icon: "❌" });
    if (checkTwoLines(card)) patterns.push({ id: "twoLines", name: "2 Lines", icon: "📏" });
    if (checkThreeLines(card)) patterns.push({ id: "threeLines", name: "3 Lines", icon: "📊" });
    if (checkFourLines(card)) patterns.push({ id: "fourLines", name: "4 Lines", icon: "📈" });
    if (checkFourCorners(card)) patterns.push({ id: "fourCorners", name: "4 Corners", icon: "🔲" });
    if (checkSideToSide(card)) patterns.push({ id: "sideToSide", name: "Side to Side", icon: "⬆️⬇️" });
    if (checkEmptyCross(card)) patterns.push({ id: "emptyCross", name: "Empty Cross", icon: "✖️" });
    return patterns;
  };

  /* ------------------ CARD GENERATION ------------------ */
  const generateCardWithFavoriteNumbers = (useFavorites = true) => {
    const card = [];
    const usedNumbers = new Set();
    const favorites = useFavorites && favoriteNumbersList.length > 0 ? favoriteNumbersList : [];
    for (let col = 0; col < 5; col++) {
      const colNumbers = [];
      const start = col * 15 + 1;
      let colPool = Array.from({ length: 15 }, (_, i) => start + i);
      colPool = colPool.filter(n => !usedNumbers.has(n));
      const favoritesInCol = colPool.filter(n => favorites.includes(n));
      const nonFavoritesInCol = colPool.filter(n => !favorites.includes(n));
      while (colNumbers.length < 5 && (favoritesInCol.length > 0 || nonFavoritesInCol.length > 0)) {
        let num;
        if (favoritesInCol.length > 0 && Math.random() * 100 < favoriteBias) {
          const randomIndex = Math.floor(Math.random() * favoritesInCol.length);
          num = favoritesInCol[randomIndex];
          favoritesInCol.splice(randomIndex, 1);
        } else if (nonFavoritesInCol.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonFavoritesInCol.length);
          num = nonFavoritesInCol[randomIndex];
          nonFavoritesInCol.splice(randomIndex, 1);
        } else if (favoritesInCol.length > 0) {
          const randomIndex = Math.floor(Math.random() * favoritesInCol.length);
          num = favoritesInCol[randomIndex];
          favoritesInCol.splice(randomIndex, 1);
        } else break;
        colNumbers.push(num);
        usedNumbers.add(num);
      }
      colNumbers.sort((a, b) => a - b);
      card.push(colNumbers);
    }
    card[2][2] = "FREE";
    return card;
  };

  const generateCardWithTargetPercentage = (targetPercentage, useFavorites = true) => {
    let bestCard = null;
    let bestPercentage = 0;
    const attempts = 100;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const card = generateCardWithFavoriteNumbers(useFavorites);
      const percentage = calculateWinPercentage(card, currentPattern);
      if (Math.abs(percentage - targetPercentage) < Math.abs(bestPercentage - targetPercentage)) {
        bestCard = card;
        bestPercentage = percentage;
      }
      if (Math.abs(percentage - targetPercentage) <= 5) break;
    }
    return bestCard || generateCardWithFavoriteNumbers(useFavorites);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const count = Math.min(Math.max(numCardsInput, 1), maxCards);
    if (favoriteNumbers.trim() !== "") parseFavoriteNumbers();
    setTimeout(() => {
      const newCards = [];
      const percentages = [];
      const favoriteStats = { totalFavoriteNumbers: 0, cardsWithFavorites: 0 };
      for (let i = 0; i < count; i++) {
        const useFavorites = favoriteNumbersList.length > 0 && (i % 3 !== 0);
        const card = generateCardWithTargetPercentage(targetWinPercentage, useFavorites);
        newCards.push(card);
        if (favoriteNumbersList.length > 0) {
          const cardNumbers = card.flat().filter(n => n !== "FREE");
          const favoriteCount = cardNumbers.filter(n => favoriteNumbersList.includes(n)).length;
          favoriteStats.totalFavoriteNumbers += favoriteCount;
          if (favoriteCount > 0) favoriteStats.cardsWithFavorites++;
        }
        const percentage = calculateWinPercentage(card, currentPattern);
        percentages.push(percentage);
      }
      setCards(newCards);
      setCardWinPercentages(percentages);
      setHighlightNumbers([]);
      setFlippedCards({});
      setPinnedCards({});
      setWinners({ blackout: [], t: [], x: [], twoLines: [], threeLines: [], fourLines: [], fourCorners: [], sideToSide: [], emptyCross: [] });
      if (favoriteNumbersList.length > 0) {
        alert(`✅ Generated ${count} cards with favorite numbers!\n📊 Stats:\n- Favorite numbers: ${favoriteNumbersList.join(", ")}\n- Average favorites per card: ${(favoriteStats.totalFavoriteNumbers / count).toFixed(1)}\n- Cards with at least one favorite: ${favoriteStats.cardsWithFavorites}/${count}`);
      }
      setIsGenerating(false);
    }, 500);
  };

  const handleNewRound = () => {
    setHighlightNumbers([]);
    setFlippedCards({});
    setWinners({ blackout: [], t: [], x: [], twoLines: [], threeLines: [], fourLines: [], fourCorners: [], sideToSide: [], emptyCross: [] });
    setRecentCalls([]);
    alert("🎯 New round started! All called numbers have been cleared.");
  };

  const handleReset = () => {
    setHighlightNumbers([]);
    setFlippedCards({});
    setWinners({ blackout: [], t: [], x: [], twoLines: [], threeLines: [], fourLines: [], fourCorners: [], sideToSide: [], emptyCross: [] });
    setRecentCalls([]);
  };

  /* ------------------ CARD ACTIONS ------------------ */
  const togglePin = (cardIndex, e) => { e.stopPropagation(); setPinnedCards(prev => ({ ...prev, [cardIndex]: !prev[cardIndex] })); };
  const deleteCard = (cardIndex, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete card ${formatSerial(cardIndex)}?`)) {
      const newCards = cards.filter((_, idx) => idx !== cardIndex);
      const newPercentages = cardWinPercentages.filter((_, idx) => idx !== cardIndex);
      const newPinned = {};
      const newFlipped = {};
      Object.keys(pinnedCards).forEach(key => { const numKey = parseInt(key); if (numKey < cardIndex) newPinned[numKey] = pinnedCards[numKey]; else if (numKey > cardIndex) newPinned[numKey - 1] = pinnedCards[numKey]; });
      Object.keys(flippedCards).forEach(key => { const numKey = parseInt(key); if (numKey < cardIndex) newFlipped[numKey] = flippedCards[numKey]; else if (numKey > cardIndex) newFlipped[numKey - 1] = flippedCards[numKey]; });
      setCards(newCards);
      setCardWinPercentages(newPercentages);
      setPinnedCards(newPinned);
      setFlippedCards(newFlipped);
    }
  };
  const startEdit = (card, idx, e) => { e.stopPropagation(); setEditingCard(idx); setEditFormData(JSON.parse(JSON.stringify(card))); };
  const cancelEdit = (e) => { e.stopPropagation(); setEditingCard(null); setEditFormData(null); };
  const saveEdit = (idx, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    const newCards = [...cards];
    newCards[idx] = editFormData;
    const newPercentages = [...cardWinPercentages];
    newPercentages[idx] = calculateWinPercentage(editFormData, currentPattern);
    setCards(newCards);
    setCardWinPercentages(newPercentages);
    setEditingCard(null);
    setEditFormData(null);
    alert(`Card ${formatSerial(idx)} saved successfully!`);
  };
  const updateCell = (col, row, value, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    const newCard = [...editFormData];
    newCard[col] = [...newCard[col]];
    newCard[col][row] = value === "FREE" ? "FREE" : parseInt(value) || newCard[col][row];
    setEditFormData(newCard);
  };
  const saveCard = (card, idx, e) => {
    e.stopPropagation();
    const savedCard = { id: Date.now() + idx, card: JSON.parse(JSON.stringify(card)), serial: formatSerial(idx), date: new Date().toLocaleString(), patterns: checkAllPatterns(card) };
    setSavedCards(prev => [...prev, savedCard]);
    alert(`Card ${formatSerial(idx)} saved to collection!`);
  };
  const loadSavedCard = (savedCard) => {
    const newCards = [...cards, savedCard.card];
    const newPercentages = [...cardWinPercentages, calculateWinPercentage(savedCard.card, currentPattern)];
    setCards(newCards);
    setCardWinPercentages(newPercentages);
    setShowSavedCards(false);
  };
  const deleteSavedCard = (savedCardId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved card?")) {
      setSavedCards(prev => prev.filter(card => card.id !== savedCardId));
    }
  };
  const toggleNumber = (num) => {
    setHighlightNumbers((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length >= maxBalls) {
        alert(`Maximum ${maxBalls} balls reached`);
        return prev;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  };
  const selectRandomBall = () => {
    const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !highlightNumbers.includes(n));
    if (available.length === 0) { alert("All balls have been drawn!"); return; }
    const randomBall = available[Math.floor(Math.random() * available.length)];
    toggleNumber(randomBall);
    setRecentCalls(prev => [randomBall, ...prev.filter(n => n !== randomBall)].slice(0, 10));
  };
  const toggleCardFlip = (cardIndex) => { if (editingCard !== cardIndex) setFlippedCards(prev => ({ ...prev, [cardIndex]: !prev[cardIndex] })); };

  /* ------------------ PATTERN CHECKS ------------------ */
  const checkBlackout = (card) => card.flat().filter((n) => n !== "FREE").every((n) => highlightNumbers.includes(n));
  const checkTPattern = (card) => { const topRow = card.map((col) => col[0]); const middleCol = card[2].filter((n) => n !== "FREE"); return [...topRow, ...middleCol].every((n) => highlightNumbers.includes(n)); };
  const checkXPattern = (card) => { let diag1 = true, diag2 = true; for (let i = 0; i < 5; i++) { const a = card[i][i]; const b = card[i][4 - i]; if (a !== "FREE" && !highlightNumbers.includes(a)) diag1 = false; if (b !== "FREE" && !highlightNumbers.includes(b)) diag2 = false; } return diag1 && diag2; };
  const checkTwoLines = (card) => { let rows = 0; for (let r = 0; r < 5; r++) { let complete = true; for (let c = 0; c < 5; c++) { const num = card[c][r]; if (num !== "FREE" && !highlightNumbers.includes(num)) { complete = false; break; } } if (complete) rows++; } return rows >= 2; };
  const checkThreeLines = (card) => { let rows = 0; for (let r = 0; r < 5; r++) { let complete = true; for (let c = 0; c < 5; c++) { const num = card[c][r]; if (num !== "FREE" && !highlightNumbers.includes(num)) { complete = false; break; } } if (complete) rows++; } return rows >= 3; };
  const checkFourLines = (card) => { let rows = 0; for (let r = 0; r < 5; r++) { let complete = true; for (let c = 0; c < 5; c++) { const num = card[c][r]; if (num !== "FREE" && !highlightNumbers.includes(num)) { complete = false; break; } } if (complete) rows++; } return rows >= 4; };
  const checkFourCorners = (card) => { const corners = [card[0][0], card[4][0], card[0][4], card[4][4]]; return corners.every(num => num !== "FREE" && highlightNumbers.includes(num)); };
  const checkSideToSide = (card) => { let columns = 0; for (let c = 0; c < 5; c++) { if (c === 2) continue; let complete = true; for (let r = 0; r < 5; r++) { const num = card[c][r]; if (num !== "FREE" && !highlightNumbers.includes(num)) { complete = false; break; } } if (complete) columns++; } return columns >= 4; };
  const checkEmptyCross = (card) => { for (let r = 0; r < 5; r++) { for (let c = 0; c < 5; c++) { const num = card[c][r]; if (num === "FREE") continue; if (r === 2 || c === 2) continue; if (!highlightNumbers.includes(num)) return false; } } return true; };

  useEffect(() => {
    if (!cards.length) return;
    const newWinners = { blackout: [], t: [], x: [], twoLines: [], threeLines: [], fourLines: [], fourCorners: [], sideToSide: [], emptyCross: [] };
    cards.forEach((card, i) => {
      if (checkBlackout(card)) newWinners.blackout.push(i);
      if (checkTPattern(card)) newWinners.t.push(i);
      if (checkXPattern(card)) newWinners.x.push(i);
      if (checkTwoLines(card)) newWinners.twoLines.push(i);
      if (checkThreeLines(card)) newWinners.threeLines.push(i);
      if (checkFourLines(card)) newWinners.fourLines.push(i);
      if (checkFourCorners(card)) newWinners.fourCorners.push(i);
      if (checkSideToSide(card)) newWinners.sideToSide.push(i);
      if (checkEmptyCross(card)) newWinners.emptyCross.push(i);
    });
    setWinners(newWinners);
  }, [highlightNumbers, cards]);

  const getCardScore = (card) => card.flat().filter((n) => n !== "FREE" && !highlightNumbers.includes(n)).length;
  const rankedCards = cards.map((card, idx) => ({
    card, idx,
    isWinner: winners[currentPattern].includes(idx),
    score: getCardScore(card),
    progress: ((25 - getCardScore(card)) / 24) * 100,
    winPercentage: cardWinPercentages[idx] || 0,
    winningPatterns: checkAllPatterns(card),
    isPinned: pinnedCards[idx] || false,
    favoriteCount: favoriteNumbersList.length > 0 ? card.flat().filter(n => n !== "FREE" && favoriteNumbersList.includes(n)).length : 0
  })).sort((a, b) => { if (a.isPinned && !b.isPinned) return -1; if (!a.isPinned && b.isPinned) return 1; if (a.isWinner && !b.isWinner) return -1; if (!a.isWinner && b.isWinner) return 1; return a.score - b.score; });

  const formatSerial = (i) => `#${String(i + 1).padStart(3, "0")}`;
  const topWinner = rankedCards[0];
  const stats = calculateStatistics();
  const favoriteStats = getFavoriteStats();
  const filteredNumbers = getFilteredNumbers();
  const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  };

  const getColumnForNumber = (num) => {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  };

  const ballStats = {
    total: highlightNumbers.length,
    remaining: 44 - highlightNumbers.length,
    percentage: (highlightNumbers.length / 44) * 100,
    byColumn: { B: 0, I: 0, N: 0, G: 0, O: 0 },
    even: 0,
    odd: 0,
    prime: 0
  };
  
  highlightNumbers.forEach(num => {
    if (num <= 15) ballStats.byColumn.B++;
    else if (num <= 30) ballStats.byColumn.I++;
    else if (num <= 45) ballStats.byColumn.N++;
    else if (num <= 60) ballStats.byColumn.G++;
    else ballStats.byColumn.O++;
    if (num % 2 === 0) ballStats.even++;
    else ballStats.odd++;
    if (isPrime(num)) ballStats.prime++;
  });

  // Styles (with mobile touch optimizations)
  const styles = {
    container: { minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    header: { background: "rgba(255, 255, 255, 0.95)", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", position: "sticky", top: 0, zIndex: 100 },
    headerContent: { maxWidth: "1400px", margin: "0 auto", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" },
    title: { margin: 0, fontSize: "clamp(1.2rem, 5vw, 1.8rem)", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    headerButtons: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
    backButton: { padding: "0.5rem 1rem", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease" },
    savedButton: { padding: "0.5rem 1rem", background: "#ffd700", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease" },
    resultsButton: { padding: "0.5rem 1rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease" },
    historyButton: { padding: "0.5rem 1rem", background: "#2196F3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease" },
    ballRecordsButton: { padding: "0.5rem 1rem", background: "#FF5722", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease" },
    floatingPanelToggle: { padding: "0.5rem 1rem", background: "#9C27B0", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease" },
    main: { maxWidth: "1400px", margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" },
    floatingPanel: {
      position: "fixed",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      zIndex: 1000,
      minWidth: "clamp(260px, 80vw, 320px)",
      cursor: "default",
      touchAction: "none" // Prevents scrolling while dragging on mobile
    },
    dragHandle: {
      padding: "12px 16px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      borderRadius: "16px 16px 0 0",
      cursor: "grab",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      userSelect: "none",
      touchAction: "none"
    },
    panelContent: { padding: "16px" },
    numberInput: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px"
    },
    input: {
      flex: 1,
      padding: "12px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "16px",
      WebkitAppearance: "none" // Removes default styling on iOS
    },
    callButton: {
      padding: "12px 20px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px"
    },
    quickButtons: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "8px",
      marginBottom: "16px"
    },
    quickButton: {
      padding: "10px 4px",
      background: "#f0f0f0",
      border: "1px solid #ddd",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "clamp(12px, 3vw, 14px)",
      fontWeight: "bold",
      transition: "all 0.2s ease"
    },
    recentSection: {
      marginTop: "12px",
      borderTop: "1px solid #e0e0e0",
      paddingTop: "12px"
    },
    recentTitle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
      fontSize: "12px",
      color: "#666"
    },
    recentNumbers: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px"
    },
    recentNumber: {
      padding: "6px 12px",
      background: "#ffeb3b",
      borderRadius: "20px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.2s ease"
    },
    statusBadge: {
      display: "inline-block",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      marginRight: "6px"
    },
    patternSelector: { display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center" },
    patternButton: (isActive) => ({ display: "flex", alignItems: "center", gap: "0.5rem", padding: "clamp(0.5rem, 3vw, 1rem) clamp(1rem, 4vw, 2rem)", border: "none", borderRadius: "12px", background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", color: isActive ? "white" : "black", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", cursor: "pointer", fontSize: "clamp(0.8rem, 3vw, 1rem)", transition: "all 0.3s ease", position: "relative" }),
    controlsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" },
    controlCard: { background: "white", borderRadius: "16px", padding: "clamp(1rem, 3vw, 1.5rem)", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    inputGroup: { marginBottom: "1rem" },
    label: { display: "block", marginBottom: "0.5rem", color: "#666", fontSize: "0.9rem", fontWeight: "500" },
    textarea: { width: "100%", padding: "0.5rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem", minHeight: "80px", boxSizing: "border-box", fontFamily: "inherit" },
    favoriteNumbersContainer: { marginTop: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "12px", border: "2px solid #ffd700" },
    favoriteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", cursor: "pointer" },
    favoriteTitle: { margin: 0, fontSize: "1rem", color: "#333" },
    toggleButton: { padding: "0.25rem 0.5rem", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
    columnSelector: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" },
    columnButton: { flex: 1, padding: "0.5rem", background: "#e0e0e0", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", minWidth: "40px" },
    searchInput: { width: "100%", padding: "0.5rem", marginBottom: "0.5rem", border: "2px solid #e0e0e0", borderRadius: "4px", fontSize: "0.9rem" },
    numberSelectorGrid: { display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "0.25rem", marginTop: "0.5rem", marginBottom: "0.5rem", maxHeight: "200px", overflowY: "auto", padding: "0.5rem", background: "white", borderRadius: "8px", border: "1px solid #e0e0e0" },
    numberButton: (isSelected) => ({ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: isSelected ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f0f0f0", color: isSelected ? "white" : "#333", border: isSelected ? "none" : "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: isSelected ? "bold" : "normal", transition: "all 0.2s ease" }),
    favoriteStats: { marginTop: "0.5rem", padding: "0.5rem", background: "#e8f4fd", borderRadius: "8px", fontSize: "0.9rem" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginTop: "0.5rem" },
    statItem: { background: "white", padding: "0.5rem", borderRadius: "4px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    favoriteListsSection: { marginTop: "1rem", padding: "0.5rem", background: "#fff3e0", borderRadius: "8px" },
    listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "white", borderRadius: "4px", marginBottom: "0.5rem", cursor: "pointer", border: "1px solid #e0e0e0" },
    listName: { fontWeight: "bold", fontSize: "0.95rem" },
    listDetails: { fontSize: "0.8rem", color: "#666" },
    listActions: { display: "flex", gap: "0.25rem" },
    smallButton: { padding: "0.25rem 0.5rem", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
    generateButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontSize: "1rem", cursor: "pointer", transition: "all 0.3s ease", marginTop: "0.5rem" },
    randomBallButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#4CAF50", color: "white", fontSize: "1rem", cursor: "pointer", marginBottom: "0.5rem" },
    newRoundButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#ff9800", color: "white", fontSize: "1rem", cursor: "pointer", marginBottom: "0.5rem", transition: "all 0.3s ease", fontWeight: "bold" },
    recordResultButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#9C27B0", color: "white", fontSize: "1rem", cursor: "pointer", marginBottom: "0.5rem", transition: "all 0.3s ease", fontWeight: "bold" },
    resetButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#ff4757", color: "white", fontSize: "1rem", cursor: "pointer" },
    ballsSection: { background: "white", borderRadius: "16px", padding: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "2rem", overflowX: "auto" },
    ballsGrid: { display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "0.5rem", minWidth: "500px" },
    ball: (active) => ({ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: active ? "#ffeb3b" : "white", border: active ? "2px solid #fbc02d" : "2px solid #e0e0e0", borderRadius: "50%", cursor: "pointer", transition: "all 0.3s ease", fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: "bold" }),
    favoriteBall: { border: "2px solid #ffd700", boxShadow: "0 0 10px rgba(255,215,0,0.5)" },
    cardsContainer: { display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: "1.5rem" },
    cardContainer: { perspective: "1000px", height: "auto", cursor: "pointer", position: "relative" },
    cardInner: (isFlipped) => ({ position: "relative", width: "100%", height: "100%", transition: "transform 0.6s", transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }),
    cardFront: { position: "relative", width: "100%", height: "100%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" },
    cardBack: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", padding: "1rem", boxSizing: "border-box", display: "flex", flexDirection: "column", border: "2px solid #ffd700", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
    bingoCard: (isWinner, isPinned, hasFavorites) => ({ background: "white", border: isWinner ? "3px solid #ff4757" : isPinned ? "3px solid #ffd700" : hasFavorites ? "2px solid #4CAF50" : "2px solid #e0e0e0", borderRadius: "12px", padding: "1rem", transition: "all 0.3s ease", width: "100%", height: "100%", boxSizing: "border-box" }),
    bingoGrid: { display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.5rem" },
    bingoRow: { display: "flex", justifyContent: "space-around" },
    bingoCell: (isHighlighted, isFree, isFavorite) => ({ width: "clamp(30px, 8vw, 35px)", height: "clamp(30px, 8vw, 35px)", display: "flex", alignItems: "center", justifyContent: "center", border: isFavorite ? "2px solid #ffd700" : "1px solid #e0e0e0", borderRadius: "4px", background: isHighlighted ? "#ffeb3b" : isFree ? "#f0f0f0" : "white", fontWeight: isHighlighted ? "bold" : "normal", fontSize: isFree ? "1.2rem" : "clamp(10px, 3vw, 12px)", cursor: "default", position: "relative" }),
    favoriteStar: { position: "absolute", top: "-5px", right: "-5px", fontSize: "0.6rem", color: "#ffd700" },
    editInput: { width: "30px", height: "30px", textAlign: "center", border: "2px solid #667eea", borderRadius: "4px", fontSize: "0.9rem", outline: "none" },
    cardActions: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", gap: "0.5rem", zIndex: 20, background: "rgba(255, 255, 255, 0.95)", padding: "0.75rem 1rem", borderRadius: "40px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", border: "2px solid #667eea", opacity: 0, transition: "opacity 0.3s ease", pointerEvents: "none" },
    actionButton: { width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", transition: "all 0.2s ease", pointerEvents: "auto" },
    pinButton: (isPinned) => ({ background: isPinned ? "#ffd700" : "white", color: isPinned ? "white" : "#333", border: isPinned ? "2px solid #ffd700" : "2px solid #e0e0e0" }),
    editButton: { background: "#667eea", color: "white", border: "2px solid #667eea" },
    deleteButton: { background: "#ff4757", color: "white", border: "2px solid #ff4757" },
    saveButton: { background: "#4CAF50", color: "white", border: "2px solid #4CAF50" },
    cancelButton: { background: "#999", color: "white", border: "2px solid #999" },
    flipHint: { position: "absolute", bottom: "5px", right: "5px", fontSize: "0.7rem", color: "#999", background: "rgba(255,255,255,0.8)", padding: "2px 5px", borderRadius: "10px", zIndex: 10 },
    patternsList: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", overflowY: "auto", maxHeight: "250px", padding: "0.5rem" },
    patternItem: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", background: "white", borderRadius: "8px", fontSize: "0.9rem", borderLeft: "4px solid #ffd700", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", transition: "transform 0.2s ease", cursor: "pointer" },
    backHeader: { textAlign: "center", marginBottom: "1rem", fontWeight: "bold", color: "white", fontSize: "1.1rem", borderBottom: "2px solid #ffd700", paddingBottom: "0.5rem" },
    noPatterns: { textAlign: "center", color: "rgba(255,255,255,0.7)", fontStyle: "italic", padding: "2rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" },
    cardNumber: { position: "absolute", top: "5px", left: "5px", fontSize: "0.8rem", color: "white", background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "10px", zIndex: 20 },
    patternCount: { background: "#ffd700", color: "#333", borderRadius: "12px", padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold", marginLeft: "auto" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalContent: { background: "white", borderRadius: "16px", padding: "clamp(1rem, 5vw, 2rem)", maxWidth: "800px", width: "90%", maxHeight: "80vh", overflowY: "auto" },
    savedCardsModal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    savedCardsContent: { background: "white", borderRadius: "16px", padding: "clamp(1rem, 5vw, 2rem)", maxWidth: "800px", width: "90%", maxHeight: "80vh", overflowY: "auto" },
    savedCardItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer", transition: "background 0.2s ease" },
    savedCardInfo: { flex: 1 },
    savedCardDate: { fontSize: "0.8rem", color: "#999" },
    savedCardPatterns: { display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.3rem" },
    savedCardPatternTag: { background: "#667eea", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.7rem" },
    closeButton: { padding: "0.5rem 1rem", background: "#ff4757", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "1rem" },
    exportButton: { padding: "0.5rem 1rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginLeft: "0.5rem" },
    resultItem: { padding: "1rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer" },
    resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" },
    winnerBadge: { background: "#ff4757", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" },
    noteInput: { width: "100%", padding: "0.5rem", border: "1px solid #e0e0e0", borderRadius: "8px", marginTop: "0.5rem", marginBottom: "0.5rem" },
    statsContainer: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "1.5rem", borderRadius: "16px", marginBottom: "1rem", color: "white" },
    statsGridMain: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" },
    statBox: { background: "rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "12px", textAlign: "center" },
    historyItem: { padding: "1rem", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", flexWrap: "wrap", gap: "0.5rem" },
    historyPattern: { display: "flex", alignItems: "center", gap: "0.5rem" },
    ballRecordItem: { padding: "1rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer" },
    ballRecordHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" },
    ballRecordName: { fontWeight: "bold", fontSize: "1.1rem" },
    ballRecordCount: { background: "#667eea", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" },
    ballRecordSequence: { color: "#666", fontSize: "0.85rem", marginTop: "0.25rem", wordBreak: "break-all" }
  };

  // Add keyframes animation and hover styles
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes winnerGlow { 0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); } 50% { box-shadow: 0 0 20px 0 rgba(255, 71, 87, 0.4); } 100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); } }
    .card-container:hover .card-actions { opacity: 1 !important; }
    .action-button:hover { transform: scale(1.1) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; }
    .new-round-button:hover { background: #f57c00 !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .record-result-button:hover { background: #7B1FA2 !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .number-button:hover { transform: scale(1.1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    .column-button:hover { background: #667eea; color: white; }
    .list-item:hover { background: #f5f5f5; }
    .drag-handle:active { cursor: grabbing; }
    .quick-button:active { transform: scale(0.95); }
    .recent-number:active { transform: scale(0.95); }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .card-actions { opacity: 1 !important; }
      .action-button { width: 44px; height: 44px; font-size: 1.2rem; }
      .card-actions { padding: 0.5rem 0.75rem; }
      .patternButton { padding: 0.5rem 1rem; }
      .headerButtons button { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
      .floatingPanel { min-width: 280px; }
      .quickButton { padding: 8px 4px; }
      .recentNumber { padding: 4px 10px; font-size: 12px; }
    }
  `;
  document.head.appendChild(styleElement);

  return (
    <div style={styles.container} onMouseMove={handleDragMove} onMouseUp={handleDragEnd}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎯 Bingo Pattern Analyzer (44 Balls)</h1>
          <div style={styles.headerButtons}>
            <button onClick={() => setShowBallRecords(true)} style={styles.ballRecordsButton}>
              🎱 Ball Records ({ballRecords.length})
            </button>
            <button onClick={() => setShowHistory(true)} style={styles.historyButton}>
              📜 History ({gameHistory.length})
            </button>
            <button onClick={() => setShowResults(true)} style={styles.resultsButton}>
              🏆 Results ({gameResults.length})
            </button>
            <button onClick={() => setShowSavedCards(true)} style={styles.savedButton}>
              💾 Saved Cards ({savedCards.length})
            </button>
            <button onClick={() => setShowFloatingPanel(!showFloatingPanel)} style={styles.floatingPanelToggle}>
              {showFloatingPanel ? "🔽 Hide Ball Panel" : "🔼 Show Ball Panel"}
            </button>
            <button onClick={goBack} style={styles.backButton}>← Back</button>
          </div>
        </div>
      </header>

      {/* Floating Ball Input Panel with Touch Support */}
      {showFloatingPanel && (
        <div 
          ref={panelRef}
          style={{
            ...styles.floatingPanel,
            top: panelPosition.y,
            left: panelPosition.x
          }}
        >
          <div 
            className="drag-handle" 
            style={styles.dragHandle} 
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <span>🎱 Quick Ball Caller</span>
            <div>
              <span style={{ fontSize: "12px", marginRight: "8px" }}>📌 Drag to move</span>
              <button 
                onClick={() => setShowFloatingPanel(false)}
                style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "16px", padding: "4px" }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={styles.panelContent}>
            <div style={styles.numberInput}>
              <input
                type="number"
                placeholder="Enter number (1-75)"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNumberInput(e)}
                style={styles.input}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button onClick={handleNumberInput} style={styles.callButton}>Call</button>
            </div>
            
            <div style={styles.quickButtons}>
              <button onClick={() => quickCallNumber(7)} style={styles.quickButton}>7</button>
              <button onClick={() => quickCallNumber(11)} style={styles.quickButton}>11</button>
              <button onClick={() => quickCallNumber(23)} style={styles.quickButton}>23</button>
              <button onClick={() => quickCallNumber(34)} style={styles.quickButton}>34</button>
              <button onClick={() => quickCallNumber(42)} style={styles.quickButton}>42</button>
              <button onClick={() => quickCallNumber(50)} style={styles.quickButton}>50</button>
              <button onClick={() => quickCallNumber(67)} style={styles.quickButton}>67</button>
              <button onClick={() => quickCallNumber(69)} style={styles.quickButton}>69</button>
              <button onClick={() => quickCallNumber(75)} style={styles.quickButton}>75</button>
              <button onClick={selectRandomBall} style={styles.quickButton}>🎲 Random</button>
            </div>
            
            <div style={styles.recentSection}>
              <div style={styles.recentTitle}>
                <span>📋 Recent Calls</span>
                {recentCalls.length > 0 && (
                  <button onClick={clearRecentCalls} style={{ fontSize: "10px", background: "none", border: "none", color: "#999", cursor: "pointer", padding: "4px" }}>
                    Clear
                  </button>
                )}
              </div>
              <div style={styles.recentNumbers}>
                {recentCalls.length === 0 ? (
                  <span style={{ fontSize: "12px", color: "#999" }}>No recent calls</span>
                ) : (
                  recentCalls.map((num, idx) => (
                    <span key={idx} onClick={() => quickCallNumber(num)} style={styles.recentNumber}>
                      {num}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#999", textAlign: "center" }}>
              <span style={{ ...styles.statusBadge, background: "#ffeb3b" }}></span> Called this round
              <span style={{ ...styles.statusBadge, background: "#e0e0e0", marginLeft: "8px" }}></span> Not called
            </div>
          </div>
        </div>
      )}

      <main style={styles.main}>
        {/* Pattern Selector */}
        <div style={styles.patternSelector}>
          {[
            { id: "blackout", label: "Blackout", icon: "⬛" },
            { id: "t", label: "T Pattern", icon: "📐" },
            { id: "x", label: "X Pattern", icon: "❌" },
            { id: "twoLines", label: "2 Lines", icon: "📏" },
            { id: "threeLines", label: "3 Lines", icon: "📊" },
            { id: "fourLines", label: "4 Lines", icon: "📈" },
            { id: "fourCorners", label: "4 Corners", icon: "🔲" },
            { id: "sideToSide", label: "Side to Side", icon: "⬆️⬇️" },
            { id: "emptyCross", label: "Empty Cross", icon: "✖️" }
          ].map((pattern) => (
            <button key={pattern.id} onClick={() => setCurrentPattern(pattern.id)} style={styles.patternButton(currentPattern === pattern.id)}>
              <span>{pattern.icon}</span>
              <span>{pattern.label}</span>
              {winners[pattern.id]?.length > 0 && (<span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold" }}>{winners[pattern.id].length}</span>)}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={styles.controlsGrid}>
          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 1rem 0" }}>📋 Card Generation</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Number of Cards</label>
              <input type="number" value={numCardsInput} onChange={(e) => setNumCardsInput(Number(e.target.value))} min="1" max={maxCards} style={{ ...styles.input, width: "100%" }} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Favored Balls Range</label>
              <input type="number" value={ballsCalledInput} onChange={(e) => setBallsCalledInput(Number(e.target.value))} min="1" max="44" style={{ ...styles.input, width: "100%" }} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Win %</label>
              <input type="number" value={targetWinPercentage} onChange={(e) => setTargetWinPercentage(Number(e.target.value))} min="0" max="100" style={{ ...styles.input, width: "100%" }} />
            </div>
            
            <div style={styles.favoriteNumbersContainer}>
              <div style={styles.favoriteHeader} onClick={() => setShowNumberSelector(!showNumberSelector)}>
                <h4 style={styles.favoriteTitle}>⭐ Favorite Numbers (1-75)</h4>
                <button style={styles.toggleButton}>{showNumberSelector ? "▼" : "▶"} Select</button>
              </div>
              <div style={styles.columnSelector}>
                <button onClick={() => selectAllInColumn('B')} style={styles.columnButton}>B (1-15)</button>
                <button onClick={() => selectAllInColumn('I')} style={styles.columnButton}>I (16-30)</button>
                <button onClick={() => selectAllInColumn('N')} style={styles.columnButton}>N (31-45)</button>
                <button onClick={() => selectAllInColumn('G')} style={styles.columnButton}>G (46-60)</button>
                <button onClick={() => selectAllInColumn('O')} style={styles.columnButton}>O (61-75)</button>
              </div>
              <input type="text" placeholder="🔍 Search numbers (e.g., 7, even, odd, prime)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              {showNumberSelector && (<div style={styles.numberSelectorGrid}>
                {filteredNumbers.map((num) => { const isSelected = favoriteNumbersList.includes(num); return (<div key={num} onClick={() => toggleFavoriteNumber(num)} style={styles.numberButton(isSelected)} className="number-button">{num}</div>); })}
              </div>)}
              {favoriteNumbersList.length > 0 && (<div style={styles.favoriteStats}>
                <div><strong>Selected favorites:</strong> {favoriteNumbersList.join(", ")}</div>
                <div><strong>Count:</strong> {favoriteNumbersList.length} numbers</div>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}><div>B: {favoriteStats.byColumn.B}</div></div>
                  <div style={styles.statItem}><div>I: {favoriteStats.byColumn.I}</div></div>
                  <div style={styles.statItem}><div>N: {favoriteStats.byColumn.N}</div></div>
                  <div style={styles.statItem}><div>G: {favoriteStats.byColumn.G}</div></div>
                  <div style={styles.statItem}><div>O: {favoriteStats.byColumn.O}</div></div>
                  <div style={styles.statItem}><div>Even: {favoriteStats.even}</div></div>
                  <div style={styles.statItem}><div>Odd: {favoriteStats.odd}</div></div>
                  <div style={styles.statItem}><div>Prime: {favoriteStats.prime}</div></div>
                </div>
                <div style={{ marginTop: "0.5rem" }}><label style={{ marginRight: "0.5rem" }}>Bias: {favoriteBias}%</label><input type="range" min="0" max="100" value={favoriteBias} onChange={(e) => setFavoriteBias(parseInt(e.target.value))} style={{ width: "100%" }} /></div>
                <button onClick={clearFavorites} style={{ marginTop: "0.5rem", padding: "0.2rem 0.5rem", background: "#ff4757", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Clear All</button>
              </div>)}
              {favoriteNumbersList.length === 0 && (<p style={{ color: "#999", fontSize: "0.9rem", textAlign: "center" }}>Click on numbers above to select favorites</p>)}
              
              <div style={styles.favoriteListsSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h5 style={{ margin: 0 }}>📋 Favorite Lists</h5>
                  <div><button onClick={() => setShowFavoriteLists(!showFavoriteLists)} style={styles.smallButton}>{showFavoriteLists ? "▼" : "▶"} Manage</button></div>
                </div>
                {showFavoriteLists && (<>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <input type="text" placeholder="List name" value={currentListName} onChange={(e) => setCurrentListName(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                    <button onClick={saveCurrentList} style={styles.smallButton}>Save</button>
                  </div>
                  <h6 style={{ margin: "0.5rem 0", color: "#666" }}>Predefined Lists</h6>
                  {getPredefinedLists().map(list => (<div key={list.id} className="list-item" style={styles.listItem}><div onClick={() => loadFavoriteList(list)}><div style={styles.listName}>{list.name}</div><div style={styles.listDetails}>{list.numbers.length} numbers • {list.description}</div></div></div>))}
                  {favoriteLists.length > 0 && (<><h6 style={{ margin: "0.5rem 0", color: "#666" }}>My Saved Lists</h6>{favoriteLists.map(list => (<div key={list.id} className="list-item" style={styles.listItem}><div onClick={() => loadFavoriteList(list)} style={{ flex: 1 }}>{editingListName === list.id ? (<input type="text" defaultValue={list.name} onBlur={(e) => updateListName(list.id, e.target.value)} onKeyPress={(e) => e.key === 'Enter' && updateListName(list.id, e.target.value)} style={styles.input} autoFocus />) : (<div style={styles.listName}>{list.name}</div>)}<div style={styles.listDetails}>{list.numbers.length} numbers • {list.date}</div></div><div style={styles.listActions}><button onClick={() => setEditingListName(list.id)} style={{...styles.smallButton, background: "#667eea"}}>✏️</button><button onClick={() => deleteFavoriteList(list.id)} style={{...styles.smallButton, background: "#ff4757"}}>🗑️</button></div></div>))}</>)}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <button onClick={exportFavoriteLists} style={{...styles.smallButton, background: "#4CAF50"}}>📤 Export</button>
                    <label style={{...styles.smallButton, background: "#2196F3", cursor: "pointer"}}>📥 Import<input type="file" accept=".json" onChange={importFavoriteLists} style={{ display: "none" }} /></label>
                  </div>
                </>)}
              </div>
            </div>
            
            <button onClick={handleGenerate} disabled={isGenerating} style={{ ...styles.generateButton, opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? "not-allowed" : "pointer" }}>{isGenerating ? "Generating..." : "🎲 Generate Cards with Favorites"}</button>
          </div>

          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 1rem 0" }}>🎱 44-Ball Draw</h3>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1rem" }}>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Drawn</span><span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{highlightNumbers.length}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Remaining</span><span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{44 - highlightNumbers.length}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Max</span><span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{maxBalls}</span></div>
            </div>
            <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", marginBottom: "1rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(highlightNumbers.length / maxBalls) * 100}%`, background: "linear-gradient(90deg, #667eea, #764ba2)", transition: "width 0.3s ease" }} />
            </div>
            <button onClick={selectRandomBall} style={styles.randomBallButton}>🎲 Draw Random Ball</button>
            <button onClick={handleNewRound} style={styles.newRoundButton} className="new-round-button">🆕 New Round (Clear All Numbers)</button>
            <button onClick={recordBingoResult} style={styles.recordResultButton} className="record-result-button" disabled={!cards.length || winners[currentPattern]?.length === 0}>🏆 Record BINGO Result</button>
            <button onClick={handleReset} style={styles.resetButton}>🔄 Reset Highlights</button>
            
            {highlightNumbers.length > 0 && (
              <div style={{ marginTop: "1rem", padding: "0.5rem", background: "#e8f4fd", borderRadius: "8px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>📊 Ball Statistics:</div>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>B: {ballStats.byColumn.B}</div>
                  <div style={styles.statItem}>I: {ballStats.byColumn.I}</div>
                  <div style={styles.statItem}>N: {ballStats.byColumn.N}</div>
                  <div style={styles.statItem}>G: {ballStats.byColumn.G}</div>
                  <div style={styles.statItem}>O: {ballStats.byColumn.O}</div>
                  <div style={styles.statItem}>Even: {ballStats.even}</div>
                  <div style={styles.statItem}>Odd: {ballStats.odd}</div>
                  <div style={styles.statItem}>Prime: {ballStats.prime}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balls Grid - Only showing up to 44 balls */}
        {cards.length > 0 && (
          <div style={styles.ballsSection}>
            <h3 style={{ margin: "0 0 1rem 0" }}>
              🎯 Called Numbers (1-44) 
              {favoriteNumbersList.length > 0 && (<span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#ffd700" }}>⭐ Favorites: {favoriteNumbersList.filter(n => n <= 44).join(", ")}</span>)}
              {selectedRecord && (<span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#4CAF50" }}>📋 Loaded: {selectedRecord.name}</span>)}
            </h3>
            <div style={styles.ballsGrid}>
              {Array.from({ length: 44 }, (_, i) => i + 1).map((num) => {
                const active = highlightNumbers.includes(num);
                const isFavorite = favoriteNumbersList.includes(num);
                return (<div key={num} onClick={() => toggleNumber(num)} style={{ ...styles.ball(active), ...(isFavorite && !active ? styles.favoriteBall : {}), position: "relative" }}>
                  <span style={{ fontWeight: "bold" }}>{num}</span>
                  {isFavorite && !active && (<span style={{ position: "absolute", top: "-5px", right: "-5px", fontSize: "0.6rem" }}>⭐</span>)}
                </div>);
              })}
            </div>
          </div>
        )}

        {/* Top Winner */}
        {topWinner && (<div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", border: "2px solid #ffd700" }}>
          <h3 style={{ margin: "0 0 1rem 0" }}>🏆 Top Performing Card</h3>
          <div style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>{formatSerial(topWinner.idx)}</span>
              <span>Progress: {Math.round(topWinner.progress)}%</span>
              <span>Win %: {Math.round(topWinner.winPercentage)}%</span>
              {topWinner.favoriteCount > 0 && (<span style={{ background: "#ffd700", color: "#333", padding: "0.25rem 0.75rem", borderRadius: "20px", fontWeight: "bold" }}>⭐ {topWinner.favoriteCount} favorites</span>)}
              {topWinner.isWinner && (<span style={{ background: "#ff4757", color: "white", padding: "0.25rem 0.75rem", borderRadius: "20px", fontWeight: "bold" }}>WINNER!</span>)}
            </div>
            <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${topWinner.progress}%`, background: "linear-gradient(90deg, #ffd700, #ffb347)", transition: "width 0.3s ease" }} />
            </div>
          </div>
        </div>)}

        {/* Cards */}
        {cards.length > 0 && (<div style={{ background: "white", borderRadius: "16px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ margin: 0 }}>📇 Bingo Cards ({cards.length}) {Object.values(pinnedCards).some(v => v) && " 📌 Pinned cards shown first"}{favoriteNumbersList.length > 0 && (<span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#4CAF50" }}>⭐ Cards with favorites highlighted</span>)}</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setViewMode("grid")} style={{ padding: "0.5rem 1rem", border: "2px solid #e0e0e0", borderRadius: "8px", background: viewMode === "grid" ? "#667eea" : "white", color: viewMode === "grid" ? "white" : "black", cursor: "pointer" }}>📱 Grid</button>
              <button onClick={() => setViewMode("list")} style={{ padding: "0.5rem 1rem", border: "2px solid #e0e0e0", borderRadius: "8px", background: viewMode === "list" ? "#667eea" : "white", color: viewMode === "list" ? "white" : "black", cursor: "pointer" }}>📋 List</button>
            </div>
          </div>
          <div style={styles.cardsContainer}>
            {rankedCards.map(({ card, idx, isWinner, progress, winPercentage, winningPatterns, isPinned, favoriteCount }, rank) => (<div key={idx} className="card-container" style={styles.cardContainer} onClick={() => toggleCardFlip(idx)}>
              <div className="card-actions" style={styles.cardActions}>
                {editingCard !== idx ? (<><button onClick={(e) => togglePin(idx, e)} style={{...styles.actionButton, ...styles.pinButton(isPinned)}} className="action-button" title={isPinned ? "Unpin card" : "Pin card"}>📌</button><button onClick={(e) => startEdit(card, idx, e)} style={{...styles.actionButton, ...styles.editButton}} className="action-button" title="Edit card">✏️</button><button onClick={(e) => saveCard(card, idx, e)} style={{...styles.actionButton, ...styles.saveButton}} className="action-button" title="Save to collection">💾</button><button onClick={(e) => deleteCard(idx, e)} style={{...styles.actionButton, ...styles.deleteButton}} className="action-button" title="Delete card">🗑️</button></>) : (<><button onClick={(e) => saveEdit(idx, e)} style={{...styles.actionButton, ...styles.saveButton}} className="action-button" title="Save changes">✓</button><button onClick={(e) => cancelEdit(e)} style={{...styles.actionButton, ...styles.cancelButton}} className="action-button" title="Cancel">✕</button></>)}
              </div>
              <div style={styles.cardInner(flippedCards[idx])}>
                <div style={styles.cardFront}>
                  <div style={styles.bingoCard(isWinner, isPinned, favoriteCount > 0)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.25rem" }}>
                      <span style={{ fontWeight: "bold" }}>{formatSerial(idx)}</span>
                      <span>Rank #{rank + 1}</span>
                      {favoriteCount > 0 && (<span style={{ background: "#ffd700", color: "#333", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" }}>⭐ {favoriteCount}</span>)}
                      {isWinner && (<span style={{ background: "#ff4757", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" }}>WINNER</span>)}
                    </div>
                    <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "2px", marginBottom: "0.5rem", overflow: "hidden" }}><div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #4CAF50, #8BC34A)", transition: "width 0.3s ease" }} /></div>
                    <div style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Win Chance: {Math.round(winPercentage)}%</div>
                    <div style={styles.bingoGrid}>
                      <div style={styles.bingoRow}><span style={{ width: "clamp(30px, 8vw, 35px)", textAlign: "center", fontWeight: "bold" }}>B</span><span style={{ width: "clamp(30px, 8vw, 35px)", textAlign: "center", fontWeight: "bold" }}>I</span><span style={{ width: "clamp(30px, 8vw, 35px)", textAlign: "center", fontWeight: "bold" }}>N</span><span style={{ width: "clamp(30px, 8vw, 35px)", textAlign: "center", fontWeight: "bold" }}>G</span><span style={{ width: "clamp(30px, 8vw, 35px)", textAlign: "center", fontWeight: "bold" }}>O</span></div>
                      {Array.from({ length: 5 }).map((_, row) => (<div key={row} style={styles.bingoRow}>
                        {card.map((col, c) => { const cell = col[row]; const isHighlighted = highlightNumbers.includes(cell); const isFree = cell === "FREE"; const isFavorite = !isFree && favoriteNumbersList.includes(cell); if (editingCard === idx) { return (<input key={c} type="text" value={cell} onChange={(e) => updateCell(c, row, e.target.value, e)} onClick={(e) => e.stopPropagation()} style={styles.editInput} disabled={cell === "FREE"} />); } return (<div key={c} style={styles.bingoCell(isHighlighted, isFree, isFavorite)}>{isFree ? "⭐" : cell}{isFavorite && !isHighlighted && (<span style={styles.favoriteStar}>⭐</span>)}</div>); })}
                      </div>))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}><span>{getCardScore(card)} left</span><span>Target: {targetWinPercentage}%</span></div>
                    <div style={styles.flipHint}>👆 Click to see winning patterns</div>
                  </div>
                </div>
                <div style={styles.cardBack}>
                  <div style={styles.cardNumber}>{formatSerial(idx)}</div>
                  <div style={styles.backHeader}>🏆 Winning Patterns</div>
                  {winningPatterns.length > 0 ? (<div style={styles.patternsList}>{winningPatterns.map((pattern, index) => (<div key={index} style={styles.patternItem} onClick={(e) => { e.stopPropagation(); setCurrentPattern(pattern.id); toggleCardFlip(idx); }}><span>{pattern.icon}</span><span>{pattern.name}</span><span style={styles.patternCount}>WINNER</span></div>))}</div>) : (<div style={styles.noPatterns}>No winning patterns yet<br /><span style={{ fontSize: "0.8rem" }}>Keep drawing numbers!</span></div>)}
                  <div style={{ textAlign: "center", marginTop: "auto", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", paddingTop: "0.5rem" }}>👆 Click pattern to view</div>
                </div>
              </div>
            </div>))}
          </div>
        </div>)}
      </main>

      {/* Ball Records Modal */}
      {showBallRecords && (<div style={styles.modal} onClick={() => setShowBallRecords(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2>🎱 44-Ball Records</h2>
            <div>{ballRecords.length > 0 && (<button onClick={exportBallRecords} style={styles.exportButton}>📥 Export</button>)}</div>
          </div>

          <h3>📋 Predefined Records</h3>
          {Object.entries(predefinedRecords).map(([name, balls]) => (<div key={name} style={styles.ballRecordItem} onClick={() => loadPredefinedRecord(name, balls)}>
            <div style={styles.ballRecordHeader}>
              <span style={styles.ballRecordName}>{name}</span>
              <span style={styles.ballRecordCount}>{balls.length} balls</span>
            </div>
            <div style={styles.ballRecordSequence}>Sequence: {balls.slice(0, 10).join(", ")}...{balls.slice(-5).join(", ")}</div>
          </div>))}

          {ballRecords.length > 0 && (<><h3 style={{ marginTop: "1rem" }}>💾 Saved Records</h3>{ballRecords.map(record => (<div key={record.id} style={styles.ballRecordItem}>
            <div style={styles.ballRecordHeader}>
              <span style={styles.ballRecordName}>{record.name}</span>
              <span style={styles.ballRecordCount}>{record.count} balls</span>
            </div>
            <div style={styles.ballRecordSequence}>Sequence: {record.sequence}</div>
            <div style={{ fontSize: "0.8rem", color: "#999" }}>Saved: {record.date}</div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button onClick={() => loadBallRecord(record)} style={{...styles.smallButton, background: "#4CAF50"}}>Load</button>
              <button onClick={() => deleteBallRecord(record.id)} style={{...styles.smallButton, background: "#ff4757"}}>Delete</button>
            </div>
          </div>))}</>)}

          <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px" }}>
            <h4>💾 Save Current Ball Sequence</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input type="text" placeholder="Record name" value={ballRecordName} onChange={(e) => setBallRecordName(e.target.value)} style={{ ...styles.input, flex: 1 }} />
              <button onClick={saveBallRecord} style={styles.smallButton}>Save Record</button>
            </div>
            {highlightNumbers.length > 0 && (<div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#666", wordBreak: "break-all" }}>Current: {highlightNumbers.join(", ")}</div>)}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <label style={{...styles.smallButton, background: "#2196F3", cursor: "pointer"}}>📥 Import Records<input type="file" accept=".json" onChange={importBallRecords} style={{ display: "none" }} /></label>
            <button onClick={clearBallRecord} style={{...styles.smallButton, background: "#ff9800"}}>Clear Current</button>
          </div>

          <button onClick={() => setShowBallRecords(false)} style={styles.closeButton}>Close</button>
        </div>
      </div>)}

      {/* Results Modal */}
      {showResults && (<div style={styles.modal} onClick={() => setShowResults(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}><h2>🏆 Bingo Results</h2><div>{gameResults.length > 0 && (<button onClick={exportResults} style={styles.exportButton}>📥 Export</button>)}</div></div>
          {gameResults.length === 0 ? (<p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No results yet. Click "Record BINGO Result" when you have winners!</p>) : (<>
            {stats && (<div style={styles.statsContainer}><h3 style={{ margin: 0 }}>📊 Statistics</h3><div style={styles.statsGridMain}><div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalGames}</div><div>Total Games</div></div><div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.averageBallsToWin}</div><div>Avg Balls to Win</div></div><div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.averageWinnersPerGame}</div><div>Avg Winners/Game</div></div><div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.mostWinningPattern}</div><div>Most Winning Pattern</div></div></div><div style={{ marginTop: "1rem" }}><h4>Pattern Statistics</h4><div style={{ display: "grid", gap: "0.5rem" }}>{Object.entries(stats.patternStats).map(([pattern, data]) => (<div key={pattern} style={{ background: "rgba(255,255,255,0.2)", padding: "0.5rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}><span>{data.icon} {data.name}</span><span>{data.count} games, {data.totalWinners} winners</span></div>))}</div></div></div>)}
            <h3>Game Results</h3>
            {gameResults.map(result => (<div key={result.id} style={styles.resultItem}><div style={styles.resultHeader}><div><strong>{result.patternIcon} {result.patternName}</strong><span style={{ color: "#999", marginLeft: "0.5rem" }}>{result.timestamp}</span></div><span style={styles.winnerBadge}>{result.winnerCount} winner{result.winnerCount !== 1 ? 's' : ''}</span></div><div>🎱 {result.ballsDrawnCount} balls drawn</div><div>📇 {result.totalCards} cards in play</div>{result.notes && (<div style={{ color: "#666", fontStyle: "italic", marginTop: "0.5rem" }}>📝 {result.notes}</div>)}<div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}><input type="text" placeholder="Add notes..." value={result.notes || ''} onChange={(e) => saveGameResult(result.id, e.target.value)} style={styles.noteInput} /><button onClick={() => deleteGameResult(result.id)} style={{...styles.deleteButton, padding: "0.5rem"}}>🗑️</button></div></div>))}
          </>)}
          <button onClick={() => setShowResults(false)} style={styles.closeButton}>Close</button>
        </div>
      </div>)}

      {/* History Modal */}
      {showHistory && (<div style={styles.modal} onClick={() => setShowHistory(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2>📜 Game History</h2>
          {gameHistory.length === 0 ? (<p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No game history yet.</p>) : (gameHistory.map(history => (<div key={history.id} style={styles.historyItem} onClick={() => { const result = gameResults.find(r => r.id === history.id); if (result) { setCurrentGameResult(result); setShowResults(true); setShowHistory(false); } }}><div style={styles.historyPattern}><span>{history.patternIcon}</span><span>{history.pattern}</span></div><div><span style={{ marginRight: "1rem" }}>{history.winnerCount} winner{history.winnerCount !== 1 ? 's' : ''}</span><span style={{ marginRight: "1rem" }}>🎱 {history.ballsDrawn}</span><span style={{ color: "#999", fontSize: "0.9rem" }}>{history.timestamp}</span></div></div>)))}
          <button onClick={() => setShowHistory(false)} style={styles.closeButton}>Close</button>
        </div>
      </div>)}

      {/* Saved Cards Modal */}
      {showSavedCards && (<div style={styles.savedCardsModal} onClick={() => setShowSavedCards(false)}>
        <div style={styles.savedCardsContent} onClick={(e) => e.stopPropagation()}>
          <h2>💾 Saved Cards Collection</h2>
          {savedCards.length === 0 ? (<p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No saved cards yet. Click the 💾 button on any card to save it.</p>) : (savedCards.map(savedCard => (<div key={savedCard.id} style={styles.savedCardItem}><div style={styles.savedCardInfo} onClick={() => loadSavedCard(savedCard)}><strong>{savedCard.serial}</strong><div style={styles.savedCardDate}>Saved: {savedCard.date}</div><div style={styles.savedCardPatterns}>{savedCard.patterns.map(p => (<span key={p.id} style={styles.savedCardPatternTag}>{p.icon} {p.name}</span>))}</div></div><button onClick={(e) => deleteSavedCard(savedCard.id, e)} style={{...styles.actionButton, ...styles.deleteButton}}>🗑️</button></div>)))}
          <button onClick={() => setShowSavedCards(false)} style={styles.closeButton}>Close</button>
        </div>
      </div>)}
    </div>
  );
}

export default Pattern;
