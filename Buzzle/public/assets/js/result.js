document.addEventListener('DOMContentLoaded', () => {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const score = parseInt(urlParams.get('score')) || 0;
  const timeTaken = parseInt(urlParams.get('timeTaken')) || 0;
  const difficulty = urlParams.get('difficulty') || 'easy';
  const isCorrect = urlParams.get('correct') === 'true';
  const puzzlesSolved = parseInt(urlParams.get('puzzlesSolved')) || 0;

  // Update UI elements
  const scoreValue = document.getElementById('scoreValue');
  const timeValue = document.getElementById('timeValue');
  const resultBadge = document.getElementById('resultBadge');
  const puzzlesSolvedItem = document.getElementById('puzzlesSolvedItem');
  const puzzlesSolvedValue = document.getElementById('puzzlesSolvedValue');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const backMenuBtn = document.getElementById('backMenuBtn');

  // Display score and time
  scoreValue.textContent = `${score} points`;
  timeValue.textContent = `${timeTaken}s`;

  // Display puzzles solved if available
  if (puzzlesSolved > 0) {
    puzzlesSolvedValue.textContent = `${puzzlesSolved} puzzles`;
    puzzlesSolvedItem.style.display = 'flex';
  }

  // Update result badge based on whether last answer was correct
  if (!isCorrect) {
    resultBadge.textContent = 'INCORRECT';
    resultBadge.style.background = '#f44336';
    resultBadge.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)';
  }

  // Play Again button - go back to the same difficulty
  playAgainBtn.addEventListener('click', () => {
    const difficultyCapitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    window.location.href = `${difficultyCapitalized}.html`;
  });

  // Back to Menu button
  backMenuBtn.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
});

