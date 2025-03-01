// Data riwayat chat
let chatHistory = [];
let currentChatId = null;

// Event listener untuk tombol New Chat
document.getElementById('new-chat-btn').addEventListener('click', createNewChat);

// Event listener untuk tombol kirim
document.getElementById('send-btn').addEventListener('click', sendMessage);

// Event listener untuk toggle sidebar di mobile
document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);

// Fungsi untuk toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');

    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        container.classList.remove('active');
    } else {
        sidebar.classList.add('active');
        container.classList.add('active');
    }
}

// Fungsi untuk membuat chat baru
function createNewChat() {
    currentChatId = Date.now(); // Gunakan timestamp sebagai ID chat
    chatHistory.push({
        id: currentChatId,
        messages: []
    });
    renderChatHistory();
    loadChat(currentChatId);
}

// Fungsi untuk memuat chat berdasarkan ID
function loadChat(chatId) {
    const chat = chatHistory.find(chat => chat.id === chatId);
    if (chat) {
        currentChatId = chatId;
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = ''; // Kosongkan chat box
        chat.messages.forEach(message => {
            appendMessage(message.sender, message.text);
        });
    }
}

// Fungsi untuk menampilkan riwayat chat di sidebar
function renderChatHistory() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = chatHistory.map(chat => `
        <li onclick="loadChat(${chat.id})">
            Chat ${new Date(chat.id).toLocaleTimeString()}
        </li>
    `).join('');
}

// Fungsi untuk mengirim pesan
function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === "") return;

    // Tampilkan pesan pengguna di chat box
    appendMessage('user', userInput);

    // Simpan pesan ke riwayat chat
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (currentChat) {
        currentChat.messages.push({ sender: 'user', text: userInput });
    }

    // Kosongkan input field
    document.getElementById('user-input').value = '';

    // Panggil API Gemini untuk mendapatkan respons AI
    fetchGeminiResponse(userInput)
        .then(response => {
            appendMessage('ai', response);

            // Simpan respons AI ke riwayat chat
            if (currentChat) {
                currentChat.messages.push({ sender: 'ai', text: response });
            }
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

// Buat chat baru saat pertama kali memuat halaman
createNewChat();