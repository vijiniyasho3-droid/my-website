document.addEventListener('DOMContentLoaded', async () => {
  const usernameTarget = document.querySelector('[data-username]');
  const difficultyButtons = document.querySelectorAll('.difficulty-chip');

  try {
    const response = await fetch('auth/session.php', { credentials: 'include' });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.username) {
        usernameTarget.textContent = result.username;
      }
    }
  } catch (error) {
    console.error('Session fetch failed', error);
  }

  difficultyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      // Navigate to the appropriate difficulty page
      const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
      window.location.href = `${modeCapitalized}.html`;
    });
  });
});

