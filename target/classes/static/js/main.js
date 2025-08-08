document.addEventListener('DOMContentLoaded', function() {
    class ChatApp {
        constructor() {
            this.initElements();
            this.initState();
            this.initEventListeners();
            this.initChat();
            this.initMobileSidebar();
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
            this.chats = JSON.parse(localStorage.getItem('chats')) || [];
            this.currentChatId = null;
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

        initChat() {
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

            this.addMessage(questionText, 'user');
            this.questionInput.value = '';
            this.hideWelcomeMessage();

            try {
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
                        <div class="bot-message">${this.formatAIMessage(text)}</div>
                    </div>
                `;
            }

            this.chatMessages.appendChild(container);
            this.scrollToBottom();
        }

        formatAIMessage(text) {
            // Здесь может быть ваша логика форматирования сообщений AI
            // Например, подсветка кода, обработка markdown и т.д.
            return this.escapeHtml(text);
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

            // Закрываем мобильную боковую панель после создания чата
            if (window.innerWidth < 768) {
                this.sidebar.classList.remove('sidebar-open');
                this.sidebarOverlay.classList.remove('active');
            }
        }

        openChat(chatId) {
            const chat = this.chats.find(c => c.id === chatId);
            if (!chat) return;

            this.currentChatId = chatId;
            this.currentChatTitle.textContent = chat.title;
            this.renderChatMessages(chat.messages);
            this.updateActiveChatInHistory();
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

            chat.messages.push(
                { text: question, sender: 'user' },
                { text: answer, sender: 'assistant' }
            );

            if (chat.messages.length === 2 && chat.title.startsWith('Новый чат')) {
                chat.title = question.slice(0, 30) + (question.length > 30 ? '...' : '');
            }

            this.saveChats();
            this.renderChatHistory();
        }

        // ========== Работа с историей чатов ==========
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

        deleteChat(chatId) {
            if (!confirm('Вы уверены, что хотите удалить этот чат?')) return;

            const index = this.chats.findIndex(c => c.id === chatId);
            if (index === -1) return;

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

        // ========== Скачивание чата ==========
        downloadChatAsTxt() {
            if (!this.currentChatId) return;

            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (!chat || chat.messages.length === 0) {
                alert('Нет сообщений для скачивания');
                return;
            }

            let txtContent = `DeepSeek Chat - ${chat.title}\n\n`;
            txtContent += `Создан: ${new Date(chat.createdAt).toLocaleString('ru-RU')}\n\n`;
            txtContent += "История сообщений:\n\n";

            chat.messages.forEach(message => {
                const timestamp = new Date().toLocaleString('ru-RU');
                const sender = message.sender === 'user' ? 'Вы' : 'DeepSeek';
                txtContent += `${timestamp} - ${sender}:\n${message.text}\n\n`;
            });

            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DeepSeek_Чат_${chat.title.replace(/[^a-zа-яё0-9]/gi, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }

        // ========== Вспомогательные методы ==========
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