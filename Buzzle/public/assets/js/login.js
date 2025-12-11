document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const statusMessage = document.querySelector('.status-message');
  const registerBtn = document.querySelector('.register-btn');

  registerBtn?.addEventListener('click', () => {
    window.location.href = 'register.html';
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      statusMessage.textContent = 'Please fill in both fields.';
      statusMessage.className = 'status-message error';
      return;
    }

    const formData = new FormData(form);
    statusMessage.textContent = 'Signing you in...';
    statusMessage.className = 'status-message';

    try {
      const response = await fetch('auth/login.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        statusMessage.textContent = result.message;
        statusMessage.className = 'status-message success';
        form.reset();
        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = 'Home.html';
        }, 1500);
      } else {
        statusMessage.textContent = result.message || 'Login failed.';
        statusMessage.className = 'status-message error';
      }
    } catch (error) {
      console.error(error);
      statusMessage.textContent = 'Server unreachable. Please try again later.';
      statusMessage.className = 'status-message error';
    }
  });
});

