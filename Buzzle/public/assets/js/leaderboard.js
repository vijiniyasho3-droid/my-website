document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#leaderboardBody');
  const backButton = document.querySelector('.back-btn');

  const renderRows = (entries) => {
    tableBody.innerHTML = '';

    if (!entries.length) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="4" class="empty-state">No scores yet. Play a puzzle to be the first!</td>`;
      tableBody.appendChild(emptyRow);
      return;
    }

    entries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username}</td>
        <td>${entry.score} pts</td>
        <td>${entry.difficulty}</td>
      `;
      tableBody.appendChild(row);
    });
  };

  try {
    const response = await fetch('auth/leaderboard.php');
    const result = await response.json();

    if (result.success) {
      renderRows(result.entries);
    } else {
      renderRows([]);
    }
  } catch (error) {
    console.error(error);
    renderRows([]);
  }

  backButton?.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
});

