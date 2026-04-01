import React, { useState, useEffect, useCallback, useMemo } from "react";

function Pattern({ goBack }) {
  const CONSTANTS = {
    MAX_CARDS: 5000,
    MAX_BALLS: 48,
    TOTAL_BALLS: 75,
    MAX_ROUNDS: 30,
    COLUMNS: ['B', 'I', 'N', 'G', 'O'],
    COLUMN_RANGES: {
      B: [1, 15],
      I: [16, 30],
      N: [31, 45],
      G: [46, 60],
      O: [61, 75]
    }
  };

  const PATTERNS = [
    { id: "blackout", label: "Blackout", icon: "⬛", numbersNeeded: 24 },
    { id: "t", label: "T Pattern", icon: "📐", numbersNeeded: 9 },
    { id: "x", label: "X Pattern", icon: "❌", numbersNeeded: 9 },
    { id: "twoLines", label: "2 Lines", icon: "📏", numbersNeeded: 10 },
    { id: "threeLines", label: "3 Lines", icon: "📊", numbersNeeded: 15 },
    { id: "fourLines", label: "4 Lines", icon: "📈", numbersNeeded: 20 },
    { id: "fourCorners", label: "4 Corners", icon: "🔲", numbersNeeded: 4 },
    { id: "sideToSide", label: "Side to Side", icon: "⬆️⬇️", numbersNeeded: 20 },
    { id: "emptyCross", label: "Empty Cross", icon: "✖️", numbersNeeded: 16 },
    { id: "smallFrame", label: "Small Frame", icon: "🔳", numbersNeeded: 16 }
  ];

  const AVAILABLE_EMOJIS = ["🍀", "🎫", "⭐", "🎯", "💎", "🔥", "🌈", "🎲", "♠️", "♥️", "♦️", "♣️"];

  const DEFAULT_CARDS = [
    [[4,10,11,6,2],[30,19,23,27,28],[34,32,"★",31,33],[49,50,57,54,56],[73,69,66,74,64]],
    [[5,12,6,11,8],[20,16,29,27,30],[42,41,"★",45,43],[51,53,57,50,60],[72,63,74,73,64]],
    [[13,1,8,4,2],[18,24,22,16,20],[42,39,"NITOY",31,32],[60,58,54,50,57],[61,73,70,67,69]],
    [[1,3,9,11,13],[18,24,22,16,20],[42,39,"JUANNA T",31,32],[60,58,54,50,57],[61,73,70,67,69]],
    [[9,12,7,13,14],[18,25,22,28,29],[34,40,"MY CARD",33,45],[46,50,53,55,57],[61,65,68,70,73]],
    [[13,9,15,2,11],[27,16,30,17,29],[35,36,"MY CARD",33,32],[60,58,54,50,57],[62,63,71,75,72]],
    [[3,5,7,15,11],[17,21,22,27,29],[33,35,"MY CARD",44,39],[46,50,55,56,57],[66,65,67,69,73]],
    [[11,8,12,5,15],[16,21,24,20,30],[31,37,"MY CARD",44,43],[49,58,55,46,51],[71,69,75,67,61]],
    [[1,3,10,11,12],[16,26,29,17,24],[35,45,"LK CARD",44,33],[49,50,55,46,57],[71,66,72,67,71]],
    [[3,4,10,11,12],[19,20,21,22,28],[36,37,"MY CARD",39,41],[54,55,56,57,59],[68,69,71,72,74]],
    [[4,10,11,12,13],[16,20,21,26,28],[31,36,"LK CARD",40,41],[46,49,50,53,54],[62,67,69,71,74]],
    [[4,5,11,12,15],[21,26,28,29,30],[31,37,"MY CARD",43,45],[49,51,52,55,57],[69,71,72,73,74]],
    [[6,10,12,13,15],[16,22,27,28,29],[33,36,"FREE",42,45],[47,49,50,56,60],[62,63,64,71,73]],
    [[4,5,9,11,15],[16,17,24,25,27],[34,35,"FREE",39,45],[47,48,53,54,56],[63,65,67,68,69]],
    [[8,10,11,13,14],[19,21,24,27,29],[32,37,"FREE",44,45],[48,53,58,59,60],[64,65,69,71,74]],
    [[1,5,6,8,12],[18,23,27,28,29],[34,35,"FREE",39,42],[48,54,56,57,58],[63,64,68,73,75]],
    [[1,10,11,13,14],[16,17,22,23,29],[33,34,"FREE",43,45],[46,50,53,54,60],[63,65,69,71,73]],
    [[3,8,12,13,14],[16,20,22,18,30],[31,44,"BIMBY 4L",45,32],[47,48,56,55,59],[62,61,71,70,74]],
    [[3,5,6,11,13],[16,20,21,18,29],[36,38,"NITOY 3L",41,42],[50,54,55,59,60],[61,62,63,64,70]],
    [[4,6,9,12,15],[19,21,22,28,29],[32,33,"NITOY 3L",40,45],[52,53,55,55,46],[62,63,67,71,73]],
    [[4,6,11,12,15],[19,21,25,28,29],[32,33,"NITOY BO",40,45],[52,53,59,55,46],[62,63,75,71,73]],
    [[2,4,5,6,15],[16,19,21,25,26],[35,38,"NITOY T.PA ",41,42],[52,53,59,55,46],[71,73,75,61,63]],
    [[4,5,8,10,11],[21,24,26,28,30],[31,37,"SQUARE",40,45],[46,47,51,53,57],[65,67,68,72,74]],
    [[3,4,10,11,12],[19,20,21,22,28],[36,37,"SQUARE",39,41],[54,55,71,57,59],[68,69,61,72,74]],
    [[4,10,11,12,13],[16,20,21,26,28],[31,36,"SQUARE",40,41],[46,49,69,53,54],[62,67,71,72,74]],
    [[5,8,10,11,15],[18,21,24,25,29],[31,34,"CRISS 3L",39,45],[47,49,56,59,60],[63,68,69,71,75]],
    [[5,8,10,11,15],[18,21,24,25,29],[31,34,"CRISS 3L",39,45],[47,49,56,59,60],[63,68,69,71,75]],
    [[1,2,9,11,15],[18,23,25,27,29],[31,38,"CRISS 3L",43,45],[47,51,52,59,60],[61,63,65,68,74]],
    [[5,8,10,11,15],[18,21,23,25,29],[31,34,"CRISS 3L",37,39],[47,50,51,56,60],[63,68,69,71,75]],
    [[3,5,8,11,15],[18,21,23,24,29],[31,34,"CRISS 3L",38,39],[49,51,54,59,60],[63,65,68,69,71]],
    [[2,5,7,8,14],[16,23,24,27,29],[31,38,"CRISS 3L",41,45],[47,48,50,51,59],[67,68,71,73,74]],
    [[2,4,6,8,13],[18,21,24,25,29],[32,34,"CRISS 3L X",38,43],[46,48,56,57,60],[63,67,68,69,71]],
    [[7,8,9,11,15],[21,23,24,25,26],[32,34,"CRISS 3L X",41,42],[51,54,56,57,58],[64,65,67,69,70]],
    [[8,10,11,12,15],[18,21,24,25,29],[31,34,"CRISS 3L X",39,45],[47,50,54,56,60],[63,65,68,71,75]],
    [[1,6,7,9,13],[18,21,25,27,29],[37,38,"CRISS 3L X",40,45],[47,48,49,51,54],[63,65,68,74,75]],
    [[8,10,11,12,15],[21,23,24,25,29],[31,34,"CRISS 3L X",39,45],[47,49,54,56,59],[63,65,69,72,75]],
    [[1,7,8,9,15],[23,25,26,27,29],[31,35,"CRISS EMPTY CROSS",41,45],[50,51,53,56,60],[64,65,68,70,74]],
    [[10,15,7,6,4],[20,24,23,21,29],[39,42,"NITOY 3L",40,38],[49,60,57,54,46],[69,63,62,71,74]],
    [[15,6,12,2,8],[25,29,23,17,24],[35,40,"NITOY 3L",41,39],[52,57,47,55,54],[68,66,63,67,74]],
    [[3,8,12,4,6],[29,21,18,20,27],[40,31,"NITOY 3L",42,43],[53,58,51,59,46],[74,61,73,62,67]],
    [[10,15,7,6,4],[20,24,23,21,29],[39,42,"NITOY 4L",40,38],[60,49,57,54,46],[69,63,62,71,74]],
    [[9,6,15,12,11],[21,18,22,16,17],[31,37,"NITOY EM",33,42],[59,49,56,53,46],[71,73,63,74,67]],
    [[10,12,14,6,11],[30,25,18,19,27],[36,33,"NITOY X",45,37],[48,53,57,59,56],[75,69,61,68,67]],
    [[10,14,12,1,4],[19,23,30,27,22],[35,39,"NITOY X",45,34],[56,59,47,52,55],[66,67,64,68,73]],
    [[15,5,7,1,10],[19,25,17,23,26],[36,37,"NITOY X",44,31],[47,54,56,59,53],[63,69,68,64,73]],
    [[2,8,10,9,3],[28,23,27,18,24],[44,39,"NITOY X",36,34],[51,54,58,59,46],[74,71,67,61,64]],
    [[7,10,4,15,2],[25,21,24,19,30],[31,33,"NITOY X",32,45],[57,49,53,58,52],[74,69,66,75,63]],
    [[12,4,13,9,15],[26,24,21,27,20],[39,44,"NITOY X",45,38],[48,50,58,49,60],[61,73,69,71,75]],
    [[7,6,3,8,15],[21,29,16,23,28],[40,37,"NITOY X",31,39],[60,49,46,56,47],[67,72,75,73,74]],
    [[9,6,14,11,12],[30,24,20,16,23],[34,41,"NITOY X",36,31],[47,46,55,49,53],[63,66,70,71,62]],
    [[9,15,8,11,3],[19,17,24,18,20],[35,42,"NITOY X",44,31],[59,53,58,47,49],[67,70,69,64,71]],
    [[4,15,11,3,6],[22,25,18,16,24],[40,43,"NITOY X",39,33],[48,59,47,49,60],[62,64,67,74,61]],
    [[4,14,9,11,3],[16,27,29,25,17],[40,43,"NITOY X",42,36],[51,58,47,53,55],[66,72,61,67,75]],
    [[8,9,3,4,15],[21,20,23,29,18],[32,38,"NITOY X",37,41],[50,60,53,49,59],[62,67,69,68,63]],
    [[15,11,4,10,6],[27,16,17,20,19],[45,32,"FREE",37,33],[53,59,50,54,47],[63,65,69,67,71]],
    [[12,11,4,10,3],[28,25,30,24,22],[36,34,"NITOY X",33,39],[49,58,52,47,54],[73,65,75,67,63]],
    [[7,8,10,14,6],[27,19,28,20,30],[44,32,"NITOY X",37,43],[60,46,51,53,58],[62,74,63,71,75]],
  ];

  const DEFAULT_PROFILE = {
    name: "Harry",
    avatar: "🎯",
    level: 5,
    experience: 1250,
    gamesPlayed: 47,
    winRate: 68,
    favoritePattern: "X Pattern",
    joinDate: "March 2026"
  };

  const [numCardsInput, setNumCardsInput] = useState(10);
  const [ballsCalledInput, setBallsCalledInput] = useState(25);
  const [targetWinPercentage, setTargetWinPercentage] = useState(98);
  const [isGenerating, setIsGenerating] = useState(false);

  const [roundFrequency, setRoundFrequency] = useState([]);
  const [showRoundFrequency, setShowRoundFrequency] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [roundStats, setRoundStats] = useState({ totalRounds: 0, averageNumbersPerRound: 0, mostFrequentNumber: '', leastFrequentNumber: '', uniqueNumbers: 0 });

  const [roundHistory, setRoundHistory] = useState([]);
  const [showRoundHistory, setShowRoundHistory] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [autoAdvanceRound, setAutoAdvanceRound] = useState(true);
  const [roundStatsByRound, setRoundStatsByRound] = useState({});

  const [generatedCards, setGeneratedCards] = useState([]);
  const [myCards, setMyCards] = useState(DEFAULT_CARDS);
  const [cardWinPercentages, setCardWinPercentages] = useState([]);
  const [cardLabels, setCardLabels] = useState({ 0: { name: "Harry's Card", emoji: "🎯", notes: "BALL PICKER" } });

  const [highlightNumbers, setHighlightNumbers] = useState([]);
  const [currentPattern, setCurrentPattern] = useState("x");
  const [winners, setWinners] = useState({});

  const [viewMode, setViewMode] = useState("grid");
  const [flippedCards, setFlippedCards] = useState({});
  const [pinnedCards, setPinnedCards] = useState({});
  const [activeCardSection, setActiveCardSection] = useState("myCards");

  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelCardIndex, setLabelCardIndex] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [labelCardSection, setLabelCardSection] = useState("myCards");
  const [validationErrors, setValidationErrors] = useState({});

  const [manualNumberInput, setManualNumberInput] = useState("");

  const [favoriteNumbers, setFavoriteNumbers] = useState("");
  const [favoriteNumbersList, setFavoriteNumbersList] = useState([]);
  const [favoriteBias, setFavoriteBias] = useState(70);
  const [showFavoriteStats, setShowFavoriteStats] = useState(false);
  const [showNumberSelector, setShowNumberSelector] = useState(false);
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [showFavoriteLists, setShowFavoriteLists] = useState(false);
  const [currentListName, setCurrentListName] = useState("");
  const [editingListName, setEditingListName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [gameResults, setGameResults] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentGameResult, setCurrentGameResult] = useState(null);

  const [savedCards, setSavedCards] = useState([]);
  const [showSavedCards, setShowSavedCards] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData] = useState(DEFAULT_PROFILE);

  const [winChancePreviewPattern, setWinChancePreviewPattern] = useState("x");
  const [prioritizePatternCells, setPrioritizePatternCells] = useState(true);

  useEffect(() => {
    const percentages = myCards.map(card => calculateWinPercentage(card, currentPattern));
    setCardWinPercentages(percentages);
  }, []);

  useEffect(() => {
    const allCards = [...myCards, ...generatedCards];
    if (!allCards.length) return;
    const newWinners = {};
    PATTERNS.forEach(pattern => { newWinners[pattern.id] = []; });
    allCards.forEach((card, i) => {
      PATTERNS.forEach(pattern => {
        if (checkPattern(card, pattern.id)) { newWinners[pattern.id].push(i); }
      });
    });
    setWinners(newWinners);
  }, [highlightNumbers, myCards, generatedCards]);

  useEffect(() => {
    if (highlightNumbers.length === 0) {
      setRoundFrequency([]);
      setCurrentRound(1);
      return;
    }
    const frequencyMap = new Map();
    for (let i = 1; i <= 75; i++) { frequencyMap.set(i, 0); }
    highlightNumbers.forEach(num => { frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1); });
    const frequencyArray = Array.from(frequencyMap.entries()).map(([number, count]) => ({ number, count })).sort((a, b) => a.number - b.number);
    setRoundFrequency(frequencyArray);
    const maxFrequency = Math.max(...frequencyArray.map(f => f.count), 0);
    const newRound = maxFrequency + 1;
    setCurrentRound(newRound);
    if (autoAdvanceRound && highlightNumbers.length >= CONSTANTS.MAX_BALLS) {
      const roundData = { roundNumber: roundHistory.length + 1, ballsCalled: [...highlightNumbers].sort((a, b) => a - b), ballCount: highlightNumbers.length, timestamp: new Date().toLocaleString(), frequencyData: frequencyArray, stats: { totalBalls: highlightNumbers.length, uniqueNumbers: frequencyArray.filter(f => f.count > 0).length, mostFrequent: getMostFrequentNumber(frequencyArray), leastFrequent: getLeastFrequentNumber(frequencyArray), columnDistribution: getColumnDistribution(frequencyArray) } };
      setRoundHistory(prev => [...prev, roundData]);
      setHighlightNumbers([]);
      setSelectedNumber(null);
      alert(`🎯 Round ${roundData.roundNumber} complete! Starting Round ${roundData.roundNumber + 1}`);
    }
    const totalRounds = maxFrequency;
    const uniqueNumbersCalled = frequencyArray.filter(f => f.count > 0).length;
    const numbersWithFrequency = frequencyArray.filter(f => f.count > 0);
    let mostFrequent = { number: 0, count: 0 };
    let leastFrequent = { number: 0, count: Infinity };
    numbersWithFrequency.forEach(item => {
      if (item.count > mostFrequent.count) mostFrequent = item;
      if (item.count < leastFrequent.count) leastFrequent = item;
    });
    setRoundStats({ totalRounds, averageNumbersPerRound: highlightNumbers.length / (totalRounds || 1), mostFrequentNumber: mostFrequent.number ? `${mostFrequent.number} (${mostFrequent.count}x)` : 'None', leastFrequentNumber: leastFrequent.number ? `${leastFrequent.number} (${leastFrequent.count}x)` : 'None', uniqueNumbers: uniqueNumbersCalled });
  }, [highlightNumbers, autoAdvanceRound, roundHistory.length]);

  useEffect(() => {
    const stats = {};
    roundHistory.forEach(round => {
      const roundFreq = new Array(75).fill(0);
      round.ballsCalled.forEach(num => { roundFreq[num - 1]++; });
      stats[round.roundNumber] = { ...round.stats, numbers: round.ballsCalled, frequency: roundFreq };
    });
    setRoundStatsByRound(stats);
  }, [roundHistory]);

  const formatSerial = useCallback((i, prefix = "CARD") => `#${prefix}-${String(i + 1).padStart(3, "0")}`, []);

  const getColumnForNumber = useCallback((num) => {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  }, []);

  const getColumnColor = useCallback((col) => {
    switch(col) {
      case 'B': return '#4CAF50';
      case 'I': return '#2196F3';
      case 'N': return '#9C27B0';
      case 'G': return '#FF9800';
      case 'O': return '#F44336';
      default: return '#666';
    }
  }, []);

  const isPrime = useCallback((num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }, []);

  const getMostFrequentNumber = useCallback((frequencyArray) => {
    let maxCount = 0, mostFrequent = null;
    frequencyArray.forEach(({ number, count }) => { if (count > maxCount) { maxCount = count; mostFrequent = number; } });
    return { number: mostFrequent, count: maxCount };
  }, []);

  const getLeastFrequentNumber = useCallback((frequencyArray) => {
    const calledNumbers = frequencyArray.filter(f => f.count > 0);
    let minCount = Infinity, leastFrequent = null;
    calledNumbers.forEach(({ number, count }) => { if (count < minCount) { minCount = count; leastFrequent = number; } });
    return { number: leastFrequent, count: minCount };
  }, []);

  const getColumnDistribution = useCallback((frequencyArray) => {
    const distribution = { B: 0, I: 0, N: 0, G: 0, O: 0 };
    frequencyArray.forEach(({ number, count }) => { if (count > 0) { const col = getColumnForNumber(number); distribution[col]++; } });
    return distribution;
  }, [getColumnForNumber]);

  const getNumberFrequencyAcrossRounds = useCallback(() => {
    const frequency = {};
    for (let i = 1; i <= 75; i++) { frequency[i] = 0; }
    highlightNumbers.forEach(num => { frequency[num] = (frequency[num] || 0) + 1; });
    roundHistory.forEach(round => { round.ballsCalled.forEach(num => { frequency[num] = (frequency[num] || 0) + 1; }); });
    return frequency;
  }, [highlightNumbers, roundHistory]);

  const validateCard = useCallback((card) => {
    const errors = {};
    const columnRanges = CONSTANTS.COLUMN_RANGES;
    const columnIndices = { B: 0, I: 1, N: 2, G: 3, O: 4 };
    Object.entries(columnIndices).forEach(([colName, colIndex]) => {
      const [min, max] = columnRanges[colName];
      const columnNumbers = card[colIndex];
      if (columnNumbers.length !== 5) { errors[`col_${colIndex}`] = `Column ${colName} must have exactly 5 numbers`; return; }
      columnNumbers.forEach((num, rowIndex) => {
        if (num === "FREE" || num === "★") {
          if (!(colIndex === 2 && rowIndex === 2 && num === "FREE") && num !== "★") { errors[`cell_${colIndex}_${rowIndex}`] = `FREE space only allowed in center of N column`; }
          return;
        }
        const numValue = parseInt(num);
        if (isNaN(numValue)) { errors[`cell_${colIndex}_${rowIndex}`] = `Invalid number: ${num}`; return; }
        if (numValue < min || numValue > max) { errors[`cell_${colIndex}_${rowIndex}`] = `${numValue} is not in column ${colName} range (${min}-${max})`; }
        const duplicateIndex = columnNumbers.findIndex((n, idx) => idx !== rowIndex && parseInt(n) === numValue);
        if (duplicateIndex !== -1) { errors[`cell_${colIndex}_${rowIndex}`] = `Duplicate number ${numValue} in column ${colName}`; }
      });
    });
    const allNumbers = [];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        const val = card[c][r];
        if (val !== "FREE" && val !== "★") {
          const num = parseInt(val);
          if (!isNaN(num)) {
            if (allNumbers.includes(num)) { errors[`global_${num}`] = `Number ${num} appears multiple times on the card`; }
            allNumbers.push(num);
          }
        }
      }
    }
    return errors;
  }, []);

  const toggleNumberSafe = useCallback((num) => {
    setHighlightNumbers(prev => {
      if (prev.includes(num)) { return prev.filter(n => n !== num); }
      if (prev.length >= CONSTANTS.MAX_BALLS) { alert(`Maximum ${CONSTANTS.MAX_BALLS} balls reached for this round.`); return prev; }
      return [...prev, num].sort((a, b) => a - b);
    });
  }, [CONSTANTS.MAX_BALLS]);

  const toggleFavoriteNumberFixed = useCallback((num) => {
    setFavoriteNumbersList(prev => {
      const newList = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort((a, b) => a - b);
      setFavoriteNumbers(newList.join(", "));
      if (newList.length > 0) setShowFavoriteStats(true);
      if (newList.length === 0) setShowFavoriteStats(false);
      return newList;
    });
  }, []);

  const checkBlackout = useCallback((card) => {
    return card.flat().filter(n => n !== "FREE" && n !== "★").every(n => highlightNumbers.includes(n));
  }, [highlightNumbers]);

  const checkTPattern = useCallback((card) => {
    const topRow = card.map(col => col[0]);
    const middleCol = card[2].filter(n => n !== "FREE" && n !== "★");
    return [...topRow, ...middleCol].every(n => highlightNumbers.includes(n));
  }, [highlightNumbers]);

  const checkXPattern = useCallback((card) => {
    let diag1 = true, diag2 = true;
    for (let i = 0; i < 5; i++) {
      const a = card[i][i], b = card[i][4 - i];
      if (a !== "FREE" && a !== "★" && !highlightNumbers.includes(a)) diag1 = false;
      if (b !== "FREE" && b !== "★" && !highlightNumbers.includes(b)) diag2 = false;
    }
    return diag1 && diag2;
  }, [highlightNumbers]);

  const checkLines = useCallback((card, requiredLines) => {
    let rows = 0;
    for (let r = 0; r < 5; r++) {
      let complete = true;
      for (let c = 0; c < 5; c++) { const num = card[c][r]; if (num !== "FREE" && num !== "★" && !highlightNumbers.includes(num)) { complete = false; break; } }
      if (complete) rows++;
    }
    return rows >= requiredLines;
  }, [highlightNumbers]);

  const checkFourCorners = useCallback((card) => {
    const corners = [card[0][0], card[4][0], card[0][4], card[4][4]];
    return corners.every(num => num !== "FREE" && num !== "★" && highlightNumbers.includes(num));
  }, [highlightNumbers]);

  const checkSideToSide = useCallback((card) => {
    let columns = 0;
    for (let c = 0; c < 5; c++) {
      if (c === 2) continue;
      let complete = true;
      for (let r = 0; r < 5; r++) { const num = card[c][r]; if (num !== "FREE" && num !== "★" && !highlightNumbers.includes(num)) { complete = false; break; } }
      if (complete) columns++;
    }
    return columns >= 4;
  }, [highlightNumbers]);

  const checkEmptyCross = useCallback((card) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isInnerCross = (r === 2 && (c === 1 || c === 2 || c === 3)) || (c === 2 && (r === 1 || r === 2 || r === 3));
        if (isInnerCross) continue;
        const num = card[c][r];
        if (num === "FREE" || num === "★") continue;
        if (!highlightNumbers.includes(num)) return false;
      }
    }
    return true;
  }, [highlightNumbers]);

  const checkSmallFrame = useCallback((card) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isOnBorder = r === 0 || r === 4 || c === 0 || c === 4;
        if (!isOnBorder) continue;
        const num = card[c][r];
        if (num === "FREE" || num === "★") continue;
        if (!highlightNumbers.includes(num)) return false;
      }
    }
    return true;
  }, [highlightNumbers]);

  const getPatternCells = useCallback((patternId) => {
    const cells = new Set();
    switch(patternId) {
      case "blackout":
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) cells.add(`${c},${r}`);
        break;
      case "t":
        for (let c = 0; c < 5; c++) cells.add(`${c},0`);
        for (let r = 0; r < 5; r++) cells.add(`2,${r}`);
        break;
      case "x":
        for (let i = 0; i < 5; i++) { cells.add(`${i},${i}`); cells.add(`${i},${4-i}`); }
        break;
      case "twoLines":
        for (let c = 0; c < 5; c++) { cells.add(`${c},0`); cells.add(`${c},1`); }
        break;
      case "threeLines":
        for (let c = 0; c < 5; c++) { cells.add(`${c},0`); cells.add(`${c},1`); cells.add(`${c},2`); }
        break;
      case "fourLines":
        for (let c = 0; c < 5; c++) { cells.add(`${c},0`); cells.add(`${c},1`); cells.add(`${c},2`); cells.add(`${c},3`); }
        break;
      case "fourCorners":
        cells.add("0,0"); cells.add("4,0"); cells.add("0,4"); cells.add("4,4");
        break;
      case "sideToSide":
        for (let r = 0; r < 5; r++) { cells.add(`0,${r}`); cells.add(`1,${r}`); cells.add(`3,${r}`); cells.add(`4,${r}`); }
        break;
      case "emptyCross":
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
          const isInnerCross = (r === 2 && (c === 1 || c === 2 || c === 3)) || (c === 2 && (r === 1 || r === 2 || r === 3));
          if (!isInnerCross) cells.add(`${c},${r}`);
        }
        break;
      case "smallFrame":
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (r === 0 || r === 4 || c === 0 || c === 4) cells.add(`${c},${r}`);
        break;
      default: break;
    }
    return cells;
  }, []);

  const checkPattern = useCallback((card, patternId) => {
    switch(patternId) {
      case "blackout": return checkBlackout(card);
      case "t": return checkTPattern(card);
      case "x": return checkXPattern(card);
      case "twoLines": return checkLines(card, 2);
      case "threeLines": return checkLines(card, 3);
      case "fourLines": return checkLines(card, 4);
      case "fourCorners": return checkFourCorners(card);
      case "sideToSide": return checkSideToSide(card);
      case "emptyCross": return checkEmptyCross(card);
      case "smallFrame": return checkSmallFrame(card);
      default: return false;
    }
  }, [checkBlackout, checkTPattern, checkXPattern, checkLines, checkFourCorners, checkSideToSide, checkEmptyCross, checkSmallFrame]);

  const checkAllPatterns = useCallback((card) => {
    return PATTERNS.filter(pattern => checkPattern(card, pattern.id)).map(pattern => ({ id: pattern.id, name: pattern.label, icon: pattern.icon }));
  }, [checkPattern]);

  const calculateWinPercentage = useCallback((card, patternId) => {
    const pattern = PATTERNS.find(p => p.id === patternId);
    const numbersNeeded = pattern?.numbersNeeded || 24;
    const cardNumbers = card.flat().filter(n => n !== "FREE" && n !== "★");
    const matchedNumbers = cardNumbers.filter(n => highlightNumbers.includes(n)).length;
    return Math.min(100, Math.max(0, (matchedNumbers / numbersNeeded) * 100));
  }, [highlightNumbers]);

  const getCardScore = useCallback((card) => {
    return card.flat().filter(n => n !== "FREE" && n !== "★" && !highlightNumbers.includes(n)).length;
  }, [highlightNumbers]);

  const computeWinChancePreview = useCallback((patternId) => {
    const pattern = PATTERNS.find(p => p.id === patternId);
    if (!pattern) return { score: 0, label: "—", color: "#999", detail: "" };

    const numbersNeeded = pattern.numbersNeeded;
    const favCount = favoriteNumbersList.length;
    const ballsDrawn = highlightNumbers.length;
    const calledFavorites = favoriteNumbersList.filter(n => highlightNumbers.includes(n)).length;

    let favoriteScore = 0;
    if (favCount > 0) {
      const patternRelevance = Math.min(favCount / numbersNeeded, 1);
      favoriteScore = patternRelevance * 100;
    }

    let drawnScore = 0;
    if (ballsDrawn > 0) {
      drawnScore = Math.min((ballsDrawn / numbersNeeded) * 100, 100);
    }

    let score;
    if (ballsDrawn === 0) {
      score = favoriteScore;
    } else {
      score = Math.min(((calledFavorites * 2 + ballsDrawn * 0.5) / (numbersNeeded)) * 100, 100);
    }

    score = Math.min(Math.max(Math.round(score), 0), 100);

    let label, color;
    if (score >= 80) { label = "Very High"; color = "#22c55e"; }
    else if (score >= 60) { label = "High"; color = "#84cc16"; }
    else if (score >= 40) { label = "Medium"; color = "#f59e0b"; }
    else if (score >= 20) { label = "Low"; color = "#f97316"; }
    else { label = "Very Low"; color = "#ef4444"; }

    const detail = ballsDrawn > 0
      ? `${calledFavorites} of your favorites called / ${numbersNeeded} needed`
      : favCount > 0
        ? `${favCount} favorites selected / ${numbersNeeded} needed`
        : `No favorites selected — ${numbersNeeded} numbers needed`;

    return { score, label, color, detail };
  }, [favoriteNumbersList, highlightNumbers]);

  const winChanceData = useMemo(() => {
    return PATTERNS.map(p => ({ ...p, ...computeWinChancePreview(p.id) }))
      .sort((a, b) => b.score - a.score);
  }, [computeWinChancePreview]);

  const startNewRound = useCallback(() => {
    if (highlightNumbers.length === 0) { alert("No balls drawn in current round!"); return; }
    const frequencyMap = new Map();
    for (let i = 1; i <= 75; i++) { frequencyMap.set(i, 0); }
    highlightNumbers.forEach(num => { frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1); });
    const frequencyArray = Array.from(frequencyMap.entries()).map(([number, count]) => ({ number, count })).sort((a, b) => a.number - b.number);
    const roundData = { roundNumber: roundHistory.length + 1, ballsCalled: [...highlightNumbers].sort((a, b) => a - b), ballCount: highlightNumbers.length, timestamp: new Date().toLocaleString(), frequencyData: frequencyArray, stats: { totalBalls: highlightNumbers.length, uniqueNumbers: frequencyArray.filter(f => f.count > 0).length, mostFrequent: getMostFrequentNumber(frequencyArray), leastFrequent: getLeastFrequentNumber(frequencyArray), columnDistribution: getColumnDistribution(frequencyArray) } };
    setRoundHistory(prev => [...prev, roundData]);
    setHighlightNumbers([]);
    setSelectedNumber(null);
    alert(`✅ Round ${roundData.roundNumber} saved to history!`);
  }, [highlightNumbers, roundHistory.length, getMostFrequentNumber, getLeastFrequentNumber, getColumnDistribution]);

  const clearRoundHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all round history?")) { setRoundHistory([]); setSelectedRound(null); }
  }, []);

  const exportRoundHistory = useCallback(() => {
    const dataStr = JSON.stringify(roundHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `round-history-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  }, [roundHistory]);

  const getRoundComparison = useCallback(() => {
    if (roundHistory.length < 2) return null;
    const comparison = { totalRounds: roundHistory.length, averageBallsPerRound: roundHistory.reduce((acc, r) => acc + r.ballCount, 0) / roundHistory.length, mostBallsRound: roundHistory.reduce((max, r) => r.ballCount > max.ballCount ? r : max, roundHistory[0]), leastBallsRound: roundHistory.reduce((min, r) => r.ballCount < min.ballCount ? r : min, roundHistory[0]), mostUniqueRound: roundHistory.reduce((max, r) => r.stats.uniqueNumbers > max.stats.uniqueNumbers ? r : max, roundHistory[0]), leastUniqueRound: roundHistory.reduce((min, r) => r.stats.uniqueNumbers < min.stats.uniqueNumbers ? r : min, roundHistory[0]), mostFrequentNumbers: {}, columnAverages: { B: 0, I: 0, N: 0, G: 0, O: 0 } };
    roundHistory.forEach(round => { Object.entries(round.stats.columnDistribution).forEach(([col, count]) => { comparison.columnAverages[col] += count; }); });
    Object.keys(comparison.columnAverages).forEach(col => { comparison.columnAverages[col] = Math.round(comparison.columnAverages[col] / roundHistory.length); });
    const allNumbersFrequency = {};
    roundHistory.forEach(round => { round.ballsCalled.forEach(num => { allNumbersFrequency[num] = (allNumbersFrequency[num] || 0) + 1; }); });
    comparison.mostFrequentNumbers = Object.entries(allNumbersFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([num, count]) => ({ number: parseInt(num), count }));
    return comparison;
  }, [roundHistory]);

  const getCardLabel = useCallback((cardIndex, section = "myCards") => {
    const key = `${section}-${cardIndex}`;
    return cardLabels[key] || { name: section === "myCards" ? `My Card ${formatSerial(cardIndex, "MY")}` : `Generated Card ${formatSerial(cardIndex, "GEN")}`, emoji: section === "myCards" ? "🎯" : "🎴", notes: "" };
  }, [cardLabels, formatSerial]);

  const updateCardLabel = useCallback((cardIndex, section, labelData) => {
    const key = `${section}-${cardIndex}`;
    setCardLabels(prev => ({ ...prev, [key]: { ...prev[key], ...labelData } }));
    setShowLabelModal(false);
    setLabelCardIndex(null);
  }, []);

  const startEditLabel = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    setLabelCardIndex(cardIndex);
    setLabelCardSection(section);
    setLabelInput(getCardLabel(cardIndex, section).name);
    setShowLabelModal(true);
  }, [getCardLabel]);

  const parseFavoriteNumbers = useCallback(() => {
    const numbers = favoriteNumbers.split(/[,\s]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 75);
    const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
    setFavoriteNumbersList(uniqueNumbers);
    setShowFavoriteStats(true);
    setFavoriteNumbers(uniqueNumbers.join(", "));
    return uniqueNumbers;
  }, [favoriteNumbers]);

  const addRangeFavorite = useCallback((start, end) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setFavoriteNumbersList(prev => {
      const newList = [...new Set([...prev, ...range])].sort((a, b) => a - b);
      setFavoriteNumbers(newList.join(", "));
      setShowFavoriteStats(true);
      return newList;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    if (window.confirm("Clear all favorite numbers?")) { setFavoriteNumbersList([]); setFavoriteNumbers(""); setShowFavoriteStats(false); }
  }, []);

  const selectAllInColumn = useCallback((column) => {
    const [start, end] = CONSTANTS.COLUMN_RANGES[column];
    addRangeFavorite(start, end);
  }, [addRangeFavorite]);

  const getFavoriteStats = useCallback(() => {
    const stats = { total: favoriteNumbersList.length, byColumn: { B: 0, I: 0, N: 0, G: 0, O: 0 }, even: 0, odd: 0, prime: 0 };
    favoriteNumbersList.forEach(num => {
      const col = getColumnForNumber(num);
      stats.byColumn[col]++;
      if (num % 2 === 0) stats.even++;
      else stats.odd++;
      if (isPrime(num)) stats.prime++;
    });
    return stats;
  }, [favoriteNumbersList, getColumnForNumber, isPrime]);

  const getFilteredNumbers = useCallback(() => {
    if (!searchTerm) return Array.from({ length: 75 }, (_, i) => i + 1);
    const term = searchTerm.toLowerCase();
    return Array.from({ length: 75 }, (_, i) => i + 1).filter(num => num.toString().includes(term) || getColumnForNumber(num).toLowerCase().includes(term) || (term === 'even' && num % 2 === 0) || (term === 'odd' && num % 2 === 1) || (term === 'prime' && isPrime(num)));
  }, [searchTerm, getColumnForNumber, isPrime]);

  const saveCurrentList = useCallback(() => {
    if (favoriteNumbersList.length === 0) { alert("No favorite numbers to save!"); return; }
    if (!currentListName.trim()) { alert("Please enter a name for this list"); return; }
    const newList = { id: Date.now(), name: currentListName, numbers: [...favoriteNumbersList], count: favoriteNumbersList.length, date: new Date().toLocaleString() };
    setFavoriteLists(prev => [...prev, newList]);
    setCurrentListName("");
    alert(`List "${currentListName}" saved successfully!`);
  }, [favoriteNumbersList, currentListName]);

  const loadFavoriteList = useCallback((list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  }, []);

  const deleteFavoriteList = useCallback((listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) { setFavoriteLists(prev => prev.filter(list => list.id !== listId)); }
  }, []);

  const updateListName = useCallback((listId, newName) => {
    setFavoriteLists(prev => prev.map(list => list.id === listId ? { ...list, name: newName } : list));
    setEditingListName(null);
  }, []);

  const exportFavoriteLists = useCallback(() => {
    const dataStr = JSON.stringify(favoriteLists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `favorite-lists-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  }, [favoriteLists]);

  const importFavoriteLists = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) { setFavoriteLists(prev => [...prev, ...imported]); alert(`Imported ${imported.length} lists successfully!`); }
        else { alert("Invalid file format"); }
      } catch (error) { alert("Error importing file"); }
    };
    reader.readAsText(file);
  }, []);

  const getPredefinedLists = useCallback(() => {
    return [
    { id: 'JAE LUCKY 48  NUMBER', name: 'JAE LUCKY 48 BALLS ', numbers: [ 1, 2, 4, 6, 7, 9, 10, 11, 13, 15, 21, 22, 23, 25, 26, 28, 29, 31, 33, 34, 38, 40, 41, 44, 45, 46, 48, 52, 53, 56, 57, 59, 60, 61, 62, 63, 64, 66, 68, 70, 72, 74 ], description: 'Numbers that spell BINGO' },
      { id: 'JUANNA LUCKY 48  NUMBER', name: 'JUANNA LUCKY 48  NUMBER', numbers: [1, 2, 4, 6, 7, 9, 11, 12, 15, 17, 18, 19, 20, 25, 28, 29, 32, 33, 34, 35, 38, 39, 40, 41, 42, 45, 47, 51, 53, 54, 55, 56, 58, 59, 60, 62, 65, 67, 68, 69, 71, 72, 74 ], description: 'Numbers that spell BINGO' },
      { id: 'CARLA LUCKY 48  NUMBER', name: 'CARLA LUCKY 48  NUMBER', numbers: [ 1, 2, 3, 5, 6, 9, 10, 11, 19, 20, 21, 22, 23, 24, 26, 32, 33, 39, 41, 43, 44, 48, 49, 51, 53, 54, 56, 57, 59, 61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72, 74, 75], description: 'Numbers that spell BINGO' },
     { id: ' CRISS LUCKY 48  NUMBER', name: 'CRISS LUCKY 48  NUMBER', numbers: [3, 4, 5, 8, 10, 11, 12, 13, 15, 17, 18, 20, 21, 24, 25, 28, 29, 31, 34, 36, 37, 39, 44, 45, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 63, 65, 67, 68, 69, 71, 72, 73, 75], description: 'Numbers that spell BINGO' },
     { id: ' BIMMBY  LUCKY 48  NUMBER', name: ' BIMBY LUCKY 48  NUMBER', numbers: [ 1, 3, 4, 6, 7, 10, 11, 12, 13, 17, 18, 21, 22, 25, 26, 27, 28, 30, 31, 33, 34, 38, 39, 42, 43, 45, 46, 47, 49, 50, 52, 58, 59, 64, 65, 66, 69, 70, 71, 72, 73,  ], description: 'Numbers that spell BINGO' },
     { id: 'NITOY LUCKY 40  NUMBER 3X 4X', name: 'NITOY LUCKY 40  NUMBER 3X 4X', numbers: [  4, 8,10, 12, 14, 15 , 16, 26, 29, 31, 32, 33, 35, 36, 37, 38, 41, 50, 54, 56, 59, 61, 62, 65, 66, 70, 71, 75,], description: 'Numbers that spell BINGO' },
       { id: 'NITOY LUCKY 40  NUMBER 3X', name: 'NITOY LUCKY 40  NUMBER 3X', numbers: [ 3, 10, 12, 14, 15 , 16, 26, 29, 31, 32, 33, 35, 36, 37, 38, 41, 50, 54, 56, 59, 61, 62, 65, 66, 70, 71, 75], description: 'Numbers that spell BINGO' },
    ];
  }, []);

  const loadPredefinedList = useCallback((list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  }, []);

  // Special function for X pattern - puts lucky numbers on the red parts (diagonals)
  const generateCardWithXPatternLuckyNumbers = useCallback((useFavorites = true) => {
    const card = [];
    const usedNumbers = new Set();
    const favorites = useFavorites && favoriteNumbersList.length > 0 ? favoriteNumbersList : [];
    
    // Create empty 5x5 grid
    for (let col = 0; col < 5; col++) {
      card.push(new Array(5).fill(null));
    }
    
    // X pattern cells: both diagonals (the RED parts)
    const xPatternCells = [];
    for (let i = 0; i < 5; i++) {
      xPatternCells.push([i, i]); // main diagonal
      xPatternCells.push([i, 4 - i]); // anti-diagonal
    }
    
    // First, fill ALL X pattern cells with favorite numbers (⭐ must be on red parts)
    for (const [col, row] of xPatternCells) {
      // Skip the center if it's FREE space
      if (col === 2 && row === 2) {
        card[col][row] = "FREE";
        continue;
      }
      
      const start = col * 15 + 1;
      let colPool = Array.from({ length: 15 }, (_, i) => start + i).filter(n => !usedNumbers.has(n));
      
      // For X pattern cells, prioritize favorites heavily (95% chance)
      let favoritesInCol = colPool.filter(n => favorites.includes(n));
      let nonFavoritesInCol = colPool.filter(n => !favorites.includes(n));
      
      let num;
      if (favoritesInCol.length > 0 && favorites.length > 0) {
        // 95% chance to use a favorite number on X pattern cells (⭐ on red parts)
        if (Math.random() * 100 < 95) {
          const randomIndex = Math.floor(Math.random() * favoritesInCol.length);
          num = favoritesInCol[randomIndex];
          favoritesInCol.splice(randomIndex, 1);
        } else if (nonFavoritesInCol.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonFavoritesInCol.length);
          num = nonFavoritesInCol[randomIndex];
          nonFavoritesInCol.splice(randomIndex, 1);
        } else {
          const randomIndex = Math.floor(Math.random() * favoritesInCol.length);
          num = favoritesInCol[randomIndex];
        }
      } else if (nonFavoritesInCol.length > 0) {
        const randomIndex = Math.floor(Math.random() * nonFavoritesInCol.length);
        num = nonFavoritesInCol[randomIndex];
        nonFavoritesInCol.splice(randomIndex, 1);
      } else {
        const randomIndex = Math.floor(Math.random() * colPool.length);
        num = colPool[randomIndex];
      }
      
      card[col][row] = num;
      usedNumbers.add(num);
    }
    
    // Then fill remaining cells (non-pattern cells)
    for (let col = 0; col < 5; col++) {
      const start = col * 15 + 1;
      const colPool = Array.from({ length: 15 }, (_, i) => start + i).filter(n => !usedNumbers.has(n));
      let favoritesInCol = colPool.filter(n => favorites.includes(n));
      let nonFavoritesInCol = colPool.filter(n => !favorites.includes(n));
      
      for (let row = 0; row < 5; row++) {
        if (card[col][row] !== null) continue;
        if (col === 2 && row === 2) {
          card[col][row] = "FREE";
          continue;
        }
        
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
        } else {
          const remainingPool = colPool.filter(n => !usedNumbers.has(n));
          if (remainingPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingPool.length);
            num = remainingPool[randomIndex];
          } else {
            num = colPool[Math.floor(Math.random() * colPool.length)];
          }
        }
        
        card[col][row] = num;
        if (num !== "FREE") usedNumbers.add(num);
      }
    }
    
    // Sort each column
    for (let col = 0; col < 5; col++) {
      const numbers = [];
      const freeIndex = card[col].findIndex(cell => cell === "FREE");
      
      for (let row = 0; row < 5; row++) {
        if (card[col][row] !== "FREE") {
          numbers.push(card[col][row]);
        }
      }
      
      numbers.sort((a, b) => a - b);
      
      let numberIndex = 0;
      for (let row = 0; row < 5; row++) {
        if (row === freeIndex && col === 2) {
          card[col][row] = "FREE";
        } else {
          card[col][row] = numbers[numberIndex++];
        }
      }
    }
    
    return card;
  }, [favoriteNumbersList, favoriteBias]);

  const generateCardWithPatternPrioritization = useCallback((patternId, useFavorites = true) => {
    const patternCells = getPatternCells(patternId);
    const card = [];
    const usedNumbers = new Set();
    const favorites = useFavorites && favoriteNumbersList.length > 0 ? favoriteNumbersList : [];
    
    // Create a 5x5 grid initially empty
    for (let col = 0; col < 5; col++) {
      card.push(new Array(5).fill(null));
    }
    
    // First, fill pattern cells with lucky/favorite numbers
    const patternCellsArray = Array.from(patternCells);
    
    for (const cellKey of patternCellsArray) {
      const [col, row] = cellKey.split(',').map(Number);
      // Skip the center FREE space
      if (col === 2 && row === 2) {
        card[col][row] = "FREE";
        continue;
      }
      
      const start = col * 15 + 1;
      let colPool = Array.from({ length: 15 }, (_, i) => start + i).filter(n => !usedNumbers.has(n));
      
      // Prioritize favorites for pattern cells (80% chance to use favorites)
      let favoritesInCol = colPool.filter(n => favorites.includes(n));
      let nonFavoritesInCol = colPool.filter(n => !favorites.includes(n));
      
      let num;
      if (favoritesInCol.length > 0 && Math.random() * 100 < 80) {
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
      } else {
        const randomIndex = Math.floor(Math.random() * colPool.length);
        num = colPool[randomIndex];
      }
      
      card[col][row] = num;
      usedNumbers.add(num);
    }
    
    // Then fill remaining cells (non-pattern cells)
    for (let col = 0; col < 5; col++) {
      const start = col * 15 + 1;
      const colPool = Array.from({ length: 15 }, (_, i) => start + i).filter(n => !usedNumbers.has(n));
      let favoritesInCol = colPool.filter(n => favorites.includes(n));
      let nonFavoritesInCol = colPool.filter(n => !favorites.includes(n));
      
      for (let row = 0; row < 5; row++) {
        if (card[col][row] !== null) continue;
        if (col === 2 && row === 2) {
          card[col][row] = "FREE";
          continue;
        }
        
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
        } else {
          const remainingPool = colPool.filter(n => !usedNumbers.has(n) && !favoritesInCol.includes(n) && !nonFavoritesInCol.includes(n));
          if (remainingPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingPool.length);
            num = remainingPool[randomIndex];
          } else {
            num = colPool[Math.floor(Math.random() * colPool.length)];
          }
        }
        
        card[col][row] = num;
        if (num !== "FREE") usedNumbers.add(num);
      }
    }
    
    // Sort each column
    for (let col = 0; col < 5; col++) {
      const numbers = [];
      const freeIndex = card[col].findIndex(cell => cell === "FREE");
      
      for (let row = 0; row < 5; row++) {
        if (card[col][row] !== "FREE") {
          numbers.push(card[col][row]);
        }
      }
      
      numbers.sort((a, b) => a - b);
      
      let numberIndex = 0;
      for (let row = 0; row < 5; row++) {
        if (row === freeIndex && col === 2) {
          card[col][row] = "FREE";
        } else {
          card[col][row] = numbers[numberIndex++];
        }
      }
    }
    
    return card;
  }, [favoriteNumbersList, favoriteBias, getPatternCells]);

  const generateCardWithFavoriteNumbers = useCallback((useFavorites = true) => {
    const card = [];
    const usedNumbers = new Set();
    const favorites = useFavorites && favoriteNumbersList.length > 0 ? favoriteNumbersList : [];
    for (let col = 0; col < 5; col++) {
      const colNumbers = [];
      const start = col * 15 + 1;
      let colPool = Array.from({ length: 15 }, (_, i) => start + i).filter(n => !usedNumbers.has(n));
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
        } else { break; }
        colNumbers.push(num);
        usedNumbers.add(num);
      }
      colNumbers.sort((a, b) => a - b);
      card.push(colNumbers);
    }
    card[2][2] = "FREE";
    return card;
  }, [favoriteNumbersList, favoriteBias]);

  const generateCardWithTargetPercentage = useCallback((targetPercentage, useFavorites = true, patternId = currentPattern) => {
    let bestCard = null, bestPercentage = 0;
    for (let attempt = 0; attempt < 100; attempt++) {
      let card;
      if (prioritizePatternCells && patternId === "x" && favoriteNumbersList.length > 0) {
        card = generateCardWithXPatternLuckyNumbers(useFavorites);
      } else if (prioritizePatternCells && patternId !== "blackout") {
        card = generateCardWithPatternPrioritization(patternId, useFavorites);
      } else {
        card = generateCardWithFavoriteNumbers(useFavorites);
      }
      const percentage = calculateWinPercentage(card, patternId);
      if (Math.abs(percentage - targetPercentage) < Math.abs(bestPercentage - targetPercentage)) {
        bestCard = card;
        bestPercentage = percentage;
      }
      if (Math.abs(percentage - targetPercentage) <= 5) {
        break;
      }
    }
    return bestCard || (prioritizePatternCells && patternId === "x" && favoriteNumbersList.length > 0
      ? generateCardWithXPatternLuckyNumbers(useFavorites)
      : prioritizePatternCells && patternId !== "blackout"
        ? generateCardWithPatternPrioritization(patternId, useFavorites)
        : generateCardWithFavoriteNumbers(useFavorites));
  }, [generateCardWithXPatternLuckyNumbers, generateCardWithPatternPrioritization, generateCardWithFavoriteNumbers, calculateWinPercentage, currentPattern, prioritizePatternCells, favoriteNumbersList.length]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    const count = Math.min(Math.max(numCardsInput, 1), CONSTANTS.MAX_CARDS);
    if (favoriteNumbers.trim() !== "") { parseFavoriteNumbers(); }
    
    setTimeout(() => {
      const newCards = [], percentages = [];
      const favoriteStats = { totalFavoriteNumbers: 0, cardsWithFavorites: 0, patternCellsFilled: 0 };
      const patternCells = getPatternCells(currentPattern);
      const patternCellCount = currentPattern === "x" ? 9 : patternCells.size;
      
      for (let i = 0; i < count; i++) {
        const useFavorites = favoriteNumbersList.length > 0 && (i % 3 !== 0);
        let card;
        
        // Special handling for X pattern with prioritizePatternCells enabled
        if (prioritizePatternCells && currentPattern === "x" && favoriteNumbersList.length > 0) {
          card = generateCardWithXPatternLuckyNumbers(useFavorites);
          
          // Count how many X pattern cells contain favorite numbers (⭐ on red parts)
          if (favoriteNumbersList.length > 0) {
            let patternFavorites = 0;
            // Check X pattern cells (both diagonals)
            for (let i = 0; i < 5; i++) {
              const cell1 = card[i][i];
              const cell2 = card[i][4 - i];
              if (cell1 !== "FREE" && cell1 !== "★" && favoriteNumbersList.includes(cell1)) patternFavorites++;
              if (cell2 !== "FREE" && cell2 !== "★" && favoriteNumbersList.includes(cell2)) patternFavorites++;
            }
            favoriteStats.patternCellsFilled += patternFavorites;
          }
        } else if (prioritizePatternCells && currentPattern !== "blackout" && patternCellCount > 0) {
          card = generateCardWithPatternPrioritization(currentPattern, useFavorites);
          
          // Count pattern cell favorites
          if (favoriteNumbersList.length > 0) {
            let patternFavorites = 0;
            for (const cellKey of patternCells) {
              const [col, row] = cellKey.split(',').map(Number);
              const cellValue = card[col]?.[row];
              if (cellValue && cellValue !== "FREE" && cellValue !== "★" && favoriteNumbersList.includes(cellValue)) {
                patternFavorites++;
              }
            }
            favoriteStats.patternCellsFilled += patternFavorites;
          }
        } else {
          card = generateCardWithTargetPercentage(targetWinPercentage, useFavorites);
        }
        
        newCards.push(card);
        
        if (favoriteNumbersList.length > 0) {
          const cardNumbers = card.flat().filter(n => n !== "FREE" && n !== "★");
          const favoriteCount = cardNumbers.filter(n => favoriteNumbersList.includes(n)).length;
          favoriteStats.totalFavoriteNumbers += Math.min(favoriteCount + 1, 24);
          if (favoriteCount > 0) favoriteStats.cardsWithFavorites++;
        }
        
        percentages.push(calculateWinPercentage(card, currentPattern));
      }
      
      setGeneratedCards(prev => [...prev, ...newCards]);
      setCardWinPercentages(prev => [...prev, ...percentages]);
      setFlippedCards({});
      setPinnedCards({});
      
      if (favoriteNumbersList.length > 0) {
        const avgPatternFavorites = prioritizePatternCells ? 
          (favoriteStats.patternCellsFilled / count).toFixed(1) : 0;
        const patternCellCountMsg = currentPattern === "x" ? 9 : getPatternCells(currentPattern).size;
        alert(`✅ Generated ${count} cards with favorite numbers!\n📊 Stats:\n- Favorite numbers: ${favoriteNumbersList.join(", ")}\n- Average favorites per card: ${(favoriteStats.totalFavoriteNumbers / count).toFixed(1)}/24\n- Cards with favorites: ${favoriteStats.cardsWithFavorites}/${count}\n${prioritizePatternCells ? `- ${currentPattern === "x" ? "X Pattern cells (⭐ on RED parts)" : "Pattern cells"} with favorites: ${avgPatternFavorites}/${patternCellCountMsg} ⭐` : ''}`);
      }
      setIsGenerating(false);
    }, 500);
  }, [numCardsInput, favoriteNumbers, parseFavoriteNumbers, favoriteNumbersList, generateCardWithXPatternLuckyNumbers, generateCardWithPatternPrioritization, generateCardWithTargetPercentage, targetWinPercentage, currentPattern, calculateWinPercentage, prioritizePatternCells, getPatternCells]);

  const selectRandomBallSafe = useCallback(() => {
    const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !highlightNumbers.includes(n));
    if (available.length === 0) { alert("All balls have been drawn in this round!"); return; }
    const randomBall = available[Math.floor(Math.random() * available.length)];
    toggleNumberSafe(randomBall);
  }, [highlightNumbers, toggleNumberSafe]);

  const handleManualNumberSubmitSafe = useCallback((e) => {
    e.preventDefault();
    const num = parseInt(manualNumberInput);
    if (isNaN(num)) { alert("Please enter a valid number"); return; }
    if (num < 1 || num > 75) { alert("Please enter a number between 1 and 75"); return; }
    toggleNumberSafe(num);
    setManualNumberInput("");
  }, [manualNumberInput, toggleNumberSafe]);

  const handleNewRound = useCallback(() => {
    if (highlightNumbers.length === 0) { alert("No numbers drawn in current round!"); return; }
    startNewRound();
  }, [highlightNumbers, startNewRound]);

  const handleReset = useCallback(() => { setHighlightNumbers([]); setFlippedCards({}); }, []);

  const togglePin = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    const key = `${section}-${cardIndex}`;
    setPinnedCards(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleCardFlip = useCallback((cardIndex, section) => {
    const key = `${section}-${cardIndex}`;
    if (editingCard !== key) { setFlippedCards(prev => ({ ...prev, [key]: !prev[key] })); }
  }, [editingCard]);

  const deleteCard = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${section === "myCards" ? "My" : "Generated"} card #${cardIndex + 1}?`)) {
      if (section === "myCards") { setMyCards(prev => prev.filter((_, idx) => idx !== cardIndex)); }
      else { setGeneratedCards(prev => prev.filter((_, idx) => idx !== cardIndex)); }
      const remap = (obj) => {
        const newObj = {};
        Object.keys(obj).forEach(key => {
          const [keySection, keyIndex] = key.split('-');
          const numKey = parseInt(keyIndex);
          if (keySection !== section) { newObj[key] = obj[key]; }
          else if (numKey < cardIndex) { newObj[key] = obj[key]; }
          else if (numKey > cardIndex) { newObj[`${section}-${numKey - 1}`] = obj[key]; }
        });
        return newObj;
      };
      setPinnedCards(remap);
      setFlippedCards(remap);
      setCardLabels(remap);
    }
  }, []);

  const startEdit = useCallback((card, cardIndex, section, e) => {
    e.stopPropagation();
    setEditingCard(`${section}-${cardIndex}`);
    setEditFormData(JSON.parse(JSON.stringify(card)));
    setValidationErrors({});
  }, []);

  const cancelEdit = useCallback((e) => { e.stopPropagation(); setEditingCard(null); setEditFormData(null); setValidationErrors({}); }, []);

  const updateCell = useCallback((col, row, value, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    let newValue = value;
    if (value === "FREE" || value === "★") {
      if (col === 2 && row === 2 && value === "FREE") { newValue = "FREE"; }
      else if (value === "★") { newValue = "★"; }
      else { alert(`FREE space is only allowed in the center of N column`); return; }
    } else {
      const num = parseInt(value);
      if (isNaN(num)) { alert("Please enter a valid number (1-75) or 'FREE' for center"); return; }
      if (num < 1 || num > 75) { alert("Please enter a number between 1 and 75"); return; }
      const [min, max] = CONSTANTS.COLUMN_RANGES[CONSTANTS.COLUMNS[col]];
      if (num < min || num > max) { alert(`${num} is not in column ${CONSTANTS.COLUMNS[col]} range (${min}-${max})`); return; }
      newValue = num;
    }
    setEditFormData(prev => { const newCard = [...prev]; newCard[col] = [...newCard[col]]; newCard[col][row] = newValue; return newCard; });
    setValidationErrors(prev => { const newErrors = { ...prev }; delete newErrors[`cell_${col}_${row}`]; return newErrors; });
  }, [editFormData]);

  const saveEdit = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    const errors = validateCard(editFormData);
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); alert(`Card validation failed:\n${Object.values(errors).join('\n')}`); return; }
    if (section === "myCards") { setMyCards(prev => { const newCards = [...prev]; newCards[cardIndex] = editFormData; return newCards; }); }
    else { setGeneratedCards(prev => { const newCards = [...prev]; newCards[cardIndex] = editFormData; return newCards; }); }
    setEditingCard(null); setEditFormData(null); setValidationErrors({});
    alert(`✅ Card saved successfully!`);
  }, [editFormData, validateCard]);

  const saveCard = useCallback((card, cardIndex, section, e) => {
    e.stopPropagation();
    const cardType = section === "myCards" ? "MY" : "GEN";
    const savedCard = { id: Date.now() + cardIndex, card: JSON.parse(JSON.stringify(card)), serial: formatSerial(cardIndex, cardType), label: getCardLabel(cardIndex, section), section, date: new Date().toLocaleString(), patterns: checkAllPatterns(card) };
    setSavedCards(prev => [...prev, savedCard]);
    alert(`Card saved to collection!`);
  }, [formatSerial, getCardLabel, checkAllPatterns]);

  const loadSavedCard = useCallback((savedCard) => {
    if (savedCard.section === "myCards") { setMyCards(prev => [...prev, savedCard.card]); }
    else { setGeneratedCards(prev => [...prev, savedCard.card]); }
    setShowSavedCards(false);
  }, []);

  const deleteSavedCard = useCallback((savedCardId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved card?")) { setSavedCards(prev => prev.filter(card => card.id !== savedCardId)); }
  }, []);

  const recordBingoResult = useCallback(() => {
    const allCards = [...myCards, ...generatedCards];
    if (allCards.length === 0) { alert("Please add some cards first!"); return; }
    const patternWinners = winners[currentPattern] || [];
    if (patternWinners.length === 0) { alert(`No winners yet for the ${currentPattern} pattern!`); return; }
    const pattern = PATTERNS.find(p => p.id === currentPattern);
    const result = { id: Date.now(), timestamp: new Date().toLocaleString(), pattern: currentPattern, patternIcon: pattern.icon, patternName: pattern.label, ballsDrawn: [...highlightNumbers].sort((a, b) => a - b), ballsDrawnCount: highlightNumbers.length, totalCards: allCards.length, winners: patternWinners.map(idx => { const isMyCard = idx < myCards.length; const section = isMyCard ? "myCards" : "generated"; const cardIndex = isMyCard ? idx : idx - myCards.length; return { cardIndex: idx, section, sectionIndex: cardIndex, serial: formatSerial(cardIndex, isMyCard ? "MY" : "GEN"), label: getCardLabel(cardIndex, section), card: isMyCard ? myCards[cardIndex] : generatedCards[cardIndex], winPercentage: calculateWinPercentage(isMyCard ? myCards[cardIndex] : generatedCards[cardIndex], currentPattern), winningPatterns: checkAllPatterns(isMyCard ? myCards[cardIndex] : generatedCards[cardIndex]) }; }), winnerCount: patternWinners.length, notes: "" };
    setGameResults(prev => [...prev, result]);
    setGameHistory(prev => [{ id: result.id, timestamp: result.timestamp, pattern: result.pattern, patternIcon: result.patternIcon, winnerCount: result.winnerCount, ballsDrawn: result.ballsDrawnCount }, ...prev]);
    setCurrentGameResult(result);
    setShowResults(true);
  }, [myCards, generatedCards, winners, currentPattern, highlightNumbers, formatSerial, getCardLabel, calculateWinPercentage, checkAllPatterns]);

  const saveGameResult = useCallback((resultId, notes) => {
    setGameResults(prev => prev.map(result => result.id === resultId ? { ...result, notes, saved: true } : result));
    alert("Game result saved successfully!");
  }, []);

  const deleteGameResult = useCallback((resultId) => {
    if (window.confirm("Are you sure you want to delete this game result?")) {
      setGameResults(prev => prev.filter(r => r.id !== resultId));
      setGameHistory(prev => prev.filter(h => h.id !== resultId));
      if (currentGameResult?.id === resultId) { setCurrentGameResult(null); setShowResults(false); }
    }
  }, [currentGameResult]);

  const exportResults = useCallback(() => {
    const dataStr = JSON.stringify(gameResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `bingo-results-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  }, [gameResults]);

  const calculateStatistics = useCallback(() => {
    if (gameResults.length === 0) return null;
    const stats = { totalGames: gameResults.length, averageBallsToWin: Math.round(gameResults.reduce((acc, r) => acc + r.ballsDrawnCount, 0) / gameResults.length), mostWinningPattern: "", patternStats: {}, averageWinnersPerGame: (gameResults.reduce((acc, r) => acc + r.winnerCount, 0) / gameResults.length).toFixed(1) };
    const patternCounts = {};
    gameResults.forEach(result => {
      if (!stats.patternStats[result.pattern]) { stats.patternStats[result.pattern] = { count: 0, totalWinners: 0, icon: result.patternIcon, name: result.patternName }; }
      stats.patternStats[result.pattern].count++;
      stats.patternStats[result.pattern].totalWinners += result.winnerCount;
      patternCounts[result.pattern] = (patternCounts[result.pattern] || 0) + 1;
    });
    let maxCount = 0;
    Object.entries(patternCounts).forEach(([pattern, count]) => { if (count > maxCount) { maxCount = count; stats.mostWinningPattern = stats.patternStats[pattern]?.name || pattern; } });
    return stats;
  }, [gameResults]);

  const favoriteStats = useMemo(() => getFavoriteStats(), [getFavoriteStats]);
  const filteredNumbers = useMemo(() => getFilteredNumbers(), [getFilteredNumbers]);
  const stats = useMemo(() => calculateStatistics(), [calculateStatistics]);
  const roundComparison = useMemo(() => getRoundComparison(), [roundHistory, getRoundComparison]);
  const numberFrequency = useMemo(() => getNumberFrequencyAcrossRounds(), [getNumberFrequencyAcrossRounds]);

  const getRankedCards = useCallback((cards, section) => {
    return cards.map((card, idx) => {
      const key = `${section}-${idx}`;
      return { card, idx, section, key, label: getCardLabel(idx, section), isWinner: winners[currentPattern]?.includes(section === "myCards" ? idx : myCards.length + idx) || false, score: getCardScore(card), progress: ((25 - getCardScore(card)) / 24) * 100, winPercentage: calculateWinPercentage(card, currentPattern), winningPatterns: checkAllPatterns(card), isPinned: pinnedCards[key] || false, favoriteCount: favoriteNumbersList.length > 0 ? card.flat().filter(n => n !== "FREE" && n !== "★" && favoriteNumbersList.includes(n)).length : 0 };
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isWinner && !b.isWinner) return -1;
      if (!a.isWinner && b.isWinner) return 1;
      return a.score - b.score;
    });
  }, [winners, currentPattern, getCardLabel, getCardScore, calculateWinPercentage, checkAllPatterns, pinnedCards, favoriteNumbersList, myCards.length]);

  const myRankedCards = useMemo(() => getRankedCards(myCards, "myCards"), [myCards, getRankedCards]);
  const generatedRankedCards = useMemo(() => getRankedCards(generatedCards, "generated"), [generatedCards, getRankedCards]);

  const topWinner = useMemo(() => {
    const allRanked = [...myRankedCards, ...generatedRankedCards].sort((a, b) => a.score - b.score);
    return allRanked[0];
  }, [myRankedCards, generatedRankedCards]);

  const hasCellError = useCallback((col, row) => validationErrors[`cell_${col}_${row}`] || validationErrors[`col_${col}`], [validationErrors]);

  const styles = {
    container: { minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    header: { background: "rgba(255, 255, 255, 0.95)", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", position: "sticky", top: 0, zIndex: 100 },
    headerContent: { maxWidth: "1400px", margin: "0 auto", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" },
    title: { margin: 0, fontSize: "1.8rem", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    headerButtons: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
    profileButton: { padding: "0.5rem 1rem", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" },
    backButton: { padding: "0.5rem 1rem", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
    savedButton: { padding: "0.5rem 1rem", background: "#ffd700", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
    resultsButton: { padding: "0.5rem 1rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
    historyButton: { padding: "0.5rem 1rem", background: "#2196F3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
    roundFrequencyButton: { padding: "0.5rem 1rem", background: "#9C27B0", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
    roundHistoryButton: { padding: "0.5rem 1rem", background: "#FF9800", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", position: "relative" },
    main: { maxWidth: "1400px", margin: "0 auto", padding: "2rem" },
    patternSelector: { display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center" },
    patternButton: (isActive) => ({ display: "flex", alignItems: "center", gap: "0.5rem", padding: "1rem 2rem", border: "none", borderRadius: "12px", background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", color: isActive ? "white" : "black", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", cursor: "pointer", fontSize: "1rem", transition: "all 0.3s ease", position: "relative" }),
    controlsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" },
    controlCard: { background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    inputGroup: { marginBottom: "1rem" },
    label: { display: "block", marginBottom: "0.5rem", color: "#666", fontSize: "0.9rem", fontWeight: "500" },
    input: { width: "100%", padding: "0.5rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box" },
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
    newRoundButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#ff9800", color: "white", fontSize: "1rem", cursor: "pointer", marginBottom: "0.5rem", fontWeight: "bold" },
    recordResultButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#9C27B0", color: "white", fontSize: "1rem", cursor: "pointer", marginBottom: "0.5rem", fontWeight: "bold" },
    resetButton: { width: "100%", padding: "0.75rem", border: "none", borderRadius: "8px", background: "#ff4757", color: "white", fontSize: "1rem", cursor: "pointer" },
    roundHistorySection: { background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" },
    roundHistoryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" },
    roundHistoryTitle: { margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" },
    roundHistoryControls: { display: "flex", gap: "0.5rem" },
    roundTabs: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", maxHeight: "100px", overflowY: "auto", padding: "0.5rem", background: "#f5f5f5", borderRadius: "8px" },
    roundTab: (isActive) => ({ padding: "0.5rem 1rem", background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", color: isActive ? "white" : "#333", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "0.9rem", fontWeight: isActive ? "bold" : "normal", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }),
    roundDetail: { background: "#f8f9fa", borderRadius: "12px", padding: "1.5rem" },
    roundDetailHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" },
    roundStatsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
    roundStatCard: { background: "white", padding: "1rem", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
    roundStatValue: { fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" },
    roundStatLabel: { fontSize: "0.8rem", color: "#666" },
    roundNumbersGrid: { display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "0.25rem", marginTop: "1rem", marginBottom: "1rem" },
    roundNumberItem: (isFavorite) => ({ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", border: isFavorite ? "2px solid #ffd700" : "none", padding: "0.25rem" }),
    roundNumberEmpty: { aspectRatio: "1", background: "#e0e0e0", borderRadius: "4px" },
    roundColumnStats: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginTop: "1rem" },
    roundColumnStat: { padding: "0.5rem", background: "white", borderRadius: "8px", textAlign: "center" },
    comparisonSection: { marginTop: "1.5rem", padding: "1rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", color: "white" },
    comparisonGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" },
    comparisonItem: { background: "rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "8px" },
    autoAdvanceToggle: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "8px" },
    roundFrequencySection: { background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" },
    roundFrequencyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" },
    roundFrequencyTitle: { margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" },
    roundStats: { display: "flex", gap: "1rem", flexWrap: "wrap", background: "#f5f5f5", padding: "0.75rem 1rem", borderRadius: "40px" },
    roundStat: { display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" },
    roundFrequencyGrid: { display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "0.5rem", marginBottom: "1rem" },
    roundFrequencyItem: (count, isSelected, isFavorite) => ({ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: isSelected ? "#ffeb3b" : count > 0 ? "#e8f4fd" : "white", border: isFavorite ? "2px solid #ffd700" : count > 0 ? "2px solid #667eea" : "2px solid #e0e0e0", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: count > 0 ? "bold" : "normal", color: count > 0 ? "#333" : "#999", position: "relative" }),
    frequencyBadge: { fontSize: "0.6rem", background: "#667eea", color: "white", padding: "0.1rem 0.3rem", borderRadius: "10px", marginTop: "0.1rem" },
    selectedNumberDetail: { marginTop: "1rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px", border: "2px solid #667eea" },
    columnLegend: { display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "center" },
    legendItem: (color) => ({ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", padding: "0.25rem 0.75rem", background: "white", borderRadius: "20px", borderLeft: `4px solid ${color}` }),
    ballsSection: { background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" },
    ballsGrid: { display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "0.5rem" },
    ball: (active) => ({ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: active ? "#ffeb3b" : "white", border: active ? "2px solid #fbc02d" : "2px solid #e0e0e0", borderRadius: "50%", cursor: "pointer", fontSize: "0.8rem", padding: "0.25rem", position: "relative" }),
    favoriteBall: { border: "2px solid #ffd700", boxShadow: "0 0 10px rgba(255,215,0,0.5)" },
    cardSectionTabs: { display: "flex", gap: "1rem", marginBottom: "2rem", justifyContent: "center" },
    cardSectionTab: (isActive) => ({ padding: "1rem 2rem", border: "none", borderRadius: "12px", background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", color: isActive ? "white" : "#333", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.3s ease" }),
    cardsContainer: { display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(350px, 1fr))" : "1fr", gap: "1.5rem" },
    cardContainer: { perspective: "1000px", height: "auto", cursor: "pointer", position: "relative" },
    cardInner: (isFlipped) => ({ position: "relative", width: "100%", height: "100%", transition: "transform 0.6s", transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }),
    cardFront: { position: "relative", width: "100%", height: "100%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" },
    cardBack: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", padding: "1rem", boxSizing: "border-box", display: "flex", flexDirection: "column", border: "2px solid #ffd700", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
    bingoCard: (isWinner, isPinned, hasFavorites) => ({ background: "white", border: isWinner ? "4px solid #ff4757" : isPinned ? "4px solid #ffd700" : "2px solid #333", borderRadius: "12px", padding: "1.5rem 1rem", transition: "all 0.3s ease", width: "100%", height: "100%", boxSizing: "border-box", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", overflow: "visible" }),
    cardLabel: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", padding: "0.5rem", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", borderRadius: "8px", fontSize: "0.9rem", cursor: "pointer" },
    labelEmoji: { fontSize: "1.2rem" },
    labelName: { fontWeight: "bold", flex: 1 },
    labelEditIcon: { opacity: 0.5, fontSize: "0.8rem" },
    bingoHeader: { display: "flex", justifyContent: "space-around", marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: "bold", color: "#333", borderBottom: "2px solid #333", paddingBottom: "0.5rem" },
    bingoLetter: { width: "40px", textAlign: "center" },
    bingoGrid: { display: "flex", flexDirection: "column", gap: "0.24rem", marginBottom: "0.5rem", overflow: "visible" },
    bingoRow: { display: "flex", justifyContent: "space-around", overflow: "visible" },
    bingoCell: (isHighlighted, isFree, isFavorite, hasError, isPatternCell) => ({
      width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center",
      border: hasError ? "3px solid #ff4757" : (isFavorite ? "2px solid #ffd700" : "1px solid #333"),
      borderRadius: "4px",
      background: isFree ? "#f0f0f0"
        : (isPatternCell && isHighlighted) ? "#2196F3"
        : isHighlighted ? "#ffeb3b"
        : isPatternCell ? "#ff4757"
        : "white",
      fontWeight: "bold", fontSize: isFree ? "1.2rem" : "1rem", cursor: "default", position: "relative",
      color: (isPatternCell && !isFree) ? "white" : "#333",
      overflow: "visible"
    }),
    favoriteStar: { position: "absolute", top: "-10px", right: "-10px", fontSize: "1.2rem", filter: "drop-shadow(0 0 4px rgba(255,180,0,1))", lineHeight: 1 },
    editInput: (hasError) => ({ width: "40px", height: "40px", textAlign: "center", border: hasError ? "3px solid #ff4757" : "2px solid #667eea", borderRadius: "4px", fontSize: "1rem", outline: "none", background: hasError ? "#fff5f5" : "white" }),
    cardActions: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", gap: "0.5rem", zIndex: 20, background: "rgba(255, 255, 255, 0.95)", padding: "0.75rem 1rem", borderRadius: "40px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", border: "2px solid #667eea", opacity: 0, transition: "opacity 0.3s ease", pointerEvents: "none" },
    actionButton: { width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", pointerEvents: "auto" },
    pinButton: (isPinned) => ({ background: isPinned ? "#ffd700" : "white", color: isPinned ? "white" : "#333", border: isPinned ? "2px solid #ffd700" : "2px solid #e0e0e0" }),
    editButton: { background: "#667eea", color: "white", border: "2px solid #667eea" },
    deleteButton: { background: "#ff4757", color: "white", border: "2px solid #ff4757" },
    saveButton: { background: "#4CAF50", color: "white", border: "2px solid #4CAF50" },
    cancelButton: { background: "#999", color: "white", border: "2px solid #999" },
    labelButton: { background: "#ffd700", color: "#333", border: "2px solid #ffd700" },
    flipHint: { position: "absolute", bottom: "5px", right: "5px", fontSize: "0.7rem", color: "#999", background: "rgba(255,255,255,0.8)", padding: "2px 5px", borderRadius: "10px", zIndex: 10 },
    patternsList: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", overflowY: "auto", maxHeight: "250px", padding: "0.5rem" },
    patternItem: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", background: "white", borderRadius: "8px", fontSize: "0.9rem", borderLeft: "4px solid #ffd700", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", cursor: "pointer" },
    backHeader: { textAlign: "center", marginBottom: "1rem", fontWeight: "bold", color: "white", fontSize: "1.1rem", borderBottom: "2px solid #ffd700", paddingBottom: "0.5rem" },
    noPatterns: { textAlign: "center", color: "rgba(255,255,255,0.7)", fontStyle: "italic", padding: "2rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" },
    cardNumber: { position: "absolute", top: "5px", left: "5px", fontSize: "0.8rem", color: "white", background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "10px", zIndex: 20 },
    patternCount: { background: "#ffd700", color: "#333", borderRadius: "12px", padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold", marginLeft: "auto" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalContent: { background: "white", borderRadius: "16px", padding: "2rem", maxWidth: "800px", width: "90%", maxHeight: "80vh", overflowY: "auto" },
    profileModal: { background: "white", borderRadius: "24px", padding: "2rem", maxWidth: "500px", width: "90%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
    profileHeader: { textAlign: "center", marginBottom: "2rem" },
    profileAvatar: { fontSize: "4rem", marginBottom: "1rem" },
    profileName: { fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" },
    profileLevel: { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", display: "inline-block", padding: "0.3rem 1rem", borderRadius: "20px", fontSize: "0.9rem", marginBottom: "1rem" },
    profileStats: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "2rem" },
    profileStat: { background: "#f5f5f5", padding: "1rem", borderRadius: "12px", textAlign: "center" },
    profileStatValue: { fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" },
    profileStatLabel: { fontSize: "0.9rem", color: "#666" },
    profileFooter: { borderTop: "1px solid #e0e0e0", paddingTop: "1rem", textAlign: "center", color: "#999" },
    labelModal: { background: "white", borderRadius: "24px", padding: "2rem", maxWidth: "400px", width: "90%" },
    emojiPicker: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.5rem", marginBottom: "1rem", padding: "1rem", background: "#f5f5f5", borderRadius: "12px" },
    emojiOption: { fontSize: "1.5rem", padding: "0.5rem", textAlign: "center", cursor: "pointer", borderRadius: "8px" },
    savedCardsModal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    savedCardsContent: { background: "white", borderRadius: "16px", padding: "2rem", maxWidth: "800px", width: "90%", maxHeight: "80vh", overflowY: "auto" },
    savedCardItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer" },
    savedCardInfo: { flex: 1 },
    savedCardDate: { fontSize: "0.8rem", color: "#999" },
    savedCardPatterns: { display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.3rem" },
    savedCardPatternTag: { background: "#667eea", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.7rem" },
    closeButton: { padding: "0.5rem 1rem", background: "#ff4757", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "1rem" },
    exportButton: { padding: "0.5rem 1rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginLeft: "0.5rem" },
    resultItem: { padding: "1rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer" },
    resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
    winnerBadge: { background: "#ff4757", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" },
    noteInput: { width: "100%", padding: "0.5rem", border: "1px solid #e0e0e0", borderRadius: "8px", marginTop: "0.5rem", marginBottom: "0.5rem" },
    statsContainer: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "1.5rem", borderRadius: "16px", marginBottom: "1rem", color: "white" },
    statsGridMain: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" },
    statBox: { background: "rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "12px", textAlign: "center" },
    historyItem: { padding: "1rem", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
    historyPattern: { display: "flex", alignItems: "center", gap: "0.5rem" }
  };

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .card-container:hover .card-actions { opacity: 1 !important; }
      .action-button:hover { transform: scale(1.1) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; }
      .number-button:hover { transform: scale(1.1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
      .column-button:hover { background: #667eea; color: white; }
      .list-item:hover { background: #f5f5f5; }
      .card-label:hover { background: linear-gradient(135deg, #e0e7ff 0%, #d1d5ff 100%) !important; }
      .round-frequency-item:hover { transform: scale(1.1); z-index: 10; }
      .round-tab:hover { transform: translateY(-2px); }
      .card-section-tab:hover { transform: translateY(-2px); }
      .win-chance-row:hover { background: #f0f4ff !important; }
      .win-chance-pattern-btn:hover { opacity: 0.85; transform: scale(1.03); }
    `;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  const WinChancePreview = () => {
    const topPattern = winChanceData[0];
    const hasContext = favoriteNumbersList.length > 0 || highlightNumbers.length > 0;

    return (
      <div style={{ marginTop: "1rem", marginBottom: "0.5rem", background: "#f0f4ff", borderRadius: "12px", padding: "1rem", border: "2px solid #667eea" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#333", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            🏆 Win Chance by Pattern
          </h4>
          {topPattern && hasContext && (
            <span style={{ fontSize: "0.8rem", background: topPattern.color, color: "white", padding: "0.2rem 0.6rem", borderRadius: "20px", fontWeight: "bold" }}>
              Best: {topPattern.icon} {topPattern.label}
            </span>
          )}
        </div>

        {!hasContext && (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#888", textAlign: "center", padding: "0.5rem 0" }}>
            Select favorite numbers or draw balls to see your win chances per pattern.
          </p>
        )}

        {hasContext && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {winChanceData.map((p) => (
                <div
                  key={p.id}
                  className="win-chance-row"
                  onClick={() => { setWinChancePreviewPattern(p.id); setCurrentPattern(p.id); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.4rem 0.6rem", borderRadius: "8px",
                    background: winChancePreviewPattern === p.id ? "#e0e7ff" : "white",
                    border: winChancePreviewPattern === p.id ? "2px solid #667eea" : "1px solid #e0e0e0",
                    cursor: "pointer", transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ fontSize: "1rem", minWidth: "20px" }}>{p.icon}</span>
                  <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: winChancePreviewPattern === p.id ? "bold" : "normal", color: "#333" }}>{p.label}</span>
                  <div style={{ flex: 2, height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.score}%`, background: p.color, borderRadius: "4px", transition: "width 0.4s ease" }} />
                  </div>
                  <span style={{ minWidth: "38px", textAlign: "right", fontSize: "0.8rem", fontWeight: "bold", color: p.color }}>{p.score}%</span>
                </div>
              ))}
            </div>

            {winChancePreviewPattern && (
              <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.75rem", background: "white", borderRadius: "8px", border: "1px solid #c7d2fe", fontSize: "0.82rem", color: "#555" }}>
                {(() => {
                  const sel = winChanceData.find(p => p.id === winChancePreviewPattern);
                  return sel ? <span>💡 <strong>{sel.icon} {sel.label}:</strong> {sel.detail}</span> : null;
                })()}
              </div>
            )}

            <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#888", textAlign: "center" }}>
              Click a row to set it as the active pattern for card generation
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎯 Bingo Pattern Analyzer</h1>
          <div style={styles.headerButtons}>
            <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>
              <span>{profileData.avatar}</span><span>{profileData.name}</span>
            </button>
            <button onClick={() => setShowRoundFrequency(!showRoundFrequency)} style={styles.roundFrequencyButton}>
              📊 Round Frequency {showRoundFrequency ? '▼' : '▶'}
              {roundFrequency.length > 0 && (<span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold" }}>R{currentRound}</span>)}
            </button>
            <button onClick={() => setShowRoundHistory(!showRoundHistory)} style={styles.roundHistoryButton}>
              📜 Round History {showRoundHistory ? '▼' : '▶'}
              {roundHistory.length > 0 && (<span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold" }}>{roundHistory.length}</span>)}
            </button>
            <button onClick={() => setShowHistory(true)} style={styles.historyButton}>📜 History ({gameHistory.length})</button>
            <button onClick={() => setShowResults(true)} style={styles.resultsButton}>🏆 Results ({gameResults.length})</button>
            <button onClick={() => setShowSavedCards(true)} style={styles.savedButton}>💾 Saved Cards ({savedCards.length})</button>
            <button onClick={goBack} style={styles.backButton}>← Back</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.patternSelector}>
          {PATTERNS.map((pattern) => (
            <button key={pattern.id} onClick={() => setCurrentPattern(pattern.id)} style={styles.patternButton(currentPattern === pattern.id)}>
              <span>{pattern.icon}</span><span>{pattern.label}</span>
              {winners[pattern.id]?.length > 0 && (<span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold" }}>{winners[pattern.id].length}</span>)}
            </button>
          ))}
        </div>

        <div style={styles.controlsGrid}>
          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 1rem 0" }}>📋 Card Generation</h3>
            
            {/* Pattern Prioritization Toggle */}
            <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#f0f4ff", borderRadius: "12px", border: "2px solid #667eea" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={prioritizePatternCells} 
                    onChange={(e) => setPrioritizePatternCells(e.target.checked)} 
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "bold", color: "#667eea" }}>
                    {currentPattern === "x" ? "❌ Place Lucky Numbers on X Pattern (RED Parts) ⭐" : "🎯 Prioritize Lucky Numbers on Pattern Cells"}
                  </span>
                </label>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  {PATTERNS.find(p => p.id === currentPattern)?.icon} {PATTERNS.find(p => p.id === currentPattern)?.label}
                </span>
              </div>
              <p style={{ margin: "0", fontSize: "0.8rem", color: "#666" }}>
                {currentPattern === "x" 
                  ? "Your favorite numbers (⭐) will be placed on the X pattern cells (the red parts of the card) for maximum win chance! (95% priority)"
                  : `When enabled, your favorite numbers will be placed primarily on the ${PATTERNS.find(p => p.id === currentPattern)?.label} pattern cells for higher win probability`}
              </p>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Number of Cards</label>
              <input type="number" value={numCardsInput} onChange={(e) => setNumCardsInput(Number(e.target.value))} min="1" max={CONSTANTS.MAX_CARDS} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Favored Balls Range</label>
              <input type="number" value={ballsCalledInput} onChange={(e) => setBallsCalledInput(Number(e.target.value))} min="1" max="75" style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Win %</label>
              <input type="number" value={targetWinPercentage} onChange={(e) => setTargetWinPercentage(Number(e.target.value))} min="0" max="100" style={styles.input} />
            </div>

            <div style={styles.favoriteNumbersContainer}>
              <div style={styles.favoriteHeader} onClick={() => setShowNumberSelector(!showNumberSelector)}>
                <h4 style={styles.favoriteTitle}>⭐ Favorite Numbers (1-75)</h4>
                <button style={styles.toggleButton}>{showNumberSelector ? "▼" : "▶"} Select</button>
              </div>
              <div style={styles.columnSelector}>
                {['B','I','N','G','O'].map(col => (
                  <button key={col} onClick={() => selectAllInColumn(col)} style={styles.columnButton}>{col} ({CONSTANTS.COLUMN_RANGES[col][0]}-{CONSTANTS.COLUMN_RANGES[col][1]})</button>
                ))}
              </div>
              <input type="text" placeholder="🔍 Search numbers (e.g., 7, even, odd, prime)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              {showNumberSelector && (
                <div style={styles.numberSelectorGrid}>
                  {filteredNumbers.map((num) => (
                    <div key={num} onClick={() => toggleFavoriteNumberFixed(num)} style={styles.numberButton(favoriteNumbersList.includes(num))} className="number-button">{num}</div>
                  ))}
                </div>
              )}
              {favoriteNumbersList.length > 0 && (
                <div style={styles.favoriteStats}>
                  <div><strong>Selected favorites:</strong> {favoriteNumbersList.join(", ")}</div>
                  <div><strong>Count:</strong> {favoriteNumbersList.length} numbers</div>
                  <div style={styles.statsGrid}>
                    {['B','I','N','G','O'].map(col => (<div key={col} style={styles.statItem}><div>{col}: {favoriteStats.byColumn[col]}</div></div>))}
                    <div style={styles.statItem}><div>Even: {favoriteStats.even}</div></div>
                    <div style={styles.statItem}><div>Odd: {favoriteStats.odd}</div></div>
                    <div style={styles.statItem}><div>Prime: {favoriteStats.prime}</div></div>
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <label style={{ marginRight: "0.5rem" }}>Bias: {favoriteBias}%</label>
                    <input type="range" min="0" max="100" value={favoriteBias} onChange={(e) => setFavoriteBias(parseInt(e.target.value))} style={{ width: "100%" }} />
                  </div>
                  <button onClick={clearFavorites} style={{ marginTop: "0.5rem", padding: "0.2rem 0.5rem", background: "#ff4757", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Clear All</button>
                </div>
              )}
              {favoriteNumbersList.length === 0 && (<p style={{ color: "#999", fontSize: "0.9rem", textAlign: "center" }}>Click on numbers above to select favorites</p>)}

              <div style={styles.favoriteListsSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h5 style={{ margin: 0 }}>📋 Favorite Lists</h5>
                  <button onClick={() => setShowFavoriteLists(!showFavoriteLists)} style={styles.smallButton}>{showFavoriteLists ? "▼" : "▶"} Manage</button>
                </div>
                {showFavoriteLists && (
                  <>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      <input type="text" placeholder="List name" value={currentListName} onChange={(e) => setCurrentListName(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                      <button onClick={saveCurrentList} style={styles.smallButton}>Save</button>
                    </div>
                    <h6 style={{ margin: "0.5rem 0", color: "#666" }}>Predefined Lists</h6>
                    {getPredefinedLists().map(list => (
                      <div key={list.id} className="list-item" style={styles.listItem}>
                        <div onClick={() => loadPredefinedList(list)}>
                          <div style={styles.listName}>{list.name}</div>
                          <div style={styles.listDetails}>{list.numbers.length} numbers • {list.description}</div>
                        </div>
                      </div>
                    ))}
                    {favoriteLists.length > 0 && (
                      <>
                        <h6 style={{ margin: "0.5rem 0", color: "#666" }}>My Saved Lists</h6>
                        {favoriteLists.map(list => (
                          <div key={list.id} className="list-item" style={styles.listItem}>
                            <div onClick={() => loadFavoriteList(list)} style={{ flex: 1 }}>
                              {editingListName === list.id ? (
                                <input type="text" defaultValue={list.name} onBlur={(e) => updateListName(list.id, e.target.value)} onKeyPress={(e) => e.key === 'Enter' && updateListName(list.id, e.target.value)} style={styles.input} autoFocus />
                              ) : (<div style={styles.listName}>{list.name}</div>)}
                              <div style={styles.listDetails}>{list.numbers.length} numbers • {list.date}</div>
                            </div>
                            <div style={styles.listActions}>
                              <button onClick={() => setEditingListName(list.id)} style={{...styles.smallButton, background: "#667eea"}}>✏️</button>
                              <button onClick={() => deleteFavoriteList(list.id)} style={{...styles.smallButton, background: "#ff4757"}}>🗑️</button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <button onClick={exportFavoriteLists} style={{...styles.smallButton, background: "#4CAF50"}}>📤 Export</button>
                      <label style={{...styles.smallButton, background: "#2196F3", cursor: "pointer"}}>
                        📥 Import
                        <input type="file" accept=".json" onChange={importFavoriteLists} style={{ display: "none" }} />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            <WinChancePreview />

            <button onClick={handleGenerate} disabled={isGenerating} style={{ ...styles.generateButton, opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? "not-allowed" : "pointer" }}>
              {isGenerating ? "Generating..." : `🎲 Generate Cards for ${PATTERNS.find(p => p.id === currentPattern)?.icon || ""} ${PATTERNS.find(p => p.id === currentPattern)?.label || currentPattern}`}
            </button>
          </div>

          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 1rem 0" }}>🎱 Ball Draw</h3>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1rem" }}>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Drawn</span><span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{highlightNumbers.length}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Remaining</span><span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{75 - highlightNumbers.length}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Max/Round</span><span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{CONSTANTS.MAX_BALLS}</span></div>
            </div>
            <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", marginBottom: "1rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(highlightNumbers.length / CONSTANTS.MAX_BALLS) * 100}%`, background: "linear-gradient(90deg, #667eea, #764ba2)", transition: "width 0.3s ease" }} />
            </div>
            <div style={styles.autoAdvanceToggle}>
              <input type="checkbox" id="autoAdvance" checked={autoAdvanceRound} onChange={(e) => setAutoAdvanceRound(e.target.checked)} />
              <label htmlFor="autoAdvance">Auto-advance to next round at {CONSTANTS.MAX_BALLS} balls</label>
            </div>
            <button onClick={selectRandomBallSafe} style={styles.randomBallButton}>🎲 Draw Random Ball</button>
            <button onClick={handleNewRound} style={styles.newRoundButton}>🆕 Start New Round</button>
            <button onClick={recordBingoResult} style={styles.recordResultButton} disabled={!myCards.length && !generatedCards.length || winners[currentPattern]?.length === 0}>🏆 Record BINGO Result</button>
            <button onClick={handleReset} style={styles.resetButton}>🔄 Reset Highlights</button>
          </div>
        </div>

        {showRoundHistory && (
          <div style={styles.roundHistorySection}>
            <div style={styles.roundHistoryHeader}>
              <h3 style={styles.roundHistoryTitle}>
                📜 Round History (1-{CONSTANTS.MAX_ROUNDS})
                {roundHistory.length > 0 && (<span style={{ background: "#ff4757", color: "white", padding: "0.2rem 1rem", borderRadius: "20px", fontSize: "0.9rem" }}>{roundHistory.length} rounds completed</span>)}
              </h3>
              <div style={styles.roundHistoryControls}>
                {roundHistory.length > 0 && (
                  <>
                    <button onClick={exportRoundHistory} style={styles.exportButton}>📥 Export</button>
                    <button onClick={clearRoundHistory} style={{...styles.deleteButton, padding: "0.5rem 1rem", borderRadius: "8px"}}>🗑️ Clear All</button>
                  </>
                )}
              </div>
            </div>
            {roundHistory.length > 0 ? (
              <>
                <div style={styles.roundTabs}>
                  {roundHistory.map(round => (
                    <button key={round.roundNumber} onClick={() => setSelectedRound(round.roundNumber)} style={styles.roundTab(selectedRound === round.roundNumber)} className="round-tab">
                      Round {round.roundNumber}<span style={{ marginLeft: "0.25rem", fontSize: "0.7rem" }}>({round.ballCount})</span>
                    </button>
                  ))}
                </div>
                {selectedRound && roundStatsByRound[selectedRound] && (
                  <div style={styles.roundDetail}>
                    <div style={styles.roundDetailHeader}>
                      <h4>Round {selectedRound} Details</h4>
                      <span style={{ color: "#666" }}>{roundHistory.find(r => r.roundNumber === selectedRound)?.timestamp}</span>
                    </div>
                    <div style={styles.roundStatsGrid}>
                      <div style={styles.roundStatCard}><div style={styles.roundStatValue}>{roundStatsByRound[selectedRound].totalBalls}</div><div style={styles.roundStatLabel}>Balls Drawn</div></div>
                      <div style={styles.roundStatCard}><div style={styles.roundStatValue}>{roundStatsByRound[selectedRound].uniqueNumbers}</div><div style={styles.roundStatLabel}>Unique Numbers</div></div>
                      <div style={styles.roundStatCard}><div style={styles.roundStatValue}>{roundStatsByRound[selectedRound].mostFrequent?.number || '-'}</div><div style={styles.roundStatLabel}>Most Frequent ({roundStatsByRound[selectedRound].mostFrequent?.count || 0}x)</div></div>
                      <div style={styles.roundStatCard}><div style={styles.roundStatValue}>{roundStatsByRound[selectedRound].leastFrequent?.number || '-'}</div><div style={styles.roundStatLabel}>Least Frequent</div></div>
                    </div>
                    <h5 style={{ margin: "1rem 0 0.5rem 0" }}>Called Numbers</h5>
                    <div style={styles.roundNumbersGrid}>
                      {Array.from({ length: 75 }, (_, i) => i + 1).map(num => {
                        const isCalled = roundStatsByRound[selectedRound].numbers.includes(num);
                        const frequency = roundStatsByRound[selectedRound].frequency[num - 1] || 0;
                        const isFavorite = favoriteNumbersList.includes(num);
                        if (isCalled) {
                          return (<div key={num} style={{ ...styles.roundNumberItem(isFavorite), display: "flex", flexDirection: "column", padding: "0.25rem" }}>
                            <span>{num}</span>
                            {frequency > 1 && (<span style={{ fontSize: "0.5rem", background: "#ff4757", color: "white", padding: "0.1rem 0.2rem", borderRadius: "4px", marginTop: "0.1rem" }}>{frequency}x</span>)}
                          </div>);
                        } else { return (<div key={num} style={styles.roundNumberEmpty} />); }
                      })}
                    </div>
                    <h5 style={{ margin: "1rem 0 0.5rem 0" }}>Column Distribution</h5>
                    <div style={styles.roundColumnStats}>
                      {Object.entries(roundStatsByRound[selectedRound].columnDistribution).map(([col, count]) => (
                        <div key={col} style={styles.roundColumnStat}>
                          <div style={{ fontWeight: "bold", color: getColumnColor(col) }}>{col}</div>
                          <div>{count} numbers</div>
                          <div style={{ fontSize: "0.7rem", color: "#666" }}>{Math.round((count / roundStatsByRound[selectedRound].totalBalls) * 100)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {roundComparison && (
                  <div style={styles.comparisonSection}>
                    <h4 style={{ margin: "0 0 1rem 0", color: "white" }}>📊 Round Comparison</h4>
                    <div style={styles.comparisonGrid}>
                      <div style={styles.comparisonItem}><div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Average Balls/Round</div><div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{roundComparison.averageBallsPerRound.toFixed(1)}</div></div>
                      <div style={styles.comparisonItem}><div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Most Balls</div><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Round {roundComparison.mostBallsRound.roundNumber}</div><div style={{ fontSize: "0.9rem" }}>({roundComparison.mostBallsRound.ballCount} balls)</div></div>
                      <div style={styles.comparisonItem}><div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Least Balls</div><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Round {roundComparison.leastBallsRound.roundNumber}</div><div style={{ fontSize: "0.9rem" }}>({roundComparison.leastBallsRound.ballCount} balls)</div></div>
                      <div style={styles.comparisonItem}><div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Most Unique</div><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Round {roundComparison.mostUniqueRound.roundNumber}</div></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No rounds completed yet.</p>
            )}
          </div>
        )}

        {showRoundFrequency && (
          <div style={styles.roundFrequencySection}>
            <div style={styles.roundFrequencyHeader}>
              <h3 style={styles.roundFrequencyTitle}>
                📊 Current Round Frequency
                {roundFrequency.length > 0 && (<span style={{ background: "#ff4757", color: "white", padding: "0.2rem 1rem", borderRadius: "20px", fontSize: "0.9rem" }}>Round {currentRound} of 10</span>)}
              </h3>
              {roundFrequency.length > 0 && (
                <div style={styles.roundStats}>
                  <span style={styles.roundStat}>Total Rounds: <strong>{roundStats.totalRounds}</strong></span>
                  <span style={styles.roundStat}>Unique: <strong>{roundStats.uniqueNumbers}</strong></span>
                  <span style={styles.roundStat}>Most Freq: <strong>{roundStats.mostFrequentNumber}</strong></span>
                </div>
              )}
            </div>
            <div style={styles.columnLegend}>
              {CONSTANTS.COLUMNS.map(col => (
                <div key={col} style={styles.legendItem(getColumnColor(col))}>
                  <span style={{ fontWeight: 'bold' }}>{col}</span>
                  <span>{CONSTANTS.COLUMN_RANGES[col][0]}-{CONSTANTS.COLUMN_RANGES[col][1]}</span>
                </div>
              ))}
            </div>
            <div style={styles.roundFrequencyGrid}>
              {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => {
                const frequency = roundFrequency.find(f => f.number === num)?.count || 0;
                const isSelected = selectedNumber === num;
                const isFavorite = favoriteNumbersList.includes(num);
                const column = getColumnForNumber(num);
                return (
                  <div key={num} className="round-frequency-item" onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                    style={{ ...styles.roundFrequencyItem(frequency, isSelected, isFavorite), borderLeft: `4px solid ${getColumnColor(column)}`, background: isSelected ? '#ffeb3b' : frequency > 0 ? '#e8f4fd' : 'white' }}>
                    <span>{num}</span>
                    {frequency > 0 && (<span style={styles.frequencyBadge}>{frequency}x</span>)}
                    {isFavorite && frequency === 0 && (<span style={{ position: 'absolute', top: '-2px', right: '-2px', fontSize: '0.6rem' }}>⭐</span>)}
                  </div>
                );
              })}
            </div>
            {selectedNumber && (
              <div style={styles.selectedNumberDetail}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Number {selectedNumber} Details</h4>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Column: {getColumnForNumber(selectedNumber)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => toggleFavoriteNumberFixed(selectedNumber)} style={{ padding: '0.5rem 1rem', background: favoriteNumbersList.includes(selectedNumber) ? '#ff4757' : '#ffd700', color: favoriteNumbersList.includes(selectedNumber) ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {favoriteNumbersList.includes(selectedNumber) ? 'Remove from ⭐' : 'Add to ⭐'}
                    </button>
                    <button onClick={() => toggleNumberSafe(selectedNumber)} style={{ padding: '0.5rem 1rem', background: highlightNumbers.includes(selectedNumber) ? '#ff4757' : '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {highlightNumbers.includes(selectedNumber) ? 'Remove from Called' : 'Mark as Called'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {roundFrequency.length === 0 && (<p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No numbers drawn yet.</p>)}
          </div>
        )}

        {(myCards.length > 0 || generatedCards.length > 0) && (
          <div style={styles.ballsSection}>
            <h3 style={{ margin: "0 0 1rem 0" }}>
              🎯 Called Numbers (Round {currentRound})
              {favoriteNumbersList.length > 0 && (<span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#ffd700" }}>⭐ Favorites: {favoriteNumbersList.join(", ")}</span>)}
            </h3>
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "20px", height: "20px", background: "#ffeb3b", border: "2px solid #fbc02d", borderRadius: "4px" }}></div><span>Called this round</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "20px", height: "20px", background: "#e8f4fd", border: "2px solid #667eea", borderRadius: "4px" }}></div><span>Called in previous rounds</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "20px", height: "20px", background: "white", border: "2px solid #e0e0e0", borderRadius: "4px" }}></div><span>Not called yet</span></div>
            </div>
            <form onSubmit={handleManualNumberSubmitSafe} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", maxWidth: "400px", margin: "0 auto" }}>
                <input type="number" value={manualNumberInput} onChange={(e) => setManualNumberInput(e.target.value)} placeholder="Enter number (1-75)" min="1" max="75" style={{ flex: 1, padding: "0.75rem", border: "2px solid #667eea", borderRadius: "8px", fontSize: "1rem", outline: "none" }} />
                <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>Highlight</button>
              </div>
            </form>
            <div style={styles.ballsGrid}>
              {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => {
                const active = highlightNumbers.includes(num);
                const frequency = numberFrequency[num] || 0;
                const isFavorite = favoriteNumbersList.includes(num);
                const isInHistory = !active && frequency > 0;
                return (
                  <div key={num} onClick={() => toggleNumberSafe(num)} style={{ ...styles.ball(active), ...(isInHistory && !active ? { background: "#e8f4fd", border: "2px solid #667eea" } : {}), ...(isFavorite ? styles.favoriteBall : {}), display: "flex", flexDirection: "column", padding: "0.25rem" }}>
                    <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{num}</span>
                    {frequency > 0 && (<span style={{ fontSize: frequency > 9 ? "0.5rem" : "0.6rem", background: active ? "#fbc02d" : (frequency > 1 ? "#ff4757" : "#667eea"), color: "white", padding: "0.1rem 0.3rem", borderRadius: "8px", marginTop: "0.1rem", fontWeight: "bold" }}>{frequency}x</span>)}
                    {isFavorite && (<span style={{ position: "absolute", top: "-5px", right: "-5px", fontSize: "0.8rem" }}>⭐</span>)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(myCards.length > 0 || generatedCards.length > 0) && (
          <div style={styles.cardSectionTabs}>
            <button onClick={() => setActiveCardSection("myCards")} style={styles.cardSectionTab(activeCardSection === "myCards")} className="card-section-tab">
              <span>🎯 My Cards</span>
              <span style={{ background: activeCardSection === "myCards" ? "rgba(255,255,255,0.3)" : "#667eea", color: "white", padding: "0.2rem 0.8rem", borderRadius: "20px", fontSize: "0.9rem", marginLeft: "0.5rem" }}>{myCards.length}</span>
            </button>
            <button onClick={() => setActiveCardSection("generated")} style={styles.cardSectionTab(activeCardSection === "generated")} className="card-section-tab">
              <span>🎴 Generated Cards</span>
              <span style={{ background: activeCardSection === "generated" ? "rgba(255,255,255,0.3)" : "#764ba2", color: "white", padding: "0.2rem 0.8rem", borderRadius: "20px", fontSize: "0.9rem", marginLeft: "0.5rem" }}>{generatedCards.length}</span>
            </button>
          </div>
        )}

        {topWinner && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", border: "2px solid #ffd700" }}>
            <h3 style={{ margin: "0 0 1rem 0" }}>🏆 Top Performing Card</h3>
            <div style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", borderRadius: "12px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{topWinner.label.emoji}</span>
                  <span style={{ fontWeight: "bold" }}>{topWinner.label.name}</span>
                  <span style={{ color: "#666" }}>{topWinner.section === "myCards" ? "(My Card)" : "(Generated)"}</span>
                </div>
                <span>Progress: {Math.round(topWinner.progress)}%</span>
                <span>Win %: {Math.round(topWinner.winPercentage)}%</span>
                {topWinner.isWinner && (<span style={{ background: "#ff4757", color: "white", padding: "0.25rem 0.75rem", borderRadius: "20px", fontWeight: "bold" }}>WINNER!</span>)}
              </div>
              <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${topWinner.progress}%`, background: "linear-gradient(90deg, #ffd700, #ffb347)", transition: "width 0.3s ease" }} />
              </div>
            </div>
          </div>
        )}

        {activeCardSection === "myCards" && myCards.length > 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", border: "2px solid #667eea", boxShadow: "0 10px 30px rgba(102, 126, 234, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.8rem", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🎯 My Cards</h2>
                <span style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "0.3rem 1rem", borderRadius: "20px", fontSize: "1rem", fontWeight: "bold" }}>{myCards.length} Card{myCards.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: "flex", gap: "1rem", background: "#f5f5f5", padding: "0.5rem 1rem", borderRadius: "40px" }}>
                <span>🏆 Winners: {myRankedCards.filter(c => c.isWinner).length}</span>
                <span>📌 Pinned: {myRankedCards.filter(c => c.isPinned).length}</span>
              </div>
            </div>
            <div style={styles.cardsContainer}>
              {myRankedCards.map(({ card, idx, section, isWinner, progress, winPercentage, winningPatterns, isPinned, favoriteCount, label }, rank) => (
                <div key={`${section}-${idx}`} className="card-container" style={styles.cardContainer} onClick={() => toggleCardFlip(idx, section)}>
                  <div className="card-actions" style={styles.cardActions}>
                    {editingCard !== `${section}-${idx}` ? (
                      <>
                        <button onClick={(e) => togglePin(idx, section, e)} style={{...styles.actionButton, ...styles.pinButton(isPinned)}} className="action-button">📌</button>
                        <button onClick={(e) => startEdit(card, idx, section, e)} style={{...styles.actionButton, ...styles.editButton}} className="action-button">✏️</button>
                        <button onClick={(e) => startEditLabel(idx, section, e)} style={{...styles.actionButton, ...styles.labelButton}} className="action-button">🏷️</button>
                        <button onClick={(e) => saveCard(card, idx, section, e)} style={{...styles.actionButton, ...styles.saveButton}} className="action-button">💾</button>
                        <button onClick={(e) => deleteCard(idx, section, e)} style={{...styles.actionButton, ...styles.deleteButton}} className="action-button">🗑️</button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => saveEdit(idx, section, e)} style={{...styles.actionButton, ...styles.saveButton}} className="action-button">✓</button>
                        <button onClick={(e) => cancelEdit(e)} style={{...styles.actionButton, ...styles.cancelButton}} className="action-button">✕</button>
                      </>
                    )}
                  </div>
                  <div style={styles.cardInner(flippedCards[`${section}-${idx}`])}>
                    <div style={styles.cardFront}>
                      <div style={styles.bingoCard(isWinner, isPinned, favoriteCount > 0)}>
                        <div style={styles.cardLabel} className="card-label" onClick={(e) => { e.stopPropagation(); startEditLabel(idx, section, e); }}>
                          <span style={styles.labelEmoji}>{label.emoji}</span>
                          <span style={styles.labelName}>{label.name}</span>
                          <span style={styles.labelEditIcon}>✏️</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.25rem" }}>
                          <span style={{ fontWeight: "bold", color: "#666" }}>{formatSerial(idx, "MY")}</span>
                          <span>Rank #{rank + 1}</span>
                          {favoriteCount > 0 && (<span style={{ background: "#ffd700", color: "#333", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" }}>⭐ {favoriteCount}</span>)}
                          {isWinner && (<span style={{ background: "#ff4757", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" }}>WINNER</span>)}
                        </div>
                        <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "2px", marginBottom: "0.5rem", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #4CAF50, #8BC34A)" }} />
                        </div>
                        <div style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Win Chance: {Math.round(winPercentage)}%</div>
                        <div style={styles.bingoHeader}>{CONSTANTS.COLUMNS.map(letter => (<span key={letter} style={styles.bingoLetter}>{letter}</span>))}</div>
                        <div style={styles.bingoGrid}>
                          {[0,1,2,3,4].map((row) => (
                            <div key={row} style={styles.bingoRow}>
                              {[0,1,2,3,4].map((col) => {
                                const cell = card[col][row];
                                const isHighlighted = highlightNumbers.includes(cell);
                                const isFree = cell === "FREE" || cell === "★";
                                const isFavorite = !isFree && favoriteNumbersList.includes(cell);
                                const hasError = hasCellError(col, row);
                                const isPatternCell = getPatternCells(currentPattern).has(`${col},${row}`);
                                if (editingCard === `${section}-${idx}`) {
                                  return (<input key={col} type="text" value={cell} onChange={(e) => updateCell(col, row, e.target.value, e)} onClick={(e) => e.stopPropagation()} style={styles.editInput(hasError)} disabled={cell === "FREE"} />);
                                }
                                return (
                                  <div key={col} style={styles.bingoCell(isHighlighted, isFree, isFavorite, hasError, isPatternCell)}>
                                    {isFree ? "⭐" : cell}
                                    {isFavorite && !isFree && (<span style={styles.favoriteStar}>⭐</span>)}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                          <span>{getCardScore(card)} left</span><span>Target: {targetWinPercentage}%</span>
                        </div>
                        <div style={styles.flipHint}>👆 Click to see winning patterns</div>
                      </div>
                    </div>
                    <div style={styles.cardBack}>
                      <div style={styles.cardNumber}>{label.emoji} {label.name}</div>
                      <div style={styles.backHeader}>🏆 Winning Patterns</div>
                      {winningPatterns.length > 0 ? (
                        <div style={styles.patternsList}>
                          {winningPatterns.map((pattern, index) => (
                            <div key={index} style={styles.patternItem} onClick={(e) => { e.stopPropagation(); setCurrentPattern(pattern.id); toggleCardFlip(idx, section); }}>
                              <span>{pattern.icon}</span><span>{pattern.name}</span><span style={styles.patternCount}>WINNER</span>
                            </div>
                          ))}
                        </div>
                      ) : (<div style={styles.noPatterns}>No winning patterns yet<br /><span style={{ fontSize: "0.8rem" }}>Keep drawing numbers!</span></div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCardSection === "generated" && generatedCards.length > 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", border: "2px solid #9C27B0", boxShadow: "0 10px 30px rgba(156, 39, 176, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.8rem", background: "linear-gradient(135deg, #9C27B0, #BA68C8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🎴 Generated Cards</h2>
                <span style={{ background: "linear-gradient(135deg, #9C27B0, #BA68C8)", color: "white", padding: "0.3rem 1rem", borderRadius: "20px", fontSize: "1rem", fontWeight: "bold" }}>{generatedCards.length} Card{generatedCards.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div style={styles.cardsContainer}>
              {generatedRankedCards.map(({ card, idx, section, isWinner, progress, winPercentage, winningPatterns, isPinned, favoriteCount, label }, rank) => (
                <div key={`${section}-${idx}`} className="card-container" style={styles.cardContainer} onClick={() => toggleCardFlip(idx, section)}>
                  <div className="card-actions" style={styles.cardActions}>
                    {editingCard !== `${section}-${idx}` ? (
                      <>
                        <button onClick={(e) => togglePin(idx, section, e)} style={{...styles.actionButton, ...styles.pinButton(isPinned)}} className="action-button">📌</button>
                        <button onClick={(e) => startEdit(card, idx, section, e)} style={{...styles.actionButton, ...styles.editButton}} className="action-button">✏️</button>
                        <button onClick={(e) => startEditLabel(idx, section, e)} style={{...styles.actionButton, ...styles.labelButton}} className="action-button">🏷️</button>
                        <button onClick={(e) => saveCard(card, idx, section, e)} style={{...styles.actionButton, ...styles.saveButton}} className="action-button">💾</button>
                        <button onClick={(e) => deleteCard(idx, section, e)} style={{...styles.actionButton, ...styles.deleteButton}} className="action-button">🗑️</button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => saveEdit(idx, section, e)} style={{...styles.actionButton, ...styles.saveButton}} className="action-button">✓</button>
                        <button onClick={(e) => cancelEdit(e)} style={{...styles.actionButton, ...styles.cancelButton}} className="action-button">✕</button>
                      </>
                    )}
                  </div>
                  <div style={styles.cardInner(flippedCards[`${section}-${idx}`])}>
                    <div style={styles.cardFront}>
                      <div style={styles.bingoCard(isWinner, isPinned, favoriteCount > 0)}>
                        <div style={styles.cardLabel} className="card-label" onClick={(e) => { e.stopPropagation(); startEditLabel(idx, section, e); }}>
                          <span style={styles.labelEmoji}>{label.emoji}</span>
                          <span style={styles.labelName}>{label.name}</span>
                          <span style={styles.labelEditIcon}>✏️</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.25rem" }}>
                          <span style={{ fontWeight: "bold", color: "#666" }}>{formatSerial(idx, "GEN")}</span>
                          <span>Rank #{rank + 1}</span>
                          {favoriteCount > 0 && (<span style={{ background: "#ffd700", color: "#333", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" }}>⭐ {favoriteCount}</span>)}
                          {isWinner && (<span style={{ background: "#ff4757", color: "white", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem" }}>WINNER</span>)}
                        </div>
                        <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "2px", marginBottom: "0.5rem", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #4CAF50, #8BC34A)" }} />
                        </div>
                        <div style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Win Chance: {Math.round(winPercentage)}%</div>
                        <div style={styles.bingoHeader}>{CONSTANTS.COLUMNS.map(letter => (<span key={letter} style={styles.bingoLetter}>{letter}</span>))}</div>
                        <div style={styles.bingoGrid}>
                          {[0,1,2,3,4].map((row) => (
                            <div key={row} style={styles.bingoRow}>
                              {[0,1,2,3,4].map((col) => {
                                const cell = card[col][row];
                                const isHighlighted = highlightNumbers.includes(cell);
                                const isFree = cell === "FREE" || cell === "★";
                                const isFavorite = !isFree && favoriteNumbersList.includes(cell);
                                const hasError = hasCellError(col, row);
                                const isPatternCell = getPatternCells(currentPattern).has(`${col},${row}`);
                                if (editingCard === `${section}-${idx}`) {
                                  return (<input key={col} type="text" value={cell} onChange={(e) => updateCell(col, row, e.target.value, e)} onClick={(e) => e.stopPropagation()} style={styles.editInput(hasError)} disabled={cell === "FREE"} />);
                                }
                                return (
                                  <div key={col} style={styles.bingoCell(isHighlighted, isFree, isFavorite, hasError, isPatternCell)}>
                                    {isFree ? "⭐" : cell}
                                    {isFavorite && !isFree && (<span style={styles.favoriteStar}>⭐</span>)}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                          <span>{getCardScore(card)} left</span><span>Target: {targetWinPercentage}%</span>
                        </div>
                        <div style={styles.flipHint}>👆 Click to see winning patterns</div>
                      </div>
                    </div>
                    <div style={styles.cardBack}>
                      <div style={styles.cardNumber}>{label.emoji} {label.name}</div>
                      <div style={styles.backHeader}>🏆 Winning Patterns</div>
                      {winningPatterns.length > 0 ? (
                        <div style={styles.patternsList}>
                          {winningPatterns.map((pattern, index) => (
                            <div key={index} style={styles.patternItem} onClick={(e) => { e.stopPropagation(); setCurrentPattern(pattern.id); toggleCardFlip(idx, section); }}>
                              <span>{pattern.icon}</span><span>{pattern.name}</span><span style={styles.patternCount}>WINNER</span>
                            </div>
                          ))}
                        </div>
                      ) : (<div style={styles.noPatterns}>No winning patterns yet<br /><span style={{ fontSize: "0.8rem" }}>Keep drawing numbers!</span></div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showProfileModal && (
        <div style={styles.modal} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.profileHeader}>
              <div style={styles.profileAvatar}>{profileData.avatar}</div>
              <div style={styles.profileName}>{profileData.name}</div>
              <div style={styles.profileLevel}>Level {profileData.level}</div>
            </div>
            <div style={styles.profileStats}>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.experience}</div><div style={styles.profileStatLabel}>Experience</div></div>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.gamesPlayed}</div><div style={styles.profileStatLabel}>Games Played</div></div>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.winRate}%</div><div style={styles.profileStatLabel}>Win Rate</div></div>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.favoritePattern}</div><div style={styles.profileStatLabel}>Favorite Pattern</div></div>
            </div>
            <div style={styles.profileFooter}>Member since {profileData.joinDate}</div>
            <button onClick={() => setShowProfileModal(false)} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {showLabelModal && labelCardIndex !== null && (
        <div style={styles.modal} onClick={() => setShowLabelModal(false)}>
          <div style={styles.labelModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Edit Card Label</h3>
            <div style={styles.emojiPicker}>
              {AVAILABLE_EMOJIS.map(emoji => (
                <div key={emoji} style={{ ...styles.emojiOption, background: cardLabels[`${labelCardSection}-${labelCardIndex}`]?.emoji === emoji ? "#667eea" : "transparent" }}
                  onClick={() => { setCardLabels(prev => ({ ...prev, [`${labelCardSection}-${labelCardIndex}`]: { ...prev[`${labelCardSection}-${labelCardIndex}`], emoji } })); }}>
                  {emoji}
                </div>
              ))}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Label Name</label>
              <input type="text" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} placeholder="Enter label name" style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Notes (optional)</label>
              <textarea value={cardLabels[`${labelCardSection}-${labelCardIndex}`]?.notes || ""} onChange={(e) => { setCardLabels(prev => ({ ...prev, [`${labelCardSection}-${labelCardIndex}`]: { ...prev[`${labelCardSection}-${labelCardIndex}`], notes: e.target.value } })); }} placeholder="Add notes..." style={styles.textarea} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => { updateCardLabel(labelCardIndex, labelCardSection, { name: labelInput, emoji: cardLabels[`${labelCardSection}-${labelCardIndex}`]?.emoji || "🎴", notes: cardLabels[`${labelCardSection}-${labelCardIndex}`]?.notes || "" }); }} style={styles.generateButton}>Save</button>
              <button onClick={() => setShowLabelModal(false)} style={{...styles.resetButton, width: "auto", padding: "0.75rem 1.5rem"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div style={styles.modal} onClick={() => setShowResults(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2>🏆 Bingo Results</h2>
              {gameResults.length > 0 && (<button onClick={exportResults} style={styles.exportButton}>📥 Export</button>)}
            </div>
            {gameResults.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No results yet.</p>
            ) : (
              <>
                {stats && (
                  <div style={styles.statsContainer}>
                    <h3 style={{ margin: 0 }}>📊 Statistics</h3>
                    <div style={styles.statsGridMain}>
                      <div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalGames}</div><div>Total Games</div></div>
                      <div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.averageBallsToWin}</div><div>Avg Balls to Win</div></div>
                      <div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.averageWinnersPerGame}</div><div>Avg Winners/Game</div></div>
                      <div style={styles.statBox}><div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.mostWinningPattern}</div><div>Most Winning Pattern</div></div>
                    </div>
                  </div>
                )}
                {gameResults.map(result => (
                  <div key={result.id} style={styles.resultItem}>
                    <div style={styles.resultHeader}>
                      <div><strong>{result.patternIcon} {result.patternName}</strong><span style={{ color: "#999", marginLeft: "0.5rem" }}>{result.timestamp}</span></div>
                      <span style={styles.winnerBadge}>{result.winnerCount} winner{result.winnerCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div>🎱 {result.ballsDrawnCount} balls drawn • 📇 {result.totalCards} cards</div>
                    {result.winners.map(winner => (
                      <div key={winner.cardIndex} style={{ marginTop: "0.5rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>{winner.label.emoji}</span><span style={{ fontWeight: "bold" }}>{winner.label.name}</span><span style={{ color: "#666" }}>{winner.serial}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <input type="text" placeholder="Add notes..." value={result.notes || ''} onChange={(e) => saveGameResult(result.id, e.target.value)} style={styles.noteInput} />
                      <button onClick={() => deleteGameResult(result.id)} style={{...styles.deleteButton, padding: "0.5rem"}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </>
            )}
            <button onClick={() => setShowResults(false)} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={styles.modal} onClick={() => setShowHistory(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>📜 Game History</h2>
            {gameHistory.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No game history yet.</p>
            ) : (
              gameHistory.map(history => (
                <div key={history.id} style={styles.historyItem} onClick={() => { const result = gameResults.find(r => r.id === history.id); if (result) { setCurrentGameResult(result); setShowResults(true); setShowHistory(false); } }}>
                  <div style={styles.historyPattern}><span>{history.patternIcon}</span><span>{history.pattern}</span></div>
                  <div><span style={{ marginRight: "1rem" }}>{history.winnerCount} winner{history.winnerCount !== 1 ? 's' : ''}</span><span style={{ color: "#999", fontSize: "0.9rem" }}>{history.timestamp}</span></div>
                </div>
              ))
            )}
            <button onClick={() => setShowHistory(false)} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {showSavedCards && (
        <div style={styles.savedCardsModal} onClick={() => setShowSavedCards(false)}>
          <div style={styles.savedCardsContent} onClick={(e) => e.stopPropagation()}>
            <h2>💾 Saved Cards Collection</h2>
            {savedCards.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No saved cards yet. Click the 💾 button on any card to save it.</p>
            ) : (
              savedCards.map(savedCard => (
                <div key={savedCard.id} style={styles.savedCardItem}>
                  <div style={styles.savedCardInfo} onClick={() => loadSavedCard(savedCard)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{savedCard.label?.emoji || "🎴"}</span>
                      <strong>{savedCard.label?.name || savedCard.serial}</strong>
                      <span style={{ color: "#666" }}>{savedCard.serial}</span>
                    </div>
                    <div style={styles.savedCardDate}>Saved: {savedCard.date}</div>
                    <div style={styles.savedCardPatterns}>
                      {savedCard.patterns.map(p => (<span key={p.id} style={styles.savedCardPatternTag}>{p.icon} {p.name}</span>))}
                    </div>
                  </div>
                  <button onClick={(e) => deleteSavedCard(savedCard.id, e)} style={{...styles.actionButton, ...styles.deleteButton}}>🗑️</button>
                </div>
              ))
            )}
            <button onClick={() => setShowSavedCards(false)} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pattern;