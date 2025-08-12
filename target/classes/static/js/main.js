document.addEventListener('DOMContentLoaded', function() {
    class ChatApp {
        constructor() {
            this.initElements();
            this.initState();
            this.initEventListeners();
            this.initMobileSidebar();
            this.loadUserChats(); // Загружаем чаты пользователя при инициализации
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
            this.currentChatTitle = document.querySelector('.chat-title');
            this.sidebarToggle = document.getElementById('sidebarToggle');
            this.sidebarOverlay = document.getElementById('sidebarOverlay');
        }

        initState() {
            const deviceIdElement = document.getElementById('deviceId');
            this.deviceId = deviceIdElement ? deviceIdElement.value
                             : new URLSearchParams(window.location.search).get('deviceId')
                             || localStorage.getItem('deviceId')
                             || this.generateDeviceId();
            localStorage.setItem('deviceId', this.deviceId);
            this.chats = [];
            this.currentChatId = null;
        }

        generateDeviceId() {
            return 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        }

        initEventListeners() {
            this.questionForm?.addEventListener('submit', this.handleQuestionSubmit.bind(this));
            this.newChatBtn.addEventListener('click', this.createNewChat.bind(this));
            this.downloadChatBtn.addEventListener('click', this.downloadChatAsTxt.bind(this));
        }

        initMobileSidebar() {
            if (this.sidebarToggle && this.sidebarOverlay) {
                this.sidebarToggle.addEventListener('click', () => {
                    this.sidebar.classList.toggle('sidebar-open');
                    this.sidebarOverlay.classList.toggle('active');
                });

                this.sidebarOverlay.addEventListener('click', () => {
                    this.sidebar.classList.remove('sidebar-open');
                    this.sidebarOverlay.classList.remove('active');
                });
            }
        }

        // ========== Работа с API ==========
        async fetchWithErrorHandling(url, options = {}) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    ...options
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Fetch error:', error);
                this.showError('Произошла ошибка при загрузке данных');
                throw error;
            }
        }

        // ========== Управление чатами ==========
        async loadUserChats() {
            try {
                this.chats = await this.fetchWithErrorHandling(`/api/chat/list?deviceId=${this.deviceId}`);
                this.renderChatHistory();

                if (this.chats.length > 0) {
                    await this.openChat(this.chats[0].id);
                } else {
                    await this.createNewChat();
                }
            } catch (error) {
                console.error('Failed to load chats:', error);
            }
        }

        async createNewChat() {
            try {
                const chat = await this.fetchWithErrorHandling('/api/chat/create', {
                    method: 'POST',
                    body: JSON.stringify({
                        deviceId: this.deviceId,
                        title: `Новый чат ${new Date().toLocaleString()}`
                    })
                });

                this.chats.unshift(chat);
                this.renderChatHistory();
                await this.openChat(chat.id);

                // Обновим URL, чтобы сохранить deviceId
                window.history.replaceState({}, '', `?deviceId=${this.deviceId}`);

                // Закрываем мобильную боковую панель после создания чата
                if (window.innerWidth < 768) {
                    this.sidebar.classList.remove('sidebar-open');
                    this.sidebarOverlay.classList.remove('active');
                }
            } catch (error) {
                console.error('Failed to create chat:', error);
                this.showError('Не удалось создать новый чат');
            }
        }

        async openChat(chatId) {
            try {
                const messages = await this.fetchWithErrorHandling(`/api/chat/${chatId}/messages`);

                this.currentChatId = chatId;
                const chat = this.chats.find(c => c.id === chatId);
                if (chat) {
                    this.currentChatTitle.textContent = chat.title;
                }

                this.renderChatMessages(messages);
                this.updateActiveChatInHistory();
            } catch (error) {
                console.error('Failed to open chat:', error);
                this.showError('Не удалось загрузить сообщения чата');
            }
        }

        async updateChatTitle(chatId, newTitle) {
            try {
                // Здесь можно добавить вызов API для обновления заголовка чата
                const chat = this.chats.find(c => c.id === chatId);
                if (chat) {
                    chat.title = newTitle.length > 30 ? newTitle.substring(0, 30) + '...' : newTitle;
                    this.renderChatHistory();
                }
            } catch (error) {
                console.error('Failed to update chat title:', error);
            }
        }

        // ========== Обработка сообщений ==========
        async handleQuestionSubmit(e) {
            e.preventDefault();
            const questionText = this.questionInput.value.trim();
            if (!questionText || !this.currentChatId) return;

            this.addMessage(questionText, 'user');
            this.questionInput.value = '';
            this.hideWelcomeMessage();

            try {
                const data = await this.fetchWithErrorHandling(`/api/chat/${this.currentChatId}/send`, {
                    method: 'POST',
                    body: JSON.stringify({ question: questionText })
                });

                this.addMessage(data.answer, 'assistant');

                // Обновляем заголовок чата, если это первое сообщение
                const chat = this.chats.find(c => c.id === this.currentChatId);
                if (chat && (!chat.messages || chat.messages.length === 0)) {
                    await this.updateChatTitle(this.currentChatId, questionText);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
                this.addMessage('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте снова.', 'assistant');
            }
        }

        // ========== Отображение данных ==========
        renderChatMessages(messages) {
            this.chatMessages.innerHTML = '';

            if (!messages || messages.length === 0) {
                this.welcomeMessage.style.display = 'flex';
            } else {
                this.hideWelcomeMessage();
                messages.forEach(msg => {
                    this.addMessage(msg.question || msg.text, 'user');
                    this.addMessage(msg.answer || 'Это ответ', 'assistant');
                });
            }
        }

        renderChatHistory() {
            this.chatHistory.innerHTML = '';
            this.chats.forEach(chat => {
                const chatElement = this.createChatElement(chat);
                this.chatHistory.appendChild(chatElement);
            });
        }

        createChatElement(chat) {
            const element = document.createElement('div');
            element.className = `chat-history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            element.dataset.chatId = chat.id;

            const content = document.createElement('div');
            content.className = 'chat-history-content';
            content.innerHTML = `
                <i class="fas fa-comment chat-history-icon"></i>
                <span class="chat-history-title">${this.escapeHtml(chat.title)}</span>
            `;
            content.addEventListener('click', () => this.openChat(chat.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-chat-button';
            deleteBtn.innerHTML = '<i class="fas fa-trash text-xs"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            });

            element.appendChild(content);
            element.appendChild(deleteBtn);
            return element;
        }

        updateActiveChatInHistory() {
            document.querySelectorAll('.chat-history-item').forEach(item => {
                if (item.dataset.chatId === this.currentChatId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        addMessage(text, sender) {
            const container = document.createElement('div');
            container.className = `chat-message-container ${sender}`;

            if (sender === 'user') {
                container.innerHTML = `
                    <div class="message-content-container user">
                        <div class="user-message">${this.escapeHtml(text)}</div>
                    </div>
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="bot-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content-container">
                        <div class="bot-message">${this.escapeHtml(text)}</div>
                    </div>
                `;
            }

            this.chatMessages.appendChild(container);
            this.scrollToBottom();
        }

        // ========== Удаление чата ==========
        async deleteChat(chatId) {
            if (!confirm('Вы уверены, что хотите удалить этот чат?')) return;

            try {
                // Здесь можно добавить вызов API для удаления чата
                // await this.fetchWithErrorHandling(`/api/chat/${chatId}`, { method: 'DELETE' });

                this.chats = this.chats.filter(c => c.id !== chatId);
                this.renderChatHistory();

                if (this.currentChatId === chatId) {
                    if (this.chats.length > 0) {
                        await this.openChat(this.chats[0].id);
                    } else {
                        await this.createNewChat();
                    }
                }
            } catch (error) {
                console.error('Failed to delete chat:', error);
                this.showError('Не удалось удалить чат');
            }
        }

        // ========== Скачивание чата ==========
        async downloadChatAsTxt() {
            if (!this.currentChatId) return;

            try {
                const messages = await this.fetchWithErrorHandling(`/api/chat/${this.currentChatId}/messages`);
                const chat = this.chats.find(c => c.id === this.currentChatId);

                if (!messages || messages.length === 0) {
                    this.showError('Нет сообщений для скачивания');
                    return;
                }

                let txtContent = `DeepSeek Chat - ${chat?.title || 'Чат'}\n\n`;
                txtContent += `Создан: ${new Date().toLocaleString('ru-RU')}\n\n`;
                txtContent += "История сообщений:\n\n";

                messages.forEach(message => {
                    const timestamp = new Date().toLocaleString('ru-RU');
                    txtContent += `${timestamp} - Вы:\n${message.question}\n\n`;
                    txtContent += `${timestamp} - DeepSeek:\n${message.answer}\n\n`;
                });

                const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `DeepSeek_Чат_${(chat?.title || 'chat').replace(/[^a-zа-яё0-9]/gi, '_')}.txt`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (error) {
                console.error('Failed to download chat:', error);
                this.showError('Не удалось скачать чат');
            }
        }

        // ========== Вспомогательные методы ==========
        showError(message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            document.body.appendChild(errorElement);

            setTimeout(() => {
                errorElement.remove();
            }, 3000);
        }

        hideWelcomeMessage() {
            if (this.welcomeMessage) {
                this.welcomeMessage.style.display = 'none';
            }
        }

        scrollToBottom() {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }

        escapeHtml(text) {
            if (!text) return '';
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