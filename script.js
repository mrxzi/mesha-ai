document.getElementById('send-btn').addEventListener('click', sendMessage);

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === "") return;

    // Display user message in chat box
    appendMessage('user', userInput);

    // Clear input field
    document.getElementById('user-input').value = '';

    // Call Gemini API
    fetchGeminiResponse(userInput)
        .then(response => {
            appendMessage('ai', response);
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('ai', 'Sorry, there was an error processing your request.');
        });
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchGeminiResponse(userInput) {
    const apiKey = 'AIzaSyAkv5cxhspZHBuq--O3i4ZD93UbAWbpxig'; // Ganti dengan API key Anda
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

        // Extract the AI's response
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