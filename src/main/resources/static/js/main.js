document.addEventListener('DOMContentLoaded', function() {
    const questionForm = document.getElementById('questionForm');
    const questionInput = document.getElementById('questionInput');
    const chatMessages = document.getElementById('chatMessages');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const downloadChatBtn = document.getElementById('downloadChatBtn');

    // Обработка отправки формы
    if (questionForm) {
        questionForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Важно: предотвращаем стандартную отправку формы

            const questionText = questionInput.value.trim();
            if (!questionText) return;

            // Скрываем приветственное сообщение
            if (welcomeMessage) {
                welcomeMessage.style.display = 'none';
            }

            // Добавляем вопрос пользователя
            addMessage(questionText, 'user');

            // Очищаем поле ввода
            questionInput.value = '';

            try {
                // Отправляем запрос на сервер
                const response = await fetch('/api/deepseek/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question_text: questionText })
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети');
                }

                const data = await response.json();

                // Добавляем ответ системы
                if (data.answer) {
                    addMessage(data.answer, 'assistant');
                }
            } catch (error) {
                console.error('Error:', error);
                addMessage('Произошла ошибка при получении ответа: ' + error.message, 'assistant');
            }
        });
    }

    // Функция добавления сообщения в чат
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex justify-${sender === 'user' ? 'end' : 'start'} mb-4`;

        const contentDiv = document.createElement('div');
        contentDiv.className = sender === 'user'
            ? 'bg-blue-500 text-white rounded-lg p-4 max-w-xl'
            : 'bg-gray-200 dark:bg-gray-700 rounded-lg p-4 max-w-xl';
        contentDiv.textContent = text;

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // Прокручиваем вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});