document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const statusMessage = document.querySelector('.status-message');
  const loginLink = document.querySelector('.alternate-link');

  loginLink?.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = 'Login.html';
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      statusMessage.textContent = 'Please complete all required fields.';
      statusMessage.className = 'status-message error';
      return;
    }

    const formData = new FormData(form);
    statusMessage.textContent = 'Creating your account...';
    statusMessage.className = 'status-message';

    try {
      const response = await fetch('auth/register.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        statusMessage.textContent = result.message;
        statusMessage.className = 'status-message success';
        form.reset();
        // Redirect to login page after successful registration
        setTimeout(() => {
          window.location.href = 'Login.html';
        }, 1500);
      } else {
        statusMessage.textContent = result.message || 'Registration failed.';
        statusMessage.className = 'status-message error';
      }
    } catch (error) {
      console.error(error);
      statusMessage.textContent = 'Unable to reach the server. Try again.';
      statusMessage.className = 'status-message error';
    }
  });
});

