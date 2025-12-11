document.addEventListener('DOMContentLoaded', () => {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const score = parseInt(urlParams.get('score')) || 0;
  const timeTaken = parseInt(urlParams.get('timeTaken')) || 0;
  const difficulty = urlParams.get('difficulty') || 'easy';
  const puzzlesSolved = parseInt(urlParams.get('puzzlesSolved')) || 0;

  // Update UI elements
  const scoreValue = document.getElementById('scoreValue');
  const timeValue = document.getElementById('timeValue');
  const difficultyValue = document.getElementById('difficultyValue');
  const puzzlesSolvedValue = document.getElementById('puzzlesSolvedValue');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const backMenuBtn = document.getElementById('backMenuBtn');

  // Display stats
  scoreValue.textContent = `${score} points`;
  timeValue.textContent = `${timeTaken}s`;
  difficultyValue.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  puzzlesSolvedValue.textContent = `${puzzlesSolved} puzzles`;

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

