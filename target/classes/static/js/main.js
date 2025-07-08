// Запуск кода после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получение элементов DOM
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const chatHistory = document.getElementById('chatHistory');
    const newChatBtn = document.getElementById('newChatBtn');
    const currentChatTitle = document.getElementById('currentChatTitle');
    const suggestionBtns = document.querySelectorAll('.chat__suggestion');
    const downloadChatBtn = document.getElementById('downloadChatBtn');

    // Состояние приложения
    let chats = JSON.parse(localStorage.getItem('chats')) || [];
    let currentChatId = null;
    let isAIResponding = false;

    // Инициализация приложения
    if (chats.length > 0) {
        loadChatHistory();
        openChat(chats[0].id);
    }

    // Назначение обработчиков событий
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    newChatBtn.addEventListener('click', createNewChat);
    downloadChatBtn.addEventListener('click', downloadChatAsTxt);

    // Автоматическое изменение высоты текстового поля
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Добавление обработчиков для кнопок предложений
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.querySelector('p:first-child').textContent;
            messageInput.value = text;
            messageInput.focus();
        });
    });

    // Функции приложения

    // Переключение видимости боковой панели
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar-open');
        sidebarOverlay.classList.toggle('active');
    }

    // Создание нового чата
    function createNewChat() {
        const newChat = {
            id: Date.now().toString(),
            title: 'Новый чат',
            messages: [],
            createdAt: new Date().toISOString()
        };

        chats.unshift(newChat);
        saveChats();
        loadChatHistory();
        openChat(newChat.id);

        // Очистка области сообщений и показ приветствия
        chatMessages.innerHTML = `
            <div class="flex justify-center">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm max-w-2xl w-full text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <i class="fas fa-robot text-blue-500 dark:text-blue-300 text-2xl"></i>
                    </div>
                    <h2 class="text-xl font-bold mb-2">Добро пожаловать в DeepSeek Chat</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">Задайте мне любой вопрос: от творческих идей до технических объяснений.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button class="chat__suggestion dark:chat__suggestion--dark hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-3 text-left">
                            <p class="font-medium">Объясните квантовые вычисления</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Простым языком</p>
                        </button>
                        <button class="chat__suggestion dark:chat__suggestion--dark hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-3 text-left">
                            <p class="font-medium">Напишите стихотворение об ИИ</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">В стиле Шекспира</p>
                        </button>
                        <button class="chat__suggestion dark:chat__suggestion--dark hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-3 text-left">
                            <p class="font-medium">Спланируйте 3-дневную поездку в Париж</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">С бюджетными вариантами</p>
                        </button>
                        <button class="chat__suggestion dark:chat__suggestion--dark hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-3 text-left">
                            <p class="font-medium">Помогите отладить код</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Python, JavaScript и др.</p>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Повторное добавление обработчиков для кнопок предложений
        document.querySelectorAll('.chat__suggestion').forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.querySelector('p:first-child').textContent;
                messageInput.value = text;
                messageInput.focus();
            });
        });

        // Закрытие боковой панели на мобильных устройствах
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    }

    // Отправка сообщения
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText || isAIResponding) return;

        // Создание нового чата, если нет текущего
        if (!currentChatId || !chats.find(c => c.id === currentChatId)) {
            createNewChat();
            return;
        }

        // Добавление сообщения пользователя
        const userMessage = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        addMessageToChat(userMessage);
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Показ индикатора набора сообщения
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex space-x-3';
        typingIndicator.innerHTML = `
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <i class="fas fa-robot text-gray-500 dark:text-gray-400"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div class="typing-indicator text-gray-500 dark:text-gray-400">Думаю</div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        isAIResponding = true;

        // Имитация ответа ИИ с задержкой
        setTimeout(() => {
            // Удаление индикатора набора
            chatMessages.removeChild(typingIndicator);

            // Генерация ответа ИИ
            const aiResponse = generateAIResponse(messageText);
            const aiMessage = {
                id: Date.now().toString(),
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date().toISOString()
            };

            addMessageToChat(aiMessage);
            isAIResponding = false;

            // Обновление заголовка чата для первого сообщения
            const chat = chats.find(c => c.id === currentChatId);
            if (chat.messages.length === 2) { // пользователь + ИИ
                chat.title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
                currentChatTitle.textContent = chat.title;
                saveChats();
                loadChatHistory();
            }
        }, 1500 + Math.random() * 2000);
    }

    // Добавление сообщения в чат
    function addMessageToChat(message) {
        const chat = chats.find(c => c.id === currentChatId);
        if (!chat) return;

        chat.messages.push(message);
        saveChats();

        // Отображение сообщения
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`;

        if (message.sender === 'user') {
            messageDiv.innerHTML = `
                <div class="flex-1 max-w-xl flex justify-end">
                    <div class="chat__message--user rounded-lg p-4">
                        ${escapeHtml(message.text)}
                    </div>
                </div>
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <i class="fas fa-robot text-gray-500 dark:text-gray-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="chat__message--ai dark:chat__message--ai-dark rounded-lg p-4">
                        ${formatAIMessage(message.text)}
                    </div>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Генерация ответа ИИ
    function generateAIResponse(userMessage) {
        // В реальном приложении здесь будет вызов API
        const responses = [
            `Я понял, что вы спрашиваете о "${userMessage}". Вот подробное объяснение...`,
            `Это интересный вопрос о "${userMessage}". Позвольте мне объяснить...`,
            `Относительно "${userMessage}", вот что я могу сказать...`,
            `Буду рад помочь с "${userMessage}". Вот необходимая информация...`,
            `"${userMessage}" - увлекательная тема. Вот основные моменты...`
        ];

        // Иногда добавляем блоки кода или списки
        if (userMessage.toLowerCase().includes('код') || Math.random() > 0.7) {
            return `${responses[Math.floor(Math.random() * responses.length)]}

Пример кода:
\`\`\`javascript
function пример() {
console.log("Это пример кода");
return "Привет, мир!";
}
\`\`\`

Сообщите, если нужно что-то пояснить.`;
        } else if (userMessage.toLowerCase().includes('список') || Math.random() > 0.7) {
            return `${responses[Math.floor(Math.random() * responses.length)]}

Основные моменты:
1. Первый важный пункт
2. Второй ключевой аспект
3. Третье соображение
4. Последний важный момент`;
        } else {
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    // Открытие чата
    function openChat(chatId) {
        currentChatId = chatId;
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        currentChatTitle.textContent = chat.title;

        // Очистка и загрузка сообщений
        chatMessages.innerHTML = '';
        chat.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `flex space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`;

            if (message.sender === 'user') {
                messageDiv.innerHTML = `
                    <div class="flex-1 max-w-xl flex justify-end">
                        <div class="chat__message--user rounded-lg p-4">
                            ${escapeHtml(message.text)}
                        </div>
                    </div>
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <i class="fas fa-user"></i>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <i class="fas fa-robot text-gray-500 dark:text-gray-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="chat__message--ai dark:chat__message--ai-dark rounded-lg p-4">
                            ${formatAIMessage(message.text)}
                        </div>
                    </div>
                `;
            }

            chatMessages.appendChild(messageDiv);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Закрытие боковой панели на мобильных устройствах
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    }

    // Загрузка истории чатов
    function loadChatHistory() {
        chatHistory.innerHTML = '';

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `p-3 rounded-lg cursor-pointer flex items-center justify-between ${chat.id === currentChatId ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`;
            chatItem.innerHTML = `
                <div class="flex items-center space-x-3 truncate">
                    <i class="fas fa-comment text-gray-500 dark:text-gray-400"></i>
                    <span class="truncate">${escapeHtml(chat.title)}</span>
                </div>
                <button class="chat-delete-btn p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400" data-chat-id="${chat.id}" title="Удалить чат">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            `;

            chatItem.addEventListener('click', () => openChat(chat.id));

            const deleteBtn = chatItem.querySelector('.chat-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });

            chatHistory.appendChild(chatItem);
        });
    }

    // Удаление чата
    function deleteChat(chatId) {
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            chats = chats.filter(c => c.id !== chatId);
            saveChats();

            if (currentChatId === chatId) {
                if (chats.length > 0) {
                    openChat(chats[0].id);
                } else {
                    createNewChat();
                }
            }

            loadChatHistory();
        }
    }

    // Сохранение чатов в localStorage
    function saveChats() {
        localStorage.setItem('chats', JSON.stringify(chats));
    }

    // Экранирование HTML для безопасности
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Форматирование сообщения ИИ
    function formatAIMessage(text) {
        // Преобразование блоков кода в HTML
        text = text.replace(/```(\w*)([\s\S]*?)```/g, function(match, language, code) {
            return `<pre class="bg-gray-200 dark:bg-gray-800 p-3 rounded-md overflow-x-auto my-2"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
        });

        // Преобразование жирного текста
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Преобразование курсивного текста
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Преобразование списков
        text = text.replace(/^\s*\d+\.\s(.*)$/gm, '<li>$1</li>');
        text = text.replace(/^\s*-\s(.*)$/gm, '<li>$1</li>');

        // Добавление переносов строк
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // Скачивание чата в формате TXT
    function downloadChatAsTxt() {
        if (!currentChatId) return;

        const chat = chats.find(c => c.id === currentChatId);
        if (!chat || chat.messages.length === 0) {
            alert('Нет сообщений для скачивания');
            return;
        }

        // Форматирование сообщений для TXT
        let txtContent = `DeepSeek Chat - ${chat.title}\n\n`;
        txtContent += `Создан: ${new Date(chat.createdAt).toLocaleString()}\n\n`;
        txtContent += "Сообщения:\n\n";

        chat.messages.forEach(message => {
            const timestamp = new Date(message.timestamp).toLocaleString();
            const sender = message.sender === 'user' ? 'Вы' : 'DeepSeek';

            // Очистка текста сообщения (удаление форматирования)
            let cleanText = message.text
                .replace(/```[\s\S]*?```/g, '') // Удаление блоков кода
                .replace(/\*\*(.*?)\*\*/g, '$1') // Удаление жирного текста
                .replace(/\*(.*?)\*/g, '$1'); // Удаление курсива

            txtContent += `${timestamp} - ${sender}:\n${cleanText}\n\n`;
        });

        // Создание ссылки для скачивания
        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DeepSeek_Чат_${chat.title.replace(/[^a-zа-яё0-9]/gi, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});