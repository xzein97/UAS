(function() {
  const apiKey = "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";
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'; // Pastikan URL ini benar sesuai dokumentasi API Anda

  // Buat elemen overlay floating
  const botContainer = document.createElement('div');
  botContainer.style.position = 'fixed';
  botContainer.style.top = '20px';
  botContainer.style.right = '20px';
  botContainer.style.width = '300px';
  botContainer.style.height = '400px';
  botContainer.style.backgroundColor = 'white';
  botContainer.style.border = '1px solid #ccc';
  botContainer.style.borderRadius = '8px';
  botContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  botContainer.style.zIndex = '9999';
  botContainer.style.display = 'flex';
  botContainer.style.flexDirection = 'column';
  botContainer.style.fontFamily = 'Arial, sans-serif';

  // Header bar untuk hide/unhide
  const header = document.createElement('div');
  header.style.backgroundColor = '#007bff';
  header.style.color = 'white';
  header.style.padding = '8px';
  header.style.cursor = 'pointer';
  header.innerText = 'AI Assistant (Ctrl+Y to toggle)';
  botContainer.appendChild(header);

  // Area untuk menampilkan response
  const resultBox = document.createElement('textarea');
  resultBox.style.flex = '1';
  resultBox.style.width = '100%';
  resultBox.style.marginTop = '8px';
  resultBox.style.padding = '8px';
  resultBox.style.border = '1px solid #ccc';
  resultBox.style.borderRadius = '4px';
  resultBox.style.resize = 'none';
  resultBox.placeholder = 'Jawaban AI akan muncul di sini...';
  botContainer.appendChild(resultBox);

  document.body.appendChild(botContainer);

  let hidden = false;

  // Toggle visibility dengan Ctrl+Y
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'y') {
      hidden = !hidden;
      botContainer.style.display = hidden ? 'none' : 'flex';
    }
  });

  // Fungsi untuk mengirim ke API OpenRouter
  async function askAI(question) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: question,
          model: 'gpt-3.5-turbo',
          max_tokens: 150,
          temperature: 0.7,
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.choices && data.choices[0].text.trim();
    } catch (err) {
      console.error('Error:', err);
      return 'Gagal mendapatkan jawaban. Periksa koneksi dan API.';
    }
  }

  // Fungsi untuk mencari soal di halaman
  function extractQuestion() {
    // Sesuaikan selector sesuai halaman
    const questionElems = document.querySelectorAll('p, span, div');
    let questionText = '';
    questionElems.forEach(elem => {
      if (elem.innerText && /soal|question|berikut/i.test(elem.innerText)) {
        questionText += elem.innerText + '\n';
      }
    });
    // Jika tidak ketemu, ambil seluruh halaman
    if (!questionText) {
      questionText = document.body.innerText;
    }
    return questionText;
  }

  // Otomatis kirim pertanyaan dan tampilkan jawaban
  async function processQuestion() {
    const question = extractQuestion();
    resultBox.value = 'Memproses soal...';
    const answer = await askAI(question);
    resultBox.value = answer;
  }

  // Pantau perubahan DOM dan otomatis proses
  let observer = new MutationObserver(() => {
    // Debounce agar tidak terlalu sering
    clearTimeout(observer.timeout);
    observer.timeout = setTimeout(() => {
      processQuestion();
    }, 2000);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Klik header untuk manual refresh
  header.addEventListener('click', () => {
    processQuestion();
  });

  // Jalankan otomatis pertama kali
  processQuestion();

})();
