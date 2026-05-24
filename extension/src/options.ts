document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('provider') as HTMLSelectElement;
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const modelInput = document.getElementById('model') as HTMLInputElement;
  const personaInput = document.getElementById('persona') as HTMLTextAreaElement;
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  // Load configuration settings
  chrome.storage.sync.get(['provider', 'apiKey', 'model', 'persona'], (items) => {
    providerSelect.value = items.provider || 'gemini';
    apiKeyInput.value = items.apiKey || '';
    modelInput.value = items.model || '';
    personaInput.value = items.persona || '';
  });

  // Save configuration settings
  saveBtn.addEventListener('click', () => {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    const persona = personaInput.value.trim();

    chrome.storage.sync.set({ provider, apiKey, model, persona }, () => {
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
