// Event listener untuk tombol kirim
document.getElementById('send-btn').addEventListener('click', sendMessage);

// Event listener untuk menyesuaikan posisi input area saat keyboard muncul
document.getElementById('user-input').addEventListener('focus', adjustInputArea);
document.getElementById('user-input').addEventListener('blur', resetInputArea);

// Fungsi untuk mengirim pesan
function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === "") return;

    // Tampilkan pesan pengguna di chat box
    appendMessage('user', userInput);

    // Kosongkan input field
    document.getElementById('user-input').value = '';

    // Panggil API Gemini untuk mendapatkan respons AI
    fetchGeminiResponse(userInput)
        .then(response => {
            appendMessage('ai', response);
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('ai', 'Sorry, there was an error processing your request.');
        });
}

// Fungsi untuk menambahkan pesan ke chat box
function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll ke pesan terbaru
}

// Fungsi untuk memanggil API Gemini
async function fetchGeminiResponse(userInput) {
    const apiKey = 'AIzaSyAkv5cxhspZHBuq--O3i4ZD93UbAWbpxig'; // Ganti dengan API key Gemini Anda
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: userInput
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Untuk debugging

        // Ekstrak respons AI dari struktur data
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Fungsi untuk menyesuaikan posisi input area saat keyboard muncul
function adjustInputArea() {
    const inputArea = document.querySelector('.input-area');
    const chatBox = document.getElementById('chat-box');

    // Hitung tinggi keyboard secara dinamis
    const viewportHeight = window.innerHeight;
    const inputAreaHeight = inputArea.offsetHeight;
    const chatBoxBottom = chatBox.getBoundingClientRect().bottom;

    // Jika input area tertutup oleh keyboard
    if (chatBoxBottom > viewportHeight - inputAreaHeight) {
        const offset = chatBoxBottom - (viewportHeight - inputAreaHeight);
        chatBox.style.marginBottom = `${offset + 10}px`; // Beri ruang ekstra
    }
}

// Fungsi untuk mengembalikan posisi input area ke semula saat keyboard hilang
function resetInputArea() {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.marginBottom = '15px'; // Kembalikan ke nilai default
}