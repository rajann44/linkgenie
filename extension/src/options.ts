document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
  const personaInput = document.getElementById('persona') as HTMLTextAreaElement;
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  // Load configuration settings
  chrome.storage.sync.get(['apiUrl', 'persona'], (items) => {
    apiUrlInput.value = items.apiUrl || 'http://localhost:3000/api/generate';
    personaInput.value = items.persona || '';
  });

  // Save configuration settings
  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim();
    const persona = personaInput.value.trim();

    chrome.storage.sync.set({ apiUrl, persona }, () => {
      // Show success indicator
      statusDiv.textContent = 'Settings saved successfully!';
      statusDiv.className = 'status success';
      
      setTimeout(() => {
        statusDiv.style.display = 'none';
        statusDiv.className = 'status';
      }, 3000);
    });
  });
});
