document.addEventListener('DOMContentLoaded', function() {
    class ChatApp {
        constructor() {
            this.initElements();
            this.initState();
            this.initEventListeners();
            this.initChat();
        }

        initElements() {
            // Основные элементы чата
            this.questionForm = document.getElementById('questionForm');
            this.questionInput = document.getElementById('questionInput');
            this.chatMessages = document.getElementById('chatMessages');
            this.welcomeMessage = document.getElementById('welcomeMessage');
            this.downloadChatBtn = document.getElementById('downloadChatBtn');

            // Элементы боковой панели
            this.sidebar = document.getElementById('sidebar');
            this.newChatBtn = document.getElementById('newChatBtn');
            this.chatHistory = document.getElementById('chatHistory');
            this.currentChatTitle = document.querySelector('.chat__title');
        }

        initState() {
            // Загружаем чаты из localStorage или создаем пустой массив
            this.chats = JSON.parse(localStorage.getItem('chats')) || [];
            this.currentChatId = null;
        }

        initEventListeners() {
            // Обработчик отправки сообщения
            this.questionForm?.addEventListener('submit', this.handleQuestionSubmit.bind(this));

            // Обработчик создания нового чата
            this.newChatBtn.addEventListener('click', this.createNewChat.bind(this));

            // Обработчик скачивания чата
            this.downloadChatBtn.addEventListener('click', this.downloadChatAsTxt.bind(this));
        }

        initChat() {
            // Инициализация чата при загрузке страницы
            if (this.chats.length > 0) {
                this.renderChatHistory();
                this.openChat(this.chats[0].id);
            } else {
                this.createNewChat();
            }
        }

        // ========== Обработка сообщений ==========
        async handleQuestionSubmit(e) {
            e.preventDefault();
            const questionText = this.questionInput.value.trim();
            if (!questionText) return;

            // Добавляем сообщение пользователя
            this.addMessage(questionText, 'user');
            this.questionInput.value = '';
            this.hideWelcomeMessage();

            try {
                // Отправляем запрос к API
                const response = await fetch('/api/deepseek/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question_text: questionText })
                });

                if (!response.ok) throw new Error('Ошибка сервера');

                const data = await response.json();
                if (data.answer) {
                    this.addMessage(data.answer, 'assistant');
                    this.updateCurrentChatWithMessage(questionText, data.answer);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                this.addMessage(`Ошибка при получении ответа: ${error.message}`, 'assistant');
            }
        }

        addMessage(text, sender) {
            // Создаем элемент сообщения
            const messageDiv = document.createElement('div');
            messageDiv.className = `flex justify-${sender === 'user' ? 'end' : 'start'} mb-4`;

            const contentDiv = document.createElement('div');
            contentDiv.className = sender === 'user'
                ? 'bg-blue-500 text-white rounded-lg p-4 max-w-xl'
                : 'bg-gray-200 dark:bg-gray-700 rounded-lg p-4 max-w-xl';
            contentDiv.textContent = text;

            messageDiv.appendChild(contentDiv);
            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
        }

        // ========== Управление чатами ==========
        createNewChat() {
            const newChat = {
                id: `chat-${Date.now()}`,
                title: `Новый чат ${this.chats.length + 1}`,
                messages: [],
                createdAt: new Date().toISOString()
            };

            this.chats.unshift(newChat);
            this.saveChats();
            this.renderChatHistory();
            this.openChat(newChat.id);
        }

        openChat(chatId) {
            const chat = this.chats.find(c => c.id === chatId);
            if (!chat) return;

            this.currentChatId = chatId;
            this.currentChatTitle.textContent = chat.title;
            this.renderChatMessages(chat.messages);
            this.renderChatHistory();
        }

        renderChatMessages(messages) {
            this.chatMessages.innerHTML = '';

            if (messages.length === 0) {
                this.welcomeMessage.style.display = 'flex';
            } else {
                this.hideWelcomeMessage();
                messages.forEach(msg => {
                    this.addMessage(msg.text, msg.sender);
                });
            }
        }

        updateCurrentChatWithMessage(question, answer) {
            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (!chat) return;

            // Добавляем сообщения в историю чата
            chat.messages.push(
                { text: question, sender: 'user' },
                { text: answer, sender: 'assistant' }
            );

            // Обновляем название чата по первому сообщению
            if (chat.messages.length === 2 && chat.title.startsWith('Новый чат')) {
                chat.title = question.slice(0, 30) + (question.length > 30 ? '...' : '');
            }

            this.saveChats();
            this.renderChatHistory();
        }

        // ========== Функция скачивания чата ==========
        downloadChatAsTxt() {
            if (!this.currentChatId) return;

            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (!chat || chat.messages.length === 0) {
                alert('Нет сообщений для скачивания');
                return;
            }

            // Форматируем заголовок и дату создания
            let txtContent = `DeepSeek Chat - ${chat.title}\n\n`;
            txtContent += `Создан: ${new Date(chat.createdAt).toLocaleString('ru-RU')}\n\n`;
            txtContent += "История сообщений:\n\n";

            // Добавляем все сообщения в файл
            chat.messages.forEach(message => {
                const timestamp = new Date().toLocaleString('ru-RU');
                const sender = message.sender === 'user' ? 'Вы' : 'DeepSeek';

                // Очищаем текст от форматирования
                let cleanText = message.text
                    .replace(/```[\s\S]*?```/g, '') // Удаляем блоки кода
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Удаляем жирный текст
                    .replace(/\*(.*?)\*/g, '$1'); // Удаляем курсив

                txtContent += `${timestamp} - ${sender}:\n${cleanText}\n\n`;
            });

            // Создаем и скачиваем файл
            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Генерируем имя файла, заменяя спецсимволы на подчеркивания
            const fileName = `DeepSeek_Чат_${chat.title.replace(/[^a-zа-яё0-9]/gi, '_')}.txt`;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            // Очищаем после скачивания
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }

        // ========== Вспомогательные методы ==========
        renderChatHistory() {
            this.chatHistory.innerHTML = '';
            this.chats.forEach(chat => {
                this.chatHistory.appendChild(this.createChatElement(chat));
            });
        }

        createChatElement(chat) {
            const element = document.createElement('div');
            element.className = `flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${chat.id === this.currentChatId ? 'bg-gray-200 dark:bg-gray-600' : ''}`;
            element.dataset.chatId = chat.id;

            // Содержимое элемента (название чата)
            const content = document.createElement('div');
            content.className = 'flex items-center space-x-3 truncate';
            content.innerHTML = `
                <i class="fas fa-comment text-gray-500 dark:text-gray-400"></i>
                <span class="truncate">${this.escapeHtml(chat.title)}</span>
            `;
            content.addEventListener('click', () => this.openChat(chat.id));

            // Кнопка удаления чата
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-red-500';
            deleteBtn.innerHTML = '<i class="fas fa-trash text-xs"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            });

            element.appendChild(content);
            element.appendChild(deleteBtn);
            return element;
        }

        deleteChat(chatId) {
            if (!confirm('Вы уверены, что хотите удалить этот чат?')) return;

            const index = this.chats.findIndex(c => c.id === chatId);
            if (index === -1) return;

            // Если удаляем текущий чат, открываем другой
            if (this.currentChatId === chatId) {
                this.chats.splice(index, 1);
                this.chats.length > 0
                    ? this.openChat(this.chats[0].id)
                    : this.createNewChat();
            } else {
                this.chats.splice(index, 1);
            }

            this.saveChats();
            this.renderChatHistory();
        }

        // ========== Утилиты ==========
        hideWelcomeMessage() {
            if (this.welcomeMessage) {
                this.welcomeMessage.style.display = 'none';
            }
        }

        scrollToBottom() {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }

        saveChats() {
            localStorage.setItem('chats', JSON.stringify(this.chats));
        }

        escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    }

    // Запускаем приложение
    new ChatApp();
});