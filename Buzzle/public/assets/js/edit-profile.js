document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('editProfileForm');
  const profilePictureInput = document.getElementById('profilePicture');
  const avatarPreview = document.getElementById('avatarPreview');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const statusMessage = document.getElementById('statusMessage');

  let currentProfilePicture = null;

  const updateStatus = (message, isError = false, isHidden = false) => {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isError ? 'error' : 'success'} ${isHidden ? 'hidden' : ''}`;
  };

  // Load current profile data
  try {
    const response = await fetch('auth/profile.php', {
      credentials: 'include',
    });
    const result = await response.json();

    if (result.success) {
      const profile = result.profile;
      usernameInput.value = profile.username;
      emailInput.value = profile.email || '';
      
      // Load profile picture if exists
      if (profile.profilePicture) {
        avatarPreview.src = profile.profilePicture;
        currentProfilePicture = profile.profilePicture;
      }
    } else {
      updateStatus(result.message || 'Unable to load profile.', true);
    }
  } catch (error) {
    console.error(error);
    updateStatus('Server unavailable. Please try again later.', true);
  }

  // Handle profile picture upload preview
  profilePictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        updateStatus('Image size must be less than 5MB.', true);
        profilePictureInput.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        updateStatus('Please select an image file.', true);
        profilePictureInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
      updateStatus('', false, true);
    }
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateStatus('', false, true);
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const formData = new FormData();
    
    // Add username
    const username = usernameInput.value.trim();
    if (username.length < 3) {
      updateStatus('Username must be at least 3 characters.', true);
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
      return;
    }
    formData.append('username', username);

    // Add profile picture if changed
    const profilePicture = profilePictureInput.files[0];
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await fetch('auth/update-profile.php', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateStatus('Profile updated successfully!', false);
        
        // Update avatar preview if new picture was uploaded
        if (result.profilePicture) {
          avatarPreview.src = result.profilePicture;
        }

        // Redirect to profile page after a short delay
        setTimeout(() => {
          window.location.href = 'Profile.html';
        }, 1500);
      } else {
        updateStatus(result.message || 'Failed to update profile.', true);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    } catch (error) {
      console.error(error);
      updateStatus('Network error. Please try again.', true);
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });

  // Handle cancel button
  cancelBtn.addEventListener('click', () => {
    window.location.href = 'Profile.html';
  });
});

