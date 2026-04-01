import { useState, useEffect, useCallback, useMemo } from "react";

export default function Generate({ onBack }) {
  // ==================== CONSTANTS ====================
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
    { id: "emptyCross", label: "Empty Cross", icon: "✖️", numbersNeeded: 16 }
  ];

  const AVAILABLE_EMOJIS = ["🍀", "🎫", "⭐", "🎯", "💎", "🔥", "🌈", "🎲", "♠️", "♥️", "♦️", "♣️"];

  // ==================== DEFAULT CARDS ====================
  const DEFAULT_CARDS = [
    [
      [12, 10, 4, 6, 14],
      [16, 21, 18, 24, 19],
      [36, 35, "FREE", 31, 43],
      [56, 48, 54, 49, 50],
      [74, 63, 68, 67, 70]
    ],
    [
      [5, 12, 6, 11, 8],
      [20, 16, 29, 27, 30],
      [42, 41, "FREE", 45, 43],
      [51, 53, 57, 50, 60],
      [72, 63, 74, 73, 64]
    ]
  ];

  // ==================== INITIAL STATE ====================
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

  // ==================== STATE ====================
  const [numCardsInput, setNumCardsInput] = useState(10);
  const [ballsCalledInput, setBallsCalledInput] = useState(25);
  const [targetWinPercentage, setTargetWinPercentage] = useState(98);
  const [isGenerating, setIsGenerating] = useState(false);

  const [roundFrequency, setRoundFrequency] = useState([]);
  const [showRoundFrequency, setShowRoundFrequency] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [roundStats, setRoundStats] = useState({
    totalRounds: 0,
    averageNumbersPerRound: 0,
    mostFrequentNumber: '',
    leastFrequentNumber: '',
    uniqueNumbers: 0
  });

  const [roundHistory, setRoundHistory] = useState([]);
  const [showRoundHistory, setShowRoundHistory] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [autoAdvanceRound, setAutoAdvanceRound] = useState(true);
  const [roundStatsByRound, setRoundStatsByRound] = useState({});

  const [generatedCards, setGeneratedCards] = useState([]);
  const [myCards, setMyCards] = useState(DEFAULT_CARDS);
  const [cardWinPercentages, setCardWinPercentages] = useState([]);
  const [cardLabels, setCardLabels] = useState({
    0: { name: "Harry's Card", emoji: "🎯", notes: "BALL PICKER" },
    1: { name: "Second Card", emoji: "🎫", notes: "" }
  });

  const [highlightNumbers, setHighlightNumbers] = useState([]);
  const [currentPattern, setCurrentPattern] = useState("blackout");
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

  // ==================== EFFECTS ====================
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
    const frequencyArray = Array.from(frequencyMap.entries())
      .map(([number, count]) => ({ number, count }))
      .sort((a, b) => a.number - b.number);
    setRoundFrequency(frequencyArray);
    const maxFrequency = Math.max(...frequencyArray.map(f => f.count), 0);
    const newRound = maxFrequency + 1;
    setCurrentRound(newRound);
    if (autoAdvanceRound && highlightNumbers.length >= CONSTANTS.MAX_BALLS) {
      const roundData = {
        roundNumber: roundHistory.length + 1,
        ballsCalled: [...highlightNumbers].sort((a, b) => a - b),
        ballCount: highlightNumbers.length,
        timestamp: new Date().toLocaleString(),
        frequencyData: frequencyArray,
        stats: {
          totalBalls: highlightNumbers.length,
          uniqueNumbers: frequencyArray.filter(f => f.count > 0).length,
          mostFrequent: getMostFrequentNumber(frequencyArray),
          leastFrequent: getLeastFrequentNumber(frequencyArray),
          columnDistribution: getColumnDistribution(frequencyArray)
        }
      };
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
    setRoundStats({
      totalRounds: totalRounds,
      averageNumbersPerRound: highlightNumbers.length / (totalRounds || 1),
      mostFrequentNumber: mostFrequent.number ? `${mostFrequent.number} (${mostFrequent.count}x)` : 'None',
      leastFrequentNumber: leastFrequent.number ? `${leastFrequent.number} (${leastFrequent.count}x)` : 'None',
      uniqueNumbers: uniqueNumbersCalled
    });
  }, [highlightNumbers, autoAdvanceRound, roundHistory.length]);

  useEffect(() => {
    const stats = {};
    roundHistory.forEach(round => {
      const roundFreq = new Array(75).fill(0);
      round.ballsCalled.forEach(num => { roundFreq[num - 1]++; });
      stats[round.roundNumber] = {
        ...round.stats,
        numbers: round.ballsCalled,
        frequency: roundFreq
      };
    });
    setRoundStatsByRound(stats);
  }, [roundHistory]);

  // ==================== UTILITY FUNCTIONS ====================
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
    let maxCount = 0;
    let mostFrequent = null;
    frequencyArray.forEach(({ number, count }) => {
      if (count > maxCount) { maxCount = count; mostFrequent = number; }
    });
    return { number: mostFrequent, count: maxCount };
  }, []);

  const getLeastFrequentNumber = useCallback((frequencyArray) => {
    const calledNumbers = frequencyArray.filter(f => f.count > 0);
    let minCount = Infinity;
    let leastFrequent = null;
    calledNumbers.forEach(({ number, count }) => {
      if (count < minCount) { minCount = count; leastFrequent = number; }
    });
    return { number: leastFrequent, count: minCount };
  }, []);

  const getColumnDistribution = useCallback((frequencyArray) => {
    const distribution = { B: 0, I: 0, N: 0, G: 0, O: 0 };
    frequencyArray.forEach(({ number, count }) => {
      if (count > 0) {
        const col = getColumnForNumber(number);
        distribution[col]++;
      }
    });
    return distribution;
  }, [getColumnForNumber]);

  const getNumberFrequencyAcrossRounds = useCallback(() => {
    const frequency = {};
    for (let i = 1; i <= 75; i++) { frequency[i] = 0; }
    highlightNumbers.forEach(num => { frequency[num] = (frequency[num] || 0) + 1; });
    roundHistory.forEach(round => {
      round.ballsCalled.forEach(num => { frequency[num] = (frequency[num] || 0) + 1; });
    });
    return frequency;
  }, [highlightNumbers, roundHistory]);

  // ==================== CARD VALIDATION ====================
  const validateCard = useCallback((card) => {
    const errors = {};
    const columnRanges = CONSTANTS.COLUMN_RANGES;
    const columnIndices = { B: 0, I: 1, N: 2, G: 3, O: 4 };
    Object.entries(columnIndices).forEach(([colName, colIndex]) => {
      const [min, max] = columnRanges[colName];
      const columnNumbers = card[colIndex];
      if (columnNumbers.length !== 5) {
        errors[`col_${colIndex}`] = `Column ${colName} must have exactly 5 numbers`;
        return;
      }
      columnNumbers.forEach((num, rowIndex) => {
        if (num === "FREE" || num === "★") {
          if (colIndex === 2 && rowIndex === 2) {
          } else if (num === "FREE") {
            errors[`cell_${colIndex}_${rowIndex}`] = `FREE space only allowed in center of N column`;
          }
          return;
        }
        const numValue = parseInt(num);
        if (isNaN(numValue)) {
          errors[`cell_${colIndex}_${rowIndex}`] = `Invalid number: ${num}`;
          return;
        }
        if (numValue < min || numValue > max) {
          errors[`cell_${colIndex}_${rowIndex}`] = `${numValue} is not in column ${colName} range (${min}-${max})`;
        }
        const duplicateIndex = columnNumbers.findIndex((n, idx) => idx !== rowIndex && parseInt(n) === numValue);
        if (duplicateIndex !== -1) {
          errors[`cell_${colIndex}_${rowIndex}`] = `Duplicate number ${numValue} in column ${colName}`;
        }
      });
    });
    const allNumbers = [];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        const val = card[c][r];
        if (val !== "FREE" && val !== "★") {
          const num = parseInt(val);
          if (!isNaN(num)) {
            if (allNumbers.includes(num)) {
              errors[`global_${num}`] = `Number ${num} appears multiple times on the card`;
            }
            allNumbers.push(num);
          }
        }
      }
    }
    return errors;
  }, []);

  // ==================== SAFE TOGGLE FUNCTIONS ====================
  const toggleNumberSafe = useCallback((num) => {
    setHighlightNumbers(prev => {
      if (prev.includes(num)) { return prev.filter(n => n !== num); }
      if (prev.length >= CONSTANTS.MAX_BALLS) {
        alert(`Maximum ${CONSTANTS.MAX_BALLS} balls reached for this round. Start a new round to continue.`);
        return prev;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  }, [CONSTANTS.MAX_BALLS]);

  const toggleFavoriteNumberFixed = useCallback((num) => {
    setFavoriteNumbersList(prev => {
      const newList = prev.includes(num)
        ? prev.filter(n => n !== num)
        : [...prev, num].sort((a, b) => a - b);
      setFavoriteNumbers(newList.join(", "));
      if (newList.length > 0) setShowFavoriteStats(true);
      if (newList.length === 0) setShowFavoriteStats(false);
      return newList;
    });
  }, []);

  // ==================== PATTERN CHECKING FUNCTIONS ====================
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
      const a = card[i][i];
      const b = card[i][4 - i];
      if (a !== "FREE" && a !== "★" && !highlightNumbers.includes(a)) diag1 = false;
      if (b !== "FREE" && b !== "★" && !highlightNumbers.includes(b)) diag2 = false;
    }
    return diag1 && diag2;
  }, [highlightNumbers]);

  const checkLines = useCallback((card, requiredLines) => {
    let rows = 0;
    for (let r = 0; r < 5; r++) {
      let complete = true;
      for (let c = 0; c < 5; c++) {
        const num = card[c][r];
        if (num !== "FREE" && num !== "★" && !highlightNumbers.includes(num)) { complete = false; break; }
      }
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
      for (let r = 0; r < 5; r++) {
        const num = card[c][r];
        if (num !== "FREE" && num !== "★" && !highlightNumbers.includes(num)) { complete = false; break; }
      }
      if (complete) columns++;
    }
    return columns >= 4;
  }, [highlightNumbers]);

  const checkEmptyCross = useCallback((card) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const num = card[c][r];
        if (num === "FREE" || num === "★") continue;
        if (r === 2 || c === 2) continue;
        if (!highlightNumbers.includes(num)) return false;
      }
    }
    return true;
  }, [highlightNumbers]);

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
      default: return false;
    }
  }, [checkBlackout, checkTPattern, checkXPattern, checkLines, checkFourCorners, checkSideToSide, checkEmptyCross]);

  const checkAllPatterns = useCallback((card) => {
    return PATTERNS.filter(pattern => checkPattern(card, pattern.id))
      .map(pattern => ({ id: pattern.id, name: pattern.label, icon: pattern.icon }));
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

  const startNewRound = useCallback(() => {
    if (highlightNumbers.length === 0) { alert("No balls drawn in current round!"); return; }
    const frequencyMap = new Map();
    for (let i = 1; i <= 75; i++) { frequencyMap.set(i, 0); }
    highlightNumbers.forEach(num => { frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1); });
    const frequencyArray = Array.from(frequencyMap.entries())
      .map(([number, count]) => ({ number, count }))
      .sort((a, b) => a.number - b.number);
    const roundData = {
      roundNumber: roundHistory.length + 1,
      ballsCalled: [...highlightNumbers].sort((a, b) => a - b),
      ballCount: highlightNumbers.length,
      timestamp: new Date().toLocaleString(),
      frequencyData: frequencyArray,
      stats: {
        totalBalls: highlightNumbers.length,
        uniqueNumbers: frequencyArray.filter(f => f.count > 0).length,
        mostFrequent: getMostFrequentNumber(frequencyArray),
        leastFrequent: getLeastFrequentNumber(frequencyArray),
        columnDistribution: getColumnDistribution(frequencyArray)
      }
    };
    setRoundHistory(prev => [...prev, roundData]);
    setHighlightNumbers([]);
    setSelectedNumber(null);
    alert(`✅ Round ${roundData.roundNumber} saved to history!`);
  }, [highlightNumbers, roundHistory.length, getMostFrequentNumber, getLeastFrequentNumber, getColumnDistribution]);

  const clearRoundHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all round history?")) {
      setRoundHistory([]);
      setSelectedRound(null);
    }
  }, []);

  const exportRoundHistory = useCallback(() => {
    const dataStr = JSON.stringify(roundHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `round-history-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [roundHistory]);

  const getRoundComparison = useCallback(() => {
    if (roundHistory.length < 2) return null;
    const comparison = {
      totalRounds: roundHistory.length,
      averageBallsPerRound: roundHistory.reduce((acc, r) => acc + r.ballCount, 0) / roundHistory.length,
      mostBallsRound: roundHistory.reduce((max, r) => r.ballCount > max.ballCount ? r : max, roundHistory[0]),
      leastBallsRound: roundHistory.reduce((min, r) => r.ballCount < min.ballCount ? r : min, roundHistory[0]),
      mostUniqueRound: roundHistory.reduce((max, r) => r.stats.uniqueNumbers > max.stats.uniqueNumbers ? r : max, roundHistory[0]),
      leastUniqueRound: roundHistory.reduce((min, r) => r.stats.uniqueNumbers < min.stats.uniqueNumbers ? r : min, roundHistory[0]),
      mostFrequentNumbers: {},
      columnAverages: { B: 0, I: 0, N: 0, G: 0, O: 0 }
    };
    roundHistory.forEach(round => {
      Object.entries(round.stats.columnDistribution).forEach(([col, count]) => {
        comparison.columnAverages[col] += count;
      });
    });
    Object.keys(comparison.columnAverages).forEach(col => {
      comparison.columnAverages[col] = Math.round(comparison.columnAverages[col] / roundHistory.length);
    });
    const allNumbersFrequency = {};
    roundHistory.forEach(round => {
      round.ballsCalled.forEach(num => {
        allNumbersFrequency[num] = (allNumbersFrequency[num] || 0) + 1;
      });
    });
    comparison.mostFrequentNumbers = Object.entries(allNumbersFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([num, count]) => ({ number: parseInt(num), count }));
    return comparison;
  }, [roundHistory]);

  const getCardLabel = useCallback((cardIndex, section = "myCards") => {
    const key = `${section}-${cardIndex}`;
    return cardLabels[key] || {
      name: section === "myCards" ? `My Card ${formatSerial(cardIndex, "MY")}` : `Generated Card ${formatSerial(cardIndex, "GEN")}`,
      emoji: section === "myCards" ? "🎯" : "🎴",
      notes: ""
    };
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
    const numbers = favoriteNumbers
      .split(/[,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 75);
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
    if (window.confirm("Clear all favorite numbers?")) {
      setFavoriteNumbersList([]);
      setFavoriteNumbers("");
      setShowFavoriteStats(false);
    }
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
    return Array.from({ length: 75 }, (_, i) => i + 1).filter(num => {
      return num.toString().includes(term) ||
        getColumnForNumber(num).toLowerCase().includes(term) ||
        (term === 'even' && num % 2 === 0) ||
        (term === 'odd' && num % 2 === 1) ||
        (term === 'prime' && isPrime(num));
    });
  }, [searchTerm, getColumnForNumber, isPrime]);

  const saveCurrentList = useCallback(() => {
    if (favoriteNumbersList.length === 0) { alert("No favorite numbers to save!"); return; }
    if (!currentListName.trim()) { alert("Please enter a name for this list"); return; }
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
  }, [favoriteNumbersList, currentListName]);

  const loadFavoriteList = useCallback((list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  }, []);

  const deleteFavoriteList = useCallback((listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setFavoriteLists(prev => prev.filter(list => list.id !== listId));
    }
  }, []);

  const updateListName = useCallback((listId, newName) => {
    setFavoriteLists(prev => prev.map(list => list.id === listId ? { ...list, name: newName } : list));
    setEditingListName(null);
  }, []);

  const exportFavoriteLists = useCallback(() => {
    const dataStr = JSON.stringify(favoriteLists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `favorite-lists-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [favoriteLists]);

  const importFavoriteLists = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setFavoriteLists(prev => [...prev, ...imported]);
          alert(`Imported ${imported.length} lists successfully!`);
        } else { alert("Invalid file format"); }
      } catch (error) { alert("Error importing file"); }
    };
    reader.readAsText(file);
  }, []);

  const getPredefinedLists = useCallback(() => {
    return [
      { id: 'LUCKY_48', name: 'LUCKY 48 NUMBER', numbers: [1, 2, 4, 6, 7, 9, 10, 11, 13, 15, 21, 22, 23, 25, 26, 28, 29, 31, 33, 34, 38, 40, 41, 44, 45, 46, 48, 52, 53, 56, 57, 59, 60, 61, 62, 63, 64, 66, 68, 70, 72, 74], description: 'Numbers that spell BINGO' },
      { id: 'JAE_LUCKY', name: 'JAE LUCKY 48 BALLS', numbers: [1, 2, 4, 6, 7, 9, 10, 11, 13, 15, 21, 22, 23, 25, 26, 28, 29, 31, 33, 34, 38, 40, 41, 44, 45, 46, 48, 52, 53, 56, 57, 59, 60, 61, 62, 63, 64, 66, 68, 70, 72, 74], description: 'Numbers that spell BINGO' },
      { id: 'JUANNA_LUCKY', name: 'JUANNA LUCKY 48 NUMBER', numbers: [1, 2, 4, 6, 7, 9, 11, 12, 15, 17, 18, 19, 20, 25, 28, 29, 32, 33, 34, 35, 38, 39, 40, 41, 42, 45, 47, 51, 53, 54, 55, 56, 58, 59, 60, 62, 65, 67, 68, 69, 71, 72, 74], description: 'Numbers that spell BINGO' },
      { id: 'CARLA_LUCKY', name: 'CARLA LUCKY 48 NUMBER', numbers: [1, 2, 3, 5, 6, 9, 10, 11, 19, 20, 21, 22, 23, 24, 26, 32, 33, 39, 41, 43, 44, 48, 49, 51, 53, 54, 56, 57, 59, 61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72, 74, 75], description: 'Numbers that spell BINGO' },
      { id: 'CRISS_LUCKY', name: 'CRISS LUCKY 48 NUMBER', numbers: [3, 4, 5, 8, 10, 11, 12, 13, 15, 17, 18, 20, 21, 24, 25, 28, 29, 31, 34, 36, 37, 39, 44, 45, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 63, 65, 67, 68, 69, 71, 72, 73, 75], description: 'Numbers that spell BINGO' },
      { id: 'BIMBY_LUCKY', name: 'BIMBY LUCKY 48 NUMBER', numbers: [1, 3, 4, 6, 7, 10, 11, 12, 13, 17, 18, 21, 22, 25, 26, 27, 28, 30, 31, 33, 34, 38, 39, 42, 43, 45, 46, 47, 49, 50, 52, 58, 59, 64, 65, 66, 69, 70, 71, 72, 73], description: 'Numbers that spell BINGO' }
    ];
  }, []);

  const loadPredefinedList = useCallback((list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  }, []);

  const generateCardWithFavoriteNumbers = useCallback((useFavorites = true) => {
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

  const generateCardWithTargetPercentage = useCallback((targetPercentage, useFavorites = true) => {
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
      if (Math.abs(percentage - targetPercentage) <= 5) { break; }
    }
    return bestCard || generateCardWithFavoriteNumbers(useFavorites);
  }, [generateCardWithFavoriteNumbers, calculateWinPercentage, currentPattern]);

  // ==================== UPDATED handleGenerate with avg capped at 24 ====================
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    const count = Math.min(Math.max(numCardsInput, 1), CONSTANTS.MAX_CARDS);
    if (favoriteNumbers.trim() !== "") { parseFavoriteNumbers(); }
    setTimeout(() => {
      const newCards = [];
      const percentages = [];
      const favoriteStats = { totalFavoriteNumbers: 0, cardsWithFavorites: 0 };
      for (let i = 0; i < count; i++) {
        const useFavorites = favoriteNumbersList.length > 0 && (i % 3 !== 0);
        const card = generateCardWithTargetPercentage(targetWinPercentage, useFavorites);
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
        alert(
          `✅ Generated ${count} cards with favorite numbers!\n` +
          `📊 Stats:\n` +
          `- Favorite numbers: ${favoriteNumbersList.join(", ")}\n` +
          `- Average favorites per card: ${(favoriteStats.totalFavoriteNumbers / count).toFixed(1)}/24\n` +
          `- Cards with at least one favorite: ${favoriteStats.cardsWithFavorites}/${count}`
        );
      }
      setIsGenerating(false);
    }, 500);
  }, [numCardsInput, favoriteNumbers, parseFavoriteNumbers, favoriteNumbersList, generateCardWithTargetPercentage, targetWinPercentage, currentPattern, calculateWinPercentage]);

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

  const handleReset = useCallback(() => {
    setHighlightNumbers([]);
    setFlippedCards({});
  }, []);

  const togglePin = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    const key = `${section}-${cardIndex}`;
    setPinnedCards(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleCardFlip = useCallback((cardIndex, section) => {
    const key = `${section}-${cardIndex}`;
    if (editingCard !== key) {
      setFlippedCards(prev => ({ ...prev, [key]: !prev[key] }));
    }
  }, [editingCard]);

  const deleteCard = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${section === "myCards" ? "My" : "Generated"} card #${cardIndex + 1}?`)) {
      if (section === "myCards") { setMyCards(prev => prev.filter((_, idx) => idx !== cardIndex)); }
      else { setGeneratedCards(prev => prev.filter((_, idx) => idx !== cardIndex)); }
      setPinnedCards(prev => {
        const newPinned = {};
        Object.keys(prev).forEach(key => {
          const [keySection, keyIndex] = key.split('-');
          const numKey = parseInt(keyIndex);
          if (keySection !== section) { newPinned[key] = prev[key]; }
          else if (numKey < cardIndex) { newPinned[key] = prev[key]; }
          else if (numKey > cardIndex) { newPinned[`${section}-${numKey - 1}`] = prev[key]; }
        });
        return newPinned;
      });
      setFlippedCards(prev => {
        const newFlipped = {};
        Object.keys(prev).forEach(key => {
          const [keySection, keyIndex] = key.split('-');
          const numKey = parseInt(keyIndex);
          if (keySection !== section) { newFlipped[key] = prev[key]; }
          else if (numKey < cardIndex) { newFlipped[key] = prev[key]; }
          else if (numKey > cardIndex) { newFlipped[`${section}-${numKey - 1}`] = prev[key]; }
        });
        return newFlipped;
      });
      setCardLabels(prev => {
        const newLabels = {};
        Object.keys(prev).forEach(key => {
          const [keySection, keyIndex] = key.split('-');
          const numKey = parseInt(keyIndex);
          if (keySection !== section) { newLabels[key] = prev[key]; }
          else if (numKey < cardIndex) { newLabels[key] = prev[key]; }
          else if (numKey > cardIndex) { newLabels[`${section}-${numKey - 1}`] = prev[key]; }
        });
        return newLabels;
      });
    }
  }, []);

  const startEdit = useCallback((card, cardIndex, section, e) => {
    e.stopPropagation();
    const key = `${section}-${cardIndex}`;
    setEditingCard(key);
    setEditFormData(JSON.parse(JSON.stringify(card)));
    setValidationErrors({});
  }, []);

  const cancelEdit = useCallback((e) => {
    e.stopPropagation();
    setEditingCard(null);
    setEditFormData(null);
    setValidationErrors({});
  }, []);

  const updateCell = useCallback((col, row, value, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    let newValue = value;
    if (value === "FREE" || value === "★") {
      if (col === 2 && row === 2 && value === "FREE") { newValue = "FREE"; }
      else if (value === "★") { newValue = "★"; }
      else { alert(`FREE space is only allowed in the center of N column (row 3, column N)`); return; }
    } else {
      const num = parseInt(value);
      if (isNaN(num)) { alert("Please enter a valid number (1-75) or 'FREE' for center"); return; }
      if (num < 1 || num > 75) { alert("Please enter a number between 1 and 75"); return; }
      const [min, max] = CONSTANTS.COLUMN_RANGES[CONSTANTS.COLUMNS[col]];
      if (num < min || num > max) { alert(`${num} is not in column ${CONSTANTS.COLUMNS[col]} range (${min}-${max})`); return; }
      newValue = num;
    }
    setEditFormData(prev => {
      const newCard = [...prev];
      newCard[col] = [...newCard[col]];
      newCard[col][row] = newValue;
      return newCard;
    });
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`cell_${col}_${row}`];
      return newErrors;
    });
  }, [editFormData]);

  const saveEdit = useCallback((cardIndex, section, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    const errors = validateCard(editFormData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      alert(`Card validation failed:\n${Object.values(errors).join('\n')}`);
      return;
    }
    if (section === "myCards") {
      setMyCards(prev => { const newCards = [...prev]; newCards[cardIndex] = editFormData; return newCards; });
    } else {
      setGeneratedCards(prev => { const newCards = [...prev]; newCards[cardIndex] = editFormData; return newCards; });
    }
    setEditingCard(null);
    setEditFormData(null);
    setValidationErrors({});
    alert(`✅ Card saved successfully!`);
  }, [editFormData, validateCard]);

  const saveCard = useCallback((card, cardIndex, section, e) => {
    e.stopPropagation();
    const cardType = section === "myCards" ? "MY" : "GEN";
    const savedCard = {
      id: Date.now() + cardIndex,
      card: JSON.parse(JSON.stringify(card)),
      serial: formatSerial(cardIndex, cardType),
      label: getCardLabel(cardIndex, section),
      section: section,
      date: new Date().toLocaleString(),
      patterns: checkAllPatterns(card)
    };
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
    if (window.confirm("Are you sure you want to delete this saved card?")) {
      setSavedCards(prev => prev.filter(card => card.id !== savedCardId));
    }
  }, []);

  const recordBingoResult = useCallback(() => {
    const allCards = [...myCards, ...generatedCards];
    if (allCards.length === 0) { alert("Please add some cards first!"); return; }
    const patternWinners = winners[currentPattern] || [];
    if (patternWinners.length === 0) { alert(`No winners yet for the ${currentPattern} pattern!`); return; }
    const pattern = PATTERNS.find(p => p.id === currentPattern);
    const result = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      pattern: currentPattern,
      patternIcon: pattern.icon,
      patternName: pattern.label,
      ballsDrawn: [...highlightNumbers].sort((a, b) => a - b),
      ballsDrawnCount: highlightNumbers.length,
      totalCards: allCards.length,
      winners: patternWinners.map(idx => {
        const isMyCard = idx < myCards.length;
        const section = isMyCard ? "myCards" : "generated";
        const cardIndex = isMyCard ? idx : idx - myCards.length;
        return {
          cardIndex: idx,
          section: section,
          sectionIndex: cardIndex,
          serial: formatSerial(cardIndex, isMyCard ? "MY" : "GEN"),
          label: getCardLabel(cardIndex, section),
          card: isMyCard ? myCards[cardIndex] : generatedCards[cardIndex],
          winPercentage: calculateWinPercentage(isMyCard ? myCards[cardIndex] : generatedCards[cardIndex], currentPattern),
          winningPatterns: checkAllPatterns(isMyCard ? myCards[cardIndex] : generatedCards[cardIndex])
        };
      }),
      winnerCount: patternWinners.length,
      notes: ""
    };
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
    const exportFileDefaultName = `bingo-results-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [gameResults]);

  const calculateStatistics = useCallback(() => {
    if (gameResults.length === 0) return null;
    const stats = {
      totalGames: gameResults.length,
      averageBallsToWin: Math.round(gameResults.reduce((acc, r) => acc + r.ballsDrawnCount, 0) / gameResults.length),
      mostWinningPattern: "",
      patternStats: {},
      averageWinnersPerGame: (gameResults.reduce((acc, r) => acc + r.winnerCount, 0) / gameResults.length).toFixed(1)
    };
    const patternCounts = {};
    gameResults.forEach(result => {
      if (!stats.patternStats[result.pattern]) {
        stats.patternStats[result.pattern] = { count: 0, totalWinners: 0, icon: result.patternIcon, name: result.patternName };
      }
      stats.patternStats[result.pattern].count++;
      stats.patternStats[result.pattern].totalWinners += result.winnerCount;
      patternCounts[result.pattern] = (patternCounts[result.pattern] || 0) + 1;
    });
    let maxCount = 0;
    Object.entries(patternCounts).forEach(([pattern, count]) => {
      if (count > maxCount) { maxCount = count; stats.mostWinningPattern = stats.patternStats[pattern]?.name || pattern; }
    });
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
      return {
        card, idx, section, key,
        label: getCardLabel(idx, section),
        isWinner: winners[currentPattern]?.includes(section === "myCards" ? idx : myCards.length + idx) || false,
        score: getCardScore(card),
        progress: ((25 - getCardScore(card)) / 24) * 100,
        winPercentage: calculateWinPercentage(card, currentPattern),
        winningPatterns: checkAllPatterns(card),
        isPinned: pinnedCards[key] || false,
        favoriteCount: favoriteNumbersList.length > 0
          ? card.flat().filter(n => n !== "FREE" && n !== "★" && favoriteNumbersList.includes(n)).length
          : 0
      };
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

  const hasCellError = useCallback((col, row) => {
    return validationErrors[`cell_${col}_${row}`] || validationErrors[`col_${col}`];
  }, [validationErrors]);

  // Responsive styles with mobile-first approach
  const styles = {
    container: { 
      minHeight: "100vh", 
      width: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflowX: "hidden",
      position: "relative"
    },
    header: { 
      background: "rgba(255, 255, 255, 0.95)", 
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", 
      position: "sticky", 
      top: 0, 
      zIndex: 100,
      width: "100%"
    },
    headerContent: { 
      maxWidth: "1400px", 
      margin: "0 auto", 
      padding: "0.75rem 1rem", 
      display: "flex", 
      flexDirection: "column",
      gap: "0.75rem"
    },
    title: { 
      margin: 0, 
      fontSize: "clamp(1.2rem, 5vw, 1.8rem)", 
      background: "linear-gradient(135deg, #667eea, #764ba2)", 
      WebkitBackgroundClip: "text", 
      WebkitTextFillColor: "transparent",
      textAlign: "center"
    },
    headerButtons: { 
      display: "flex", 
      gap: "0.5rem", 
      flexWrap: "wrap", 
      justifyContent: "center" 
    },
    profileButton: { 
      padding: "0.5rem 0.75rem", 
      background: "linear-gradient(135deg, #667eea, #764ba2)", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease", 
      display: "flex", 
      alignItems: "center", 
      gap: "0.5rem" 
    },
    backButton: { 
      padding: "0.5rem 0.75rem", 
      background: "#f0f0f0", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease" 
    },
    savedButton: { 
      padding: "0.5rem 0.75rem", 
      background: "#ffd700", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease" 
    },
    resultsButton: { 
      padding: "0.5rem 0.75rem", 
      background: "#4CAF50", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease" 
    },
    historyButton: { 
      padding: "0.5rem 0.75rem", 
      background: "#2196F3", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease" 
    },
    roundFrequencyButton: { 
      padding: "0.5rem 0.75rem", 
      background: "#9C27B0", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease", 
      position: "relative" 
    },
    roundHistoryButton: { 
      padding: "0.5rem 0.75rem", 
      background: "#FF9800", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "clamp(0.75rem, 3vw, 0.9rem)", 
      transition: "all 0.3s ease", 
      position: "relative" 
    },
    main: { 
      maxWidth: "1400px", 
      margin: "0 auto", 
      padding: "1rem",
      width: "100%",
      boxSizing: "border-box"
    },
    patternSelector: { 
      display: "flex", 
      gap: "0.5rem", 
      marginBottom: "1.5rem", 
      flexWrap: "wrap", 
      justifyContent: "center" 
    },
    patternButton: (isActive) => ({ 
      display: "flex", 
      alignItems: "center", 
      gap: "0.25rem", 
      padding: "0.5rem 0.75rem", 
      border: "none", 
      borderRadius: "8px", 
      background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", 
      color: isActive ? "white" : "black", 
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", 
      cursor: "pointer", 
      fontSize: "clamp(0.7rem, 3vw, 0.85rem)", 
      transition: "all 0.3s ease", 
      position: "relative",
      flex: "1 0 auto",
      minWidth: "80px",
      justifyContent: "center"
    }),
    controlsGrid: { 
      display: "grid", 
      gridTemplateColumns: "1fr", 
      gap: "1rem", 
      marginBottom: "1.5rem" 
    },
    controlCard: { 
      background: "white", 
      borderRadius: "12px", 
      padding: "1rem", 
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" 
    },
    inputGroup: { marginBottom: "0.75rem" },
    label: { display: "block", marginBottom: "0.25rem", color: "#666", fontSize: "0.8rem", fontWeight: "500" },
    input: { width: "100%", padding: "0.5rem", border: "2px solid #e0e0e0", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "0.5rem", border: "2px solid #e0e0e0", borderRadius: "6px", fontSize: "0.9rem", minHeight: "60px", boxSizing: "border-box", fontFamily: "inherit" },
    favoriteNumbersContainer: { marginTop: "0.75rem", padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px", border: "2px solid #ffd700" },
    favoriteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", cursor: "pointer" },
    favoriteTitle: { margin: 0, fontSize: "0.9rem", color: "#333" },
    toggleButton: { padding: "0.2rem 0.4rem", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.7rem" },
    columnSelector: { display: "flex", gap: "0.25rem", marginBottom: "0.75rem", flexWrap: "wrap" },
    columnButton: { flex: 1, padding: "0.4rem", background: "#e0e0e0", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", minWidth: "35px", fontSize: "0.7rem" },
    searchInput: { width: "100%", padding: "0.4rem", marginBottom: "0.5rem", border: "2px solid #e0e0e0", borderRadius: "4px", fontSize: "0.8rem" },
    numberSelectorGrid: { 
      display: "grid", 
      gridTemplateColumns: "repeat(10, 1fr)", 
      gap: "0.2rem", 
      marginTop: "0.5rem", 
      marginBottom: "0.5rem", 
      maxHeight: "150px", 
      overflowY: "auto", 
      padding: "0.5rem", 
      background: "white", 
      borderRadius: "6px", 
      border: "1px solid #e0e0e0" 
    },
    numberButton: (isSelected) => ({ 
      aspectRatio: "1", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: isSelected ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f0f0f0", 
      color: isSelected ? "white" : "#333", 
      border: isSelected ? "none" : "1px solid #ccc", 
      borderRadius: "4px", 
      cursor: "pointer", 
      fontSize: "clamp(0.6rem, 2.5vw, 0.7rem)", 
      fontWeight: isSelected ? "bold" : "normal", 
      transition: "all 0.2s ease" 
    }),
    favoriteStats: { marginTop: "0.5rem", padding: "0.5rem", background: "#e8f4fd", borderRadius: "6px", fontSize: "0.8rem" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.3rem", marginTop: "0.3rem" },
    statItem: { background: "white", padding: "0.3rem", borderRadius: "4px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" },
    favoriteListsSection: { marginTop: "0.75rem", padding: "0.5rem", background: "#fff3e0", borderRadius: "6px" },
    listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "white", borderRadius: "4px", marginBottom: "0.3rem", cursor: "pointer", border: "1px solid #e0e0e0" },
    listName: { fontWeight: "bold", fontSize: "0.8rem" },
    listDetails: { fontSize: "0.7rem", color: "#666" },
    listActions: { display: "flex", gap: "0.2rem" },
    smallButton: { padding: "0.2rem 0.4rem", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.7rem" },
    generateButton: { width: "100%", padding: "0.6rem", border: "none", borderRadius: "6px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.3s ease", marginTop: "0.5rem" },
    randomBallButton: { width: "100%", padding: "0.6rem", border: "none", borderRadius: "6px", background: "#4CAF50", color: "white", fontSize: "0.9rem", cursor: "pointer", marginBottom: "0.5rem" },
    newRoundButton: { width: "100%", padding: "0.6rem", border: "none", borderRadius: "6px", background: "#ff9800", color: "white", fontSize: "0.9rem", cursor: "pointer", marginBottom: "0.5rem", transition: "all 0.3s ease", fontWeight: "bold" },
    recordResultButton: { width: "100%", padding: "0.6rem", border: "none", borderRadius: "6px", background: "#9C27B0", color: "white", fontSize: "0.9rem", cursor: "pointer", marginBottom: "0.5rem", transition: "all 0.3s ease", fontWeight: "bold" },
    resetButton: { width: "100%", padding: "0.6rem", border: "none", borderRadius: "6px", background: "#ff4757", color: "white", fontSize: "0.9rem", cursor: "pointer" },
    roundHistorySection: { background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" },
    roundHistoryHeader: { display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" },
    roundHistoryTitle: { margin: 0, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" },
    roundHistoryControls: { display: "flex", gap: "0.5rem", justifyContent: "center" },
    roundTabs: { 
      display: "flex", 
      gap: "0.5rem", 
      marginBottom: "1rem", 
      flexWrap: "wrap", 
      maxHeight: "120px", 
      overflowY: "auto", 
      padding: "0.5rem", 
      background: "#f5f5f5", 
      borderRadius: "8px",
      justifyContent: "center"
    },
    roundTab: (isActive) => ({ 
      padding: "0.4rem 0.8rem", 
      background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", 
      color: isActive ? "white" : "#333", 
      border: "none", 
      borderRadius: "16px", 
      cursor: "pointer", 
      fontSize: "0.75rem", 
      fontWeight: isActive ? "bold" : "normal", 
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)" 
    }),
    roundDetail: { background: "#f8f9fa", borderRadius: "8px", padding: "1rem" },
    roundDetailHeader: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
    roundStatsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginBottom: "1rem" },
    roundStatCard: { background: "white", padding: "0.75rem", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    roundStatValue: { fontSize: "1.2rem", fontWeight: "bold", color: "#667eea" },
    roundStatLabel: { fontSize: "0.7rem", color: "#666" },
    roundNumbersGrid: { 
      display: "grid", 
      gridTemplateColumns: "repeat(10, 1fr)", 
      gap: "0.2rem", 
      marginTop: "0.75rem", 
      marginBottom: "0.75rem" 
    },
    roundNumberItem: (isFavorite) => ({ 
      aspectRatio: "1", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #667eea, #764ba2)", 
      color: "white", 
      borderRadius: "4px", 
      fontSize: "clamp(0.6rem, 2vw, 0.7rem)", 
      fontWeight: "bold", 
      border: isFavorite ? "2px solid #ffd700" : "none", 
      padding: "0.2rem" 
    }),
    roundNumberEmpty: { aspectRatio: "1", background: "#e0e0e0", borderRadius: "4px" },
    roundColumnStats: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginTop: "0.75rem" },
    roundColumnStat: { padding: "0.4rem", background: "white", borderRadius: "6px", textAlign: "center", fontSize: "0.7rem" },
    comparisonSection: { marginTop: "1rem", padding: "0.75rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "8px", color: "white" },
    comparisonGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginTop: "0.75rem" },
    comparisonItem: { background: "rgba(255,255,255,0.2)", padding: "0.75rem", borderRadius: "6px", fontSize: "0.75rem" },
    autoAdvanceToggle: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "6px", fontSize: "0.8rem" },
    roundFrequencySection: { background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" },
    roundFrequencyHeader: { display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" },
    roundFrequencyTitle: { margin: 0, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" },
    roundStats: { display: "flex", gap: "0.5rem", flexWrap: "wrap", background: "#f5f5f5", padding: "0.5rem", borderRadius: "20px", fontSize: "0.7rem", justifyContent: "center" },
    roundStat: { display: "flex", alignItems: "center", gap: "0.2rem" },
    roundFrequencyGrid: { 
      display: "grid", 
      gridTemplateColumns: "repeat(10, 1fr)", 
      gap: "0.3rem", 
      marginBottom: "0.75rem" 
    },
    roundFrequencyItem: (count, isSelected, isFavorite) => ({ 
      aspectRatio: "1", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      background: isSelected ? "#ffeb3b" : count > 0 ? "#e8f4fd" : "white", 
      border: isFavorite ? "2px solid #ffd700" : count > 0 ? "2px solid #667eea" : "2px solid #e0e0e0", 
      borderRadius: "6px", 
      cursor: "pointer", 
      transition: "all 0.2s ease", 
      fontSize: "clamp(0.6rem, 2vw, 0.7rem)", 
      fontWeight: count > 0 ? "bold" : "normal", 
      color: count > 0 ? "#333" : "#999", 
      position: "relative" 
    }),
    frequencyBadge: { fontSize: "0.5rem", background: "#667eea", color: "white", padding: "0.1rem 0.2rem", borderRadius: "8px", marginTop: "0.1rem" },
    selectedNumberDetail: { marginTop: "0.75rem", padding: "0.75rem", background: "#f5f5f5", borderRadius: "6px", border: "2px solid #667eea" },
    columnLegend: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap", justifyContent: "center" },
    legendItem: (color) => ({ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "white", borderRadius: "16px", borderLeft: `3px solid ${color}` }),
    ballsSection: { background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" },
    ballsGrid: { 
      display: "grid", 
      gridTemplateColumns: "repeat(10, 1fr)", 
      gap: "0.3rem" 
    },
    ball: (active) => ({ 
      aspectRatio: "1", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      background: active ? "#ffeb3b" : "white", 
      border: active ? "2px solid #fbc02d" : "2px solid #e0e0e0", 
      borderRadius: "50%", 
      cursor: "pointer", 
      transition: "all 0.3s ease", 
      fontSize: "clamp(0.6rem, 2.5vw, 0.8rem)", 
      padding: "0.2rem", 
      position: "relative" 
    }),
    favoriteBall: { border: "2px solid #ffd700", boxShadow: "0 0 8px rgba(255,215,0,0.5)" },
    cardSectionTabs: { display: "flex", gap: "0.75rem", marginBottom: "1.5rem", justifyContent: "center", flexDirection: "column", alignItems: "center" },
    cardSectionTab: (isActive) => ({ 
      padding: "0.6rem 1rem", 
      border: "none", 
      borderRadius: "10px", 
      background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white", 
      color: isActive ? "white" : "#333", 
      fontSize: "clamp(0.85rem, 4vw, 1rem)", 
      fontWeight: "bold", 
      cursor: "pointer", 
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)", 
      display: "flex", 
      alignItems: "center", 
      gap: "0.5rem", 
      transition: "all 0.3s ease",
      width: "100%",
      justifyContent: "center"
    }),
    cardsContainer: { 
      display: "grid", 
      gridTemplateColumns: "1fr", 
      gap: "1rem" 
    },
    cardContainer: { 
      perspective: "1000px", 
      height: "auto", 
      cursor: "pointer", 
      position: "relative",
      width: "100%"
    },
    cardInner: (isFlipped) => ({ 
      position: "relative", 
      width: "100%", 
      height: "100%", 
      transition: "transform 0.6s", 
      transformStyle: "preserve-3d", 
      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
    }),
    cardFront: { 
      position: "relative", 
      width: "100%", 
      height: "100%", 
      backfaceVisibility: "hidden", 
      WebkitBackfaceVisibility: "hidden" 
    },
    cardBack: { 
      position: "absolute", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      backfaceVisibility: "hidden", 
      WebkitBackfaceVisibility: "hidden", 
      transform: "rotateY(180deg)", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      borderRadius: "10px", 
      padding: "0.75rem", 
      boxSizing: "border-box", 
      display: "flex", 
      flexDirection: "column", 
      border: "2px solid #ffd700", 
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)" 
    },
    bingoCard: (isWinner, isPinned, hasFavorites) => ({ 
      background: "white", 
      border: isWinner ? "3px solid #ff4757" : isPinned ? "3px solid #ffd700" : "2px solid #333", 
      borderRadius: "10px", 
      padding: "1rem 0.75rem", 
      transition: "all 0.3s ease", 
      width: "100%", 
      height: "100%", 
      boxSizing: "border-box", 
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)" 
    }),
    cardLabel: { 
      display: "flex", 
      alignItems: "center", 
      gap: "0.3rem", 
      marginBottom: "0.5rem", 
      padding: "0.4rem", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", 
      borderRadius: "6px", 
      fontSize: "0.75rem", 
      cursor: "pointer", 
      transition: "all 0.2s ease" 
    },
    labelEmoji: { fontSize: "1rem" },
    labelName: { fontWeight: "bold", flex: 1, fontSize: "0.8rem" },
    labelEditIcon: { opacity: 0.5, fontSize: "0.7rem" },
    bingoHeader: { 
      display: "flex", 
      justifyContent: "space-around", 
      marginBottom: "0.3rem", 
      fontSize: "clamp(0.9rem, 4vw, 1.2rem)", 
      fontWeight: "bold", 
      color: "#333", 
      borderBottom: "2px solid #333", 
      paddingBottom: "0.3rem" 
    },
    bingoLetter: { 
      width: "clamp(30px, 10vw, 40px)", 
      textAlign: "center" 
    },
    bingoGrid: { 
      display: "flex", 
      flexDirection: "column", 
      gap: "0.2rem", 
      marginBottom: "0.3rem" 
    },
    bingoRow: { 
      display: "flex", 
      justifyContent: "space-around" 
    },
    bingoCell: (isHighlighted, isFree, isFavorite, hasError) => ({ 
      width: "clamp(35px, 10vw, 45px)", 
      height: "clamp(35px, 10vw, 45px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      border: hasError ? "2px solid #ff4757" : (isFavorite ? "2px solid #ffd700" : "1px solid #333"), 
      borderRadius: "4px", 
      background: isHighlighted ? "#ffeb3b" : isFree ? "#f0f0f0" : "white", 
      fontWeight: "bold", 
      fontSize: "clamp(0.7rem, 3vw, 0.9rem)", 
      cursor: "default", 
      position: "relative", 
      color: "#333" 
    }),
    favoriteStar: { position: "absolute", top: "-3px", right: "-3px", fontSize: "0.5rem", color: "#ffd700" },
    editInput: (hasError) => ({ 
      width: "clamp(35px, 10vw, 40px)", 
      height: "clamp(35px, 10vw, 40px)", 
      textAlign: "center", 
      border: hasError ? "2px solid #ff4757" : "2px solid #667eea", 
      borderRadius: "4px", 
      fontSize: "clamp(0.7rem, 3vw, 0.9rem)", 
      outline: "none", 
      background: hasError ? "#fff5f5" : "white" 
    }),
    cardActions: { 
      position: "absolute", 
      top: "50%", 
      left: "50%", 
      transform: "translate(-50%, -50%)", 
      display: "flex", 
      gap: "0.3rem", 
      zIndex: 20, 
      background: "rgba(255, 255, 255, 0.95)", 
      padding: "0.5rem 0.75rem", 
      borderRadius: "30px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)", 
      border: "2px solid #667eea", 
      opacity: 0, 
      transition: "opacity 0.3s ease", 
      pointerEvents: "none" 
    },
    actionButton: { 
      width: "32px", 
      height: "32px", 
      borderRadius: "50%", 
      border: "none", 
      background: "white", 
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)", 
      cursor: "pointer", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontSize: "1rem", 
      transition: "all 0.2s ease", 
      pointerEvents: "auto" 
    },
    pinButton: (isPinned) => ({ 
      background: isPinned ? "#ffd700" : "white", 
      color: isPinned ? "white" : "#333", 
      border: isPinned ? "2px solid #ffd700" : "2px solid #e0e0e0" 
    }),
    editButton: { background: "#667eea", color: "white", border: "2px solid #667eea" },
    deleteButton: { background: "#ff4757", color: "white", border: "2px solid #ff4757" },
    saveButton: { background: "#4CAF50", color: "white", border: "2px solid #4CAF50" },
    cancelButton: { background: "#999", color: "white", border: "2px solid #999" },
    labelButton: { background: "#ffd700", color: "#333", border: "2px solid #ffd700" },
    flipHint: { position: "absolute", bottom: "3px", right: "3px", fontSize: "0.6rem", color: "#999", background: "rgba(255,255,255,0.8)", padding: "2px 4px", borderRadius: "8px", zIndex: 10 },
    patternsList: { display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.3rem", overflowY: "auto", maxHeight: "200px", padding: "0.3rem" },
    patternItem: { display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem", background: "white", borderRadius: "6px", fontSize: "0.75rem", borderLeft: "3px solid #ffd700", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.2s ease", cursor: "pointer" },
    backHeader: { textAlign: "center", marginBottom: "0.75rem", fontWeight: "bold", color: "white", fontSize: "0.9rem", borderBottom: "2px solid #ffd700", paddingBottom: "0.3rem" },
    noPatterns: { textAlign: "center", color: "rgba(255,255,255,0.7)", fontStyle: "italic", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.75rem" },
    cardNumber: { position: "absolute", top: "3px", left: "3px", fontSize: "0.65rem", color: "white", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "8px", zIndex: 20 },
    patternCount: { background: "#ffd700", color: "#333", borderRadius: "10px", padding: "0.1rem 0.4rem", fontSize: "0.65rem", fontWeight: "bold", marginLeft: "auto" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" },
    modalContent: { background: "white", borderRadius: "12px", padding: "1rem", maxWidth: "95%", width: "100%", maxHeight: "90vh", overflowY: "auto" },
    profileModal: { background: "white", borderRadius: "16px", padding: "1.5rem", maxWidth: "90%", width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
    profileHeader: { textAlign: "center", marginBottom: "1.5rem" },
    profileAvatar: { fontSize: "3rem", marginBottom: "0.75rem" },
    profileName: { fontSize: "1.3rem", fontWeight: "bold", marginBottom: "0.3rem" },
    profileLevel: { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", display: "inline-block", padding: "0.2rem 0.8rem", borderRadius: "16px", fontSize: "0.8rem", marginBottom: "0.75rem" },
    profileStats: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" },
    profileStat: { background: "#f5f5f5", padding: "0.75rem", borderRadius: "8px", textAlign: "center" },
    profileStatValue: { fontSize: "1.2rem", fontWeight: "bold", color: "#667eea" },
    profileStatLabel: { fontSize: "0.7rem", color: "#666" },
    profileFooter: { borderTop: "1px solid #e0e0e0", paddingTop: "0.75rem", textAlign: "center", color: "#999", fontSize: "0.75rem" },
    labelModal: { background: "white", borderRadius: "16px", padding: "1.5rem", maxWidth: "90%", width: "100%" },
    emojiPicker: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.3rem", marginBottom: "0.75rem", padding: "0.75rem", background: "#f5f5f5", borderRadius: "8px" },
    emojiOption: { fontSize: "1.2rem", padding: "0.3rem", textAlign: "center", cursor: "pointer", borderRadius: "6px", transition: "all 0.2s ease" },
    savedCardsModal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" },
    savedCardsContent: { background: "white", borderRadius: "12px", padding: "1rem", maxWidth: "95%", width: "100%", maxHeight: "90vh", overflowY: "auto" },
    savedCardItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer", transition: "background 0.2s ease", gap: "0.5rem" },
    savedCardInfo: { flex: 1 },
    savedCardDate: { fontSize: "0.7rem", color: "#999" },
    savedCardPatterns: { display: "flex", gap: "0.2rem", flexWrap: "wrap", marginTop: "0.2rem" },
    savedCardPatternTag: { background: "#667eea", color: "white", padding: "0.15rem 0.4rem", borderRadius: "10px", fontSize: "0.6rem" },
    closeButton: { padding: "0.4rem 0.8rem", background: "#ff4757", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "0.75rem", fontSize: "0.85rem" },
    exportButton: { padding: "0.4rem 0.8rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
    resultItem: { padding: "0.75rem", borderBottom: "1px solid #e0e0e0", cursor: "pointer" },
    resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", flexWrap: "wrap", gap: "0.3rem" },
    winnerBadge: { background: "#ff4757", color: "white", padding: "0.15rem 0.4rem", borderRadius: "10px", fontSize: "0.7rem" },
    noteInput: { width: "100%", padding: "0.4rem", border: "1px solid #e0e0e0", borderRadius: "6px", marginTop: "0.3rem", marginBottom: "0.3rem", fontSize: "0.8rem" },
    statsContainer: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "1rem", borderRadius: "12px", marginBottom: "0.75rem", color: "white" },
    statsGridMain: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginTop: "0.75rem" },
    statBox: { background: "rgba(255,255,255,0.2)", padding: "0.75rem", borderRadius: "8px", textAlign: "center", fontSize: "0.8rem" },
    historyItem: { padding: "0.75rem", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: "0.5rem", flexWrap: "wrap" },
    historyPattern: { display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }
  };

  // Media query for tablet and desktop
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes winnerGlow {
        0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
        50% { box-shadow: 0 0 20px 0 rgba(255, 71, 87, 0.4); }
        100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
      }
      .card-container:hover .card-actions { opacity: 1 !important; }
      .action-button:hover { transform: scale(1.1) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; }
      .new-round-button:hover { background: #f57c00 !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      .record-result-button:hover { background: #7B1FA2 !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      .number-button:hover { transform: scale(1.05); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .column-button:hover { background: #667eea; color: white; }
      .list-item:hover { background: #f5f5f5; }
      .card-label:hover { background: linear-gradient(135deg, #e0e7ff 0%, #d1d5ff 100%) !important; }
      .emoji-option:hover { background: #667eea; color: white; transform: scale(1.05); }
      .round-frequency-item:hover { transform: scale(1.05); box-shadow: 0 2px 6px rgba(0,0,0,0.2); z-index: 10; }
      .round-tab:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
      .card-section-tab:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
      
      /* Responsive media queries */
      @media (min-width: 768px) {
        .header-content {
          flex-direction: row !important;
          justify-content: space-between !important;
          padding: 1rem 2rem !important;
        }
        .controls-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .cards-container {
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)) !important;
        }
        .card-section-tabs {
          flex-direction: row !important;
          justify-content: center !important;
        }
        .card-section-tab {
          width: auto !important;
        }
        .round-history-header {
          flex-direction: row !important;
          justify-content: space-between !important;
        }
        .round-frequency-header {
          flex-direction: row !important;
          justify-content: space-between !important;
        }
        .round-detail-header {
          flex-direction: row !important;
          justify-content: space-between !important;
        }
        .pattern-button {
          min-width: 100px !important;
        }
        .number-selector-grid {
          grid-template-columns: repeat(15, 1fr) !important;
        }
        .round-frequency-grid, .round-numbers-grid, .balls-grid {
          grid-template-columns: repeat(15, 1fr) !important;
        }
      }
      
      @media (min-width: 1024px) {
        .controls-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .main {
          padding: 2rem !important;
        }
        .control-card {
          padding: 1.5rem !important;
        }
      }
      
      /* Touch device optimizations */
      @media (hover: none) {
        .card-actions {
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.98) !important;
        }
        .card-container {
          cursor: pointer !important;
        }
      }
      
      /* Prevent zoom on input focus for mobile */
      @media (max-width: 768px) {
        input, select, textarea, button {
          font-size: 16px !important;
        }
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Better touch targets */
      button, .number-button, .round-frequency-item, .ball {
        min-height: 44px;
        min-width: 44px;
      }
      
      @media (max-width: 768px) {
        button, .number-button, .round-frequency-item, .ball {
          min-height: 40px;
          min-width: 40px;
        }
      }
    `;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent} className="header-content">
          <h1 style={styles.title}>🎯 Bingo Pattern Analyzer</h1>
          <div style={styles.headerButtons}>
            <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>
              <span>{profileData.avatar}</span><span>{profileData.name}</span>
            </button>
            <button onClick={() => setShowRoundFrequency(!showRoundFrequency)} style={styles.roundFrequencyButton}>
              📊 Freq {showRoundFrequency ? '▼' : '▶'}
              {roundFrequency.length > 0 && (<span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.2rem 0.5rem", fontSize: "0.7rem", fontWeight: "bold" }}>R{currentRound}</span>)}
            </button>
            <button onClick={() => setShowRoundHistory(!showRoundHistory)} style={styles.roundHistoryButton}>
              📜 History {showRoundHistory ? '▼' : '▶'}
              {roundHistory.length > 0 && (<span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.2rem 0.5rem", fontSize: "0.7rem", fontWeight: "bold" }}>{roundHistory.length}</span>)}
            </button>
            <button onClick={() => setShowHistory(true)} style={styles.historyButton}>📜 ({gameHistory.length})</button>
            <button onClick={() => setShowResults(true)} style={styles.resultsButton}>🏆 ({gameResults.length})</button>
            <button onClick={() => setShowSavedCards(true)} style={styles.savedButton}>💾 ({savedCards.length})</button>
            <button onClick={onBack} style={styles.backButton}>← Back</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.patternSelector}>
          {PATTERNS.map((pattern) => (
            <button key={pattern.id} onClick={() => setCurrentPattern(pattern.id)} style={styles.patternButton(currentPattern === pattern.id)}>
              <span>{pattern.icon}</span><span>{pattern.label}</span>
              {winners[pattern.id]?.length > 0 && (<span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ff4757", color: "white", borderRadius: "20px", padding: "0.15rem 0.4rem", fontSize: "0.65rem", fontWeight: "bold" }}>{winners[pattern.id].length}</span>)}
            </button>
          ))}
        </div>

        <div style={styles.controlsGrid} className="controls-grid">
          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>📋 Card Generation</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Number of Cards</label>
              <input type="number" value={numCardsInput} onChange={(e) => setNumCardsInput(Number(e.target.value))} min="1" max={CONSTANTS.MAX_CARDS} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Win %</label>
              <input type="number" value={targetWinPercentage} onChange={(e) => setTargetWinPercentage(Number(e.target.value))} min="0" max="100" style={styles.input} />
            </div>

            <div style={styles.favoriteNumbersContainer}>
              <div style={styles.favoriteHeader} onClick={() => setShowNumberSelector(!showNumberSelector)}>
                <h4 style={styles.favoriteTitle}>⭐ Favorite Numbers</h4>
                <button style={styles.toggleButton}>{showNumberSelector ? "▼" : "▶"}</button>
              </div>
              <div style={styles.columnSelector}>
                {['B','I','N','G','O'].map(col => (
                  <button key={col} onClick={() => selectAllInColumn(col)} style={styles.columnButton}>{col}</button>
                ))}
              </div>
              <input type="text" placeholder="🔍 Search numbers" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              {showNumberSelector && (
                <div style={styles.numberSelectorGrid} className="number-selector-grid">
                  {filteredNumbers.map((num) => (
                    <div key={num} onClick={() => toggleFavoriteNumberFixed(num)} style={styles.numberButton(favoriteNumbersList.includes(num))} className="number-button">{num}</div>
                  ))}
                </div>
              )}
              {favoriteNumbersList.length > 0 && (
                <div style={styles.favoriteStats}>
                  <div><strong>Selected:</strong> {favoriteNumbersList.slice(0, 5).join(", ")}{favoriteNumbersList.length > 5 ? ` +${favoriteNumbersList.length - 5}` : ""}</div>
                  <div style={styles.statsGrid}>
                    {['B','I','N','G','O'].map(col => (<div key={col} style={styles.statItem}><div>{col}: {favoriteStats.byColumn[col]}</div></div>))}
                  </div>
                  <button onClick={clearFavorites} style={{ marginTop: "0.3rem", padding: "0.2rem 0.4rem", background: "#ff4757", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.7rem" }}>Clear</button>
                </div>
              )}

              <div style={styles.favoriteListsSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <h5 style={{ margin: 0, fontSize: "0.8rem" }}>📋 Lists</h5>
                  <button onClick={() => setShowFavoriteLists(!showFavoriteLists)} style={styles.smallButton}>{showFavoriteLists ? "▼" : "▶"}</button>
                </div>
                {showFavoriteLists && (
                  <>
                    <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.5rem" }}>
                      <input type="text" placeholder="List name" value={currentListName} onChange={(e) => setCurrentListName(e.target.value)} style={{ ...styles.input, flex: 1, fontSize: "0.7rem" }} />
                      <button onClick={saveCurrentList} style={styles.smallButton}>Save</button>
                    </div>
                    {getPredefinedLists().slice(0, 3).map(list => (
                      <div key={list.id} className="list-item" style={styles.listItem}>
                        <div onClick={() => loadPredefinedList(list)} style={{ flex: 1 }}>
                          <div style={styles.listName}>{list.name}</div>
                          <div style={styles.listDetails}>{list.numbers.length} numbers</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={isGenerating} style={{ ...styles.generateButton, opacity: isGenerating ? 0.6 : 1 }}>
              {isGenerating ? "Generating..." : "🎲 Generate"}
            </button>
          </div>

          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>🎱 Ball Draw</h3>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "0.75rem" }}>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.7rem" }}>Drawn</span><span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{highlightNumbers.length}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.7rem" }}>Remaining</span><span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{75 - highlightNumbers.length}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "#666", fontSize: "0.7rem" }}>Max</span><span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{CONSTANTS.MAX_BALLS}</span></div>
            </div>
            <div style={{ height: "6px", background: "#e0e0e0", borderRadius: "3px", marginBottom: "0.75rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(highlightNumbers.length / CONSTANTS.MAX_BALLS) * 100}%`, background: "linear-gradient(90deg, #667eea, #764ba2)", transition: "width 0.3s ease" }} />
            </div>
            <div style={styles.autoAdvanceToggle}>
              <input type="checkbox" id="autoAdvance" checked={autoAdvanceRound} onChange={(e) => setAutoAdvanceRound(e.target.checked)} />
              <label htmlFor="autoAdvance">Auto-advance</label>
            </div>
            <button onClick={selectRandomBallSafe} style={styles.randomBallButton}>🎲 Random</button>
            <button onClick={handleNewRound} style={styles.newRoundButton} className="new-round-button">🆕 New Round</button>
            <button onClick={recordBingoResult} style={styles.recordResultButton} className="record-result-button" disabled={!myCards.length && !generatedCards.length || winners[currentPattern]?.length === 0}>🏆 Record BINGO</button>
            <button onClick={handleReset} style={styles.resetButton}>🔄 Reset</button>
          </div>
        </div>

        {/* Continue with the rest of the component - same as before but with responsive adjustments */}
        {/* The remaining JSX remains the same as in the previous version */}
        {showRoundHistory && (
          <div style={styles.roundHistorySection}>
            <div style={styles.roundHistoryHeader} className="round-history-header">
              <h3 style={styles.roundHistoryTitle}>
                📜 Round History ({roundHistory.length})
              </h3>
              <div style={styles.roundHistoryControls}>
                {roundHistory.length > 0 && (
                  <>
                    <button onClick={exportRoundHistory} style={styles.exportButton}>📥</button>
                    <button onClick={clearRoundHistory} style={{...styles.deleteButton, padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.7rem"}}>🗑️</button>
                  </>
                )}
              </div>
            </div>
            {roundHistory.length > 0 ? (
              <>
                <div style={styles.roundTabs}>
                  {roundHistory.slice(-10).map(round => (
                    <button key={round.roundNumber} onClick={() => setSelectedRound(round.roundNumber)} style={styles.roundTab(selectedRound === round.roundNumber)} className="round-tab">
                      R{round.roundNumber}<span style={{ marginLeft: "0.2rem", fontSize: "0.6rem" }}>({round.ballCount})</span>
                    </button>
                  ))}
                </div>
                {selectedRound && roundStatsByRound[selectedRound] && (
                  <div style={styles.roundDetail}>
                    <div style={styles.roundDetailHeader} className="round-detail-header">
                      <h4 style={{ margin: 0, fontSize: "0.9rem" }}>Round {selectedRound}</h4>
                      <span style={{ color: "#666", fontSize: "0.7rem" }}>{roundHistory.find(r => r.roundNumber === selectedRound)?.timestamp}</span>
                    </div>
                    <div style={styles.roundStatsGrid}>
                      <div style={styles.roundStatCard}><div style={styles.roundStatValue}>{roundStatsByRound[selectedRound].totalBalls}</div><div style={styles.roundStatLabel}>Balls</div></div>
                      <div style={styles.roundStatCard}><div style={styles.roundStatValue}>{roundStatsByRound[selectedRound].uniqueNumbers}</div><div style={styles.roundStatLabel}>Unique</div></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: "center", color: "#999", padding: "1rem", fontSize: "0.8rem" }}>No rounds completed yet.</p>
            )}
          </div>
        )}

        {showRoundFrequency && (
          <div style={styles.roundFrequencySection}>
            <div style={styles.roundFrequencyHeader} className="round-frequency-header">
              <h3 style={styles.roundFrequencyTitle}>
                📊 Frequency
              </h3>
            </div>
            <div style={styles.columnLegend}>
              {CONSTANTS.COLUMNS.map(col => (
                <div key={col} style={styles.legendItem(getColumnColor(col))}>
                  <span style={{ fontWeight: 'bold' }}>{col}</span>
                </div>
              ))}
            </div>
            <div style={styles.roundFrequencyGrid} className="round-frequency-grid">
              {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => {
                const frequency = roundFrequency.find(f => f.number === num)?.count || 0;
                const isSelected = selectedNumber === num;
                const isFavorite = favoriteNumbersList.includes(num);
                const column = getColumnForNumber(num);
                return (
                  <div key={num} className="round-frequency-item" onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                    style={{ ...styles.roundFrequencyItem(frequency, isSelected, isFavorite), borderLeft: `3px solid ${getColumnColor(column)}` }}>
                    <span>{num}</span>
                    {frequency > 0 && (<span style={styles.frequencyBadge}>{frequency}</span>)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(myCards.length > 0 || generatedCards.length > 0) && (
          <div style={styles.ballsSection}>
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>🎯 Called Numbers</h3>
            <form onSubmit={handleManualNumberSubmitSafe} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="number" value={manualNumberInput} onChange={(e) => setManualNumberInput(e.target.value)} placeholder="Enter number" min="1" max="75" style={{ flex: 1, padding: "0.5rem", border: "2px solid #667eea", borderRadius: "6px", fontSize: "0.9rem" }} />
                <button type="submit" style={{ padding: "0.5rem 1rem", background: "#667eea", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Add</button>
              </div>
            </form>
            <div style={styles.ballsGrid} className="balls-grid">
              {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => {
                const active = highlightNumbers.includes(num);
                const frequency = numberFrequency[num] || 0;
                const isFavorite = favoriteNumbersList.includes(num);
                return (
                  <div key={num} onClick={() => toggleNumberSafe(num)} style={{ ...styles.ball(active), ...(isFavorite ? styles.favoriteBall : {}) }}>
                    <span style={{ fontWeight: "bold", fontSize: "clamp(0.6rem, 2.5vw, 0.8rem)" }}>{num}</span>
                    {frequency > 0 && (<span style={{ fontSize: "0.5rem", background: active ? "#fbc02d" : "#667eea", color: "white", padding: "0.1rem 0.2rem", borderRadius: "6px", marginTop: "0.1rem" }}>{frequency}</span>)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(myCards.length > 0 || generatedCards.length > 0) && (
          <div style={styles.cardSectionTabs} className="card-section-tabs">
            <button onClick={() => setActiveCardSection("myCards")} style={styles.cardSectionTab(activeCardSection === "myCards")} className="card-section-tab">
              <span>🎯 My Cards</span>
              <span style={{ background: activeCardSection === "myCards" ? "rgba(255,255,255,0.3)" : "#667eea", color: "white", padding: "0.15rem 0.6rem", borderRadius: "16px", fontSize: "0.7rem" }}>{myCards.length}</span>
            </button>
            <button onClick={() => setActiveCardSection("generated")} style={styles.cardSectionTab(activeCardSection === "generated")} className="card-section-tab">
              <span>🎴 Generated</span>
              <span style={{ background: activeCardSection === "generated" ? "rgba(255,255,255,0.3)" : "#764ba2", color: "white", padding: "0.15rem 0.6rem", borderRadius: "16px", fontSize: "0.7rem" }}>{generatedCards.length}</span>
            </button>
          </div>
        )}

        {activeCardSection === "myCards" && myCards.length > 0 && (
          <div style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
            <div style={styles.cardsContainer} className="cards-container">
              {myRankedCards.map(({ card, idx, section, isWinner, progress, winPercentage, winningPatterns, isPinned, favoriteCount, label }) => (
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
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", flexWrap: "wrap", gap: "0.2rem" }}>
                          <span style={{ fontWeight: "bold", color: "#666", fontSize: "0.7rem" }}>{formatSerial(idx, "MY")}</span>
                          {favoriteCount > 0 && (<span style={{ background: "#ffd700", padding: "0.1rem 0.3rem", borderRadius: "10px", fontSize: "0.65rem" }}>⭐{favoriteCount}</span>)}
                        </div>
                        <div style={{ height: "3px", background: "#e0e0e0", borderRadius: "2px", marginBottom: "0.3rem" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #4CAF50, #8BC34A)" }} />
                        </div>
                        <div style={{ textAlign: "center", marginBottom: "0.3rem", fontSize: "0.7rem", color: "#666" }}>{Math.round(winPercentage)}%</div>
                        <div style={styles.bingoHeader}>
                          {CONSTANTS.COLUMNS.map(letter => (<span key={letter} style={styles.bingoLetter}>{letter}</span>))}
                        </div>
                        <div style={styles.bingoGrid}>
                          {[0,1,2,3,4].map((row) => (
                            <div key={row} style={styles.bingoRow}>
                              {[0,1,2,3,4].map((col) => {
                                const cell = card[col][row];
                                const isHighlighted = highlightNumbers.includes(cell);
                                const isFree = cell === "FREE";
                                const isFavorite = !isFree && favoriteNumbersList.includes(cell);
                                if (editingCard === `${section}-${idx}`) {
                                  return (<input key={col} type="text" value={cell} onChange={(e) => updateCell(col, row, e.target.value, e)} onClick={(e) => e.stopPropagation()} style={styles.editInput(false)} />);
                                }
                                return (
                                  <div key={col} style={styles.bingoCell(isHighlighted, isFree, isFavorite, false)}>
                                    {isFree ? "⭐" : cell}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div style={styles.flipHint}>👆 Click</div>
                      </div>
                    </div>
                    <div style={styles.cardBack}>
                      <div style={styles.backHeader}>🏆 Patterns</div>
                      {winningPatterns.length > 0 ? (
                        <div style={styles.patternsList}>
                          {winningPatterns.slice(0, 3).map((pattern, index) => (
                            <div key={index} style={styles.patternItem} onClick={(e) => { e.stopPropagation(); setCurrentPattern(pattern.id); toggleCardFlip(idx, section); }}>
                              <span>{pattern.icon}</span><span>{pattern.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (<div style={styles.noPatterns}>No winning patterns</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCardSection === "generated" && generatedCards.length > 0 && (
          <div style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
            <div style={styles.cardsContainer} className="cards-container">
              {generatedRankedCards.map(({ card, idx, section, isWinner, progress, winPercentage, winningPatterns, isPinned, favoriteCount, label }) => (
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
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", flexWrap: "wrap", gap: "0.2rem" }}>
                          <span style={{ fontWeight: "bold", color: "#666", fontSize: "0.7rem" }}>{formatSerial(idx, "GEN")}</span>
                          {favoriteCount > 0 && (<span style={{ background: "#ffd700", padding: "0.1rem 0.3rem", borderRadius: "10px", fontSize: "0.65rem" }}>⭐{favoriteCount}</span>)}
                        </div>
                        <div style={{ height: "3px", background: "#e0e0e0", borderRadius: "2px", marginBottom: "0.3rem" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #4CAF50, #8BC34A)" }} />
                        </div>
                        <div style={{ textAlign: "center", marginBottom: "0.3rem", fontSize: "0.7rem", color: "#666" }}>{Math.round(winPercentage)}%</div>
                        <div style={styles.bingoHeader}>
                          {CONSTANTS.COLUMNS.map(letter => (<span key={letter} style={styles.bingoLetter}>{letter}</span>))}
                        </div>
                        <div style={styles.bingoGrid}>
                          {[0,1,2,3,4].map((row) => (
                            <div key={row} style={styles.bingoRow}>
                              {[0,1,2,3,4].map((col) => {
                                const cell = card[col][row];
                                const isHighlighted = highlightNumbers.includes(cell);
                                const isFree = cell === "FREE";
                                const isFavorite = !isFree && favoriteNumbersList.includes(cell);
                                if (editingCard === `${section}-${idx}`) {
                                  return (<input key={col} type="text" value={cell} onChange={(e) => updateCell(col, row, e.target.value, e)} onClick={(e) => e.stopPropagation()} style={styles.editInput(false)} />);
                                }
                                return (
                                  <div key={col} style={styles.bingoCell(isHighlighted, isFree, isFavorite, false)}>
                                    {isFree ? "⭐" : cell}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div style={styles.flipHint}>👆 Click</div>
                      </div>
                    </div>
                    <div style={styles.cardBack}>
                      <div style={styles.backHeader}>🏆 Patterns</div>
                      {winningPatterns.length > 0 ? (
                        <div style={styles.patternsList}>
                          {winningPatterns.slice(0, 3).map((pattern, index) => (
                            <div key={index} style={styles.patternItem} onClick={(e) => { e.stopPropagation(); setCurrentPattern(pattern.id); toggleCardFlip(idx, section); }}>
                              <span>{pattern.icon}</span><span>{pattern.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (<div style={styles.noPatterns}>No winning patterns</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals remain the same as before */}
      {showProfileModal && (
        <div style={styles.modal} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.profileHeader}>
              <div style={styles.profileAvatar}>{profileData.avatar}</div>
              <div style={styles.profileName}>{profileData.name}</div>
              <div style={styles.profileLevel}>Level {profileData.level}</div>
            </div>
            <div style={styles.profileStats}>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.experience}</div><div style={styles.profileStatLabel}>XP</div></div>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.gamesPlayed}</div><div style={styles.profileStatLabel}>Games</div></div>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.winRate}%</div><div style={styles.profileStatLabel}>Win Rate</div></div>
              <div style={styles.profileStat}><div style={styles.profileStatValue}>{profileData.favoritePattern}</div><div style={styles.profileStatLabel}>Favorite</div></div>
            </div>
            <div style={styles.profileFooter}>Member since {profileData.joinDate}</div>
            <button onClick={() => setShowProfileModal(false)} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {showLabelModal && labelCardIndex !== null && (
        <div style={styles.modal} onClick={() => setShowLabelModal(false)}>
          <div style={styles.labelModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Edit Label</h3>
            <div style={styles.emojiPicker}>
              {AVAILABLE_EMOJIS.slice(0, 6).map(emoji => (
                <div key={emoji} style={styles.emojiOption} className="emoji-option"
                  onClick={() => { setCardLabels(prev => ({ ...prev, [`${labelCardSection}-${labelCardIndex}`]: { ...prev[`${labelCardSection}-${labelCardIndex}`], emoji: emoji } })); }}>
                  {emoji}
                </div>
              ))}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input type="text" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} style={styles.input} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => { updateCardLabel(labelCardIndex, labelCardSection, { name: labelInput, emoji: cardLabels[`${labelCardSection}-${labelCardIndex}`]?.emoji || "🎴" }); }} style={styles.generateButton}>Save</button>
              <button onClick={() => setShowLabelModal(false)} style={{...styles.resetButton, width: "auto", padding: "0.6rem 1.2rem"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div style={styles.modal} onClick={() => setShowResults(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.2rem" }}>🏆 Results</h2>
            {gameResults.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "1rem" }}>No results yet.</p>
            ) : (
              <>
                {stats && (
                  <div style={styles.statsContainer}>
                    <div style={styles.statsGridMain}>
                      <div style={styles.statBox}><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{stats.totalGames}</div><div>Games</div></div>
                      <div style={styles.statBox}><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{stats.averageBallsToWin}</div><div>Avg Balls</div></div>
                    </div>
                  </div>
                )}
                {gameResults.slice(0, 5).map(result => (
                  <div key={result.id} style={styles.resultItem}>
                    <div style={styles.resultHeader}>
                      <div><strong>{result.patternIcon} {result.patternName}</strong></div>
                      <span style={styles.winnerBadge}>{result.winnerCount}</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#666" }}>{result.timestamp}</div>
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
            <h2 style={{ fontSize: "1.2rem" }}>📜 History</h2>
            {gameHistory.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "1rem" }}>No history yet.</p>
            ) : (
              gameHistory.slice(0, 10).map(history => (
                <div key={history.id} style={styles.historyItem}>
                  <div style={styles.historyPattern}><span>{history.patternIcon}</span><span>{history.pattern}</span></div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>{history.timestamp}</div>
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
            <h2 style={{ fontSize: "1.2rem" }}>💾 Saved Cards ({savedCards.length})</h2>
            {savedCards.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "1rem" }}>No saved cards yet.</p>
            ) : (
              savedCards.slice(0, 10).map(savedCard => (
                <div key={savedCard.id} style={styles.savedCardItem}>
                  <div style={styles.savedCardInfo} onClick={() => loadSavedCard(savedCard)}>
                    <div><strong>{savedCard.label?.name || savedCard.serial}</strong></div>
                    <div style={styles.savedCardDate}>{savedCard.date}</div>
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
