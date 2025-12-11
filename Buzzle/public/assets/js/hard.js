const API_URL = 'auth/puzzle.php';
const TIME_LIMIT = 30; // 30 seconds for hard mode
const WIN_PUZZLES = 3; // Win after 3 puzzles completed correctly

let currentPuzzle = null;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let isGameActive = false;
let score = 0;
let gameStartTime = null;
let lastAnswerCorrect = false;
let puzzlesSolved = 0; // Track number of puzzles solved correctly

// DOM Elements
const puzzleImage = document.getElementById('puzzleImage');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const exitBtn = document.getElementById('exitBtn');
const timerDisplay = document.getElementById('timer');
const messageDiv = document.getElementById('message');

// Initialize game
document.addEventListener('DOMContentLoaded', async () => {
  gameStartTime = Date.now();
  await loadPuzzle();
  startTimer();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  submitBtn.addEventListener('click', handleSubmit);
  answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  });
  exitBtn.addEventListener('click', handleExit);
}

// Load puzzle from API
async function loadPuzzle() {
  try {
    puzzleImage.innerHTML = '<div class="loading">Loading puzzle...</div>';
    messageDiv.textContent = '';
    messageDiv.className = 'message hidden';

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch puzzle');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to load puzzle');
    }

    currentPuzzle = {
      question: result.question,
      solution: String(result.solution)
    };

    // Display the puzzle image
    const img = document.createElement('img');
    img.src = currentPuzzle.question;
    img.alt = 'Math Puzzle';
    img.onload = () => {
      puzzleImage.innerHTML = '';
      puzzleImage.appendChild(img);
      isGameActive = true;
      answerInput.focus();
    };

    img.onerror = () => {
      puzzleImage.innerHTML = '<div class="loading" style="color: var(--error);">Failed to load puzzle image</div>';
      showMessage('Failed to load puzzle image. Please try again.', 'error');
    };
  } catch (error) {
    console.error('Error loading puzzle:', error);
    puzzleImage.innerHTML = '<div class="loading" style="color: var(--error);">Error loading puzzle. Please try again.</div>';
    showMessage(error.message || 'Failed to load puzzle. Please refresh the page.', 'error');
  }
}

// Handle answer submission
async function handleSubmit() {
  if (!isGameActive || !currentPuzzle) {
    return;
  }

  const userAnswer = answerInput.value.trim();
  if (!userAnswer) {
    showMessage('Please enter an answer', 'error');
    return;
  }

  // Check if answer is correct (convert both to strings for comparison)
  const correctAnswer = String(currentPuzzle.solution).trim();
  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect) {
    score += 10; // Increment score for correct answer
    puzzlesSolved++; // Increment puzzles solved counter
    lastAnswerCorrect = true;
    showMessage('Correct! 🎉', 'success');
    isGameActive = false;
    clearInterval(timerInterval);
    submitBtn.disabled = true;
    answerInput.disabled = true;

    // Check if win condition is met
    if (puzzlesSolved >= WIN_PUZZLES) {
      // Calculate time taken
      const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : TIME_LIMIT;
      
      // Navigate to win page
      setTimeout(() => {
        window.location.href = `win.html?score=${score}&timeTaken=${timeTaken}&difficulty=hard&puzzlesSolved=${puzzlesSolved}`;
      }, 1500);
      return;
    }

    // Wait a moment, then load next puzzle
    setTimeout(async () => {
      await loadPuzzle();
      resetTimer();
      submitBtn.disabled = false;
      answerInput.disabled = false;
      answerInput.value = '';
    }, 2000);
  } else {
    lastAnswerCorrect = false;
    showMessage('Incorrect. Try again!', 'error');
    answerInput.value = '';
    answerInput.focus();
  }
}

// Show message to user
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  
  // Auto-hide after 3 seconds for error messages
  if (type === 'error') {
    setTimeout(() => {
      messageDiv.className = 'message hidden';
    }, 3000);
  }
}

// Timer functions
function startTimer() {
  isGameActive = true;
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
      return;
    }
    
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 10) {
      timerDisplay.style.color = 'var(--error)';
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = TIME_LIMIT;
  timerDisplay.textContent = timeLeft;
  timerDisplay.style.color = '';
  startTimer();
}

function endGame() {
  // Prevent multiple calls
  if (!isGameActive && timeLeft <= 0) {
    return;
  }

  clearInterval(timerInterval);
  isGameActive = false;
  isNavigatingAway = true; // Set flag to prevent beforeunload dialog
  timeLeft = 0;
  if (timerDisplay) timerDisplay.textContent = '0';
  
  if (submitBtn) submitBtn.disabled = true;
  if (answerInput) answerInput.disabled = true;
  
  // Calculate time taken
  const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : TIME_LIMIT;
  
  // Remove beforeunload listener to prevent blocking navigation
  window.removeEventListener('beforeunload', beforeUnloadHandler);
  
  // Redirect immediately to result page with game data
  const url = `result.html?score=${score}&timeTaken=${timeTaken}&difficulty=hard&correct=${lastAnswerCorrect}&puzzlesSolved=${puzzlesSolved}`;
  window.location.replace(url); // Use replace to avoid back button issues
}

// Handle exit
function handleExit() {
  if (confirm('Are you sure you want to exit the game?')) {
    clearInterval(timerInterval);
    window.location.href = 'Home.html';
  }
}

// Flag to track if we're intentionally navigating
let isNavigatingAway = false;

// Store beforeunload handler reference
const beforeUnloadHandler = (e) => {
  // Don't show confirm dialog if we're intentionally navigating
  if (isNavigatingAway || !isGameActive) {
    return;
  }
  e.preventDefault();
  e.returnValue = '';
};

// Prevent accidental page refresh
window.addEventListener('beforeunload', beforeUnloadHandler);

