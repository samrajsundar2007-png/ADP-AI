const BASE_URL = 'http://localhost:8000/api';

export const api = {
  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('File transformation or security block triggered.');
    return res.json();
  },
  async sendChatMessage(fileId, message) {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, message })
    });
    return res.json();
  },
  async fetchDatasets() {
    const res = await fetch(`${BASE_URL}/datasets`);
    return res.json();
  },
  async removeDataset(id) {
    const res = await fetch(`${BASE_URL}/dataset/${id}`, { method: 'DELETE' });
    return res.json();
  }
};
