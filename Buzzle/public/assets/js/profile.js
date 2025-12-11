document.addEventListener('DOMContentLoaded', async () => {
  const usernameEl = document.querySelector('[data-username]');
  const emailEl = document.querySelector('[data-email]');
  const difficultyEl = document.querySelector('[data-difficulty]');
  const gamesEl = document.querySelector('[data-games-played]');
  const puzzlesEl = document.querySelector('[data-puzzles-solved]');
  const avgScoreEl = document.querySelector('[data-average-score]');
  const profileAvatar = document.getElementById('profileAvatar');
  const statusMessage = document.querySelector('.status-message');
  const editBtn = document.querySelector('.edit-btn');
  const logoutBtn = document.querySelector('.logout-btn');

  const updateStatus = (message, isError = true) => {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
  };

  try {
    const response = await fetch('auth/profile.php', {
      credentials: 'include',
    });
    const result = await response.json();

    if (result.success) {
      const profile = result.profile;
      usernameEl.textContent = profile.username;
      emailEl.textContent = profile.email;
      difficultyEl.textContent = profile.difficulty;
      gamesEl.textContent = profile.gamesPlayed;
      puzzlesEl.textContent = profile.puzzlesSolved;
      avgScoreEl.textContent = `${profile.averageScore} pts`;
      
      // Update profile picture if available
      if (profile.profilePicture && profileAvatar) {
        profileAvatar.src = profile.profilePicture;
        profileAvatar.onerror = () => {
          // Fallback to default if image fails to load
          profileAvatar.src = 'public/assets/img/buzzle-icon.svg';
        };
      }
    } else {
      updateStatus(result.message || 'Unable to load profile.');
    }
  } catch (error) {
    console.error(error);
    updateStatus('Server unavailable. Please try again later.');
  }

  editBtn?.addEventListener('click', () => {
    window.location.href = 'EditProfile.html';
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      const response = await fetch('auth/logout.php', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        updateStatus('Logging out...', false);
        setTimeout(() => {
          window.location.href = 'Login.html';
        }, 800);
      } else {
        updateStatus(result.message || 'Could not log out.');
      }
    } catch (error) {
      console.error(error);
      updateStatus('Network error during logout.');
    }
  });
});



