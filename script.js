<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Инициализация Vegas фона
        vegas({
            el: '#vegas-bg',
            slides: [
                { src: 'https://source.unsplash.com/random/1920x1080?neon,lights' },
                { src: 'https://source.unsplash.com/random/1920x1080?cyberpunk,future' },
                { src: 'https://source.unsplash.com/random/1920x1080?abstract,blue' }
            ],
            transition: 'blur',
            delay: 6000,
            animation: 'kenburns'
        });

        // Элементы интерфейса
        const callScreen = document.getElementById('callScreen');
        const settingsScreen = document.getElementById('settingsScreen');
        const callTab = document.getElementById('callTab');
        const contactsTab = document.getElementById('contactsTab');
        const settingsTab = document.getElementById('settingsTab');
        const callScreenSetup = document.getElementById('callScreenSetup');
        const callIdContainer = document.getElementById('callIdContainer');
        const joinCallContainer = document.getElementById('joinCallContainer');
        const callIdDisplay = document.getElementById('callIdDisplay');
        const callIdInput = document.getElementById('callIdInput');
        const createCallBtn = document.getElementById('createCallBtn');
        const joinCallBtn = document.getElementById('joinCallBtn');
        const startCallBtn = document.getElementById('startCallBtn');
        const copyCallIdBtn = document.getElementById('copyCallIdBtn');
        const muteBtn = document.getElementById('muteBtn');
        const videoBtn = document.getElementById('videoBtn');
        const hangupBtn = document.getElementById('hangupBtn');
        const effectsBtn = document.getElementById('effectsBtn');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const connectionStatus = document.getElementById('connectionStatus');
        const userStatus = document.getElementById('userStatus');
        const connectionDot = document.getElementById('connectionDot');
        const callStatus = document.getElementById('callStatus');
        const videoContainer = document.getElementById('videoContainer');
        const remoteVideo = document.getElementById('remoteVideo');
        
        // Состояние приложения
        let callTimer;
        let callSeconds = 0;
        let isMuted = false;
        let isVideoOn = false;
        let currentCallId = '';
        let localStream;
        let remoteStream;

        // Показать экран настройки вызова
        callScreenSetup.classList.add('active');

        // Обработчики кнопок управления (добавлены сразу)
        muteBtn.addEventListener('click', () => {
            if (!localStream) return; // Проверка на активный звонок
            isMuted = !isMuted;
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
            muteBtn.classList.toggle('active', isMuted);
            muteBtn.innerHTML = isMuted 
                ? '<i class="fas fa-microphone-slash"></i>' 
                : '<i class="fas fa-microphone"></i>';
        });

        videoBtn.addEventListener('click', () => {
            if (!localStream) return; // Проверка на активный звонок
            isVideoOn = !isVideoOn;
            videoBtn.classList.toggle('active', isVideoOn);
            // Здесь можно добавить логику включения/выключения видео
        });

        hangupBtn.addEventListener('click', endCall);

        // Переключение между вкладками
        callTab.addEventListener('click', () => {
            callScreen.classList.remove('hidden');
            settingsScreen.classList.add('hidden');
            callTab.classList.add('active');
            contactsTab.classList.remove('active');
            settingsTab.classList.remove('active');
        });

        settingsTab.addEventListener('click', () => {
            callScreen.classList.add('hidden');
            settingsScreen.classList.remove('hidden');
            callTab.classList.remove('active');
            settingsTab.classList.add('active');
        });

        // Генерация случайного ID
        function generateCallId() {
            const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
            const numbers = '23456789';
            let id = 'PX-';
            
            for (let i = 0; i < 3; i++) {
                id += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            
            for (let i = 0; i < 2; i++) {
                id += numbers.charAt(Math.floor(Math.random() * numbers.length));
            }
            
            return id;
        }

        // Создание вызова
        createCallBtn.addEventListener('click', () => {
            currentCallId = generateCallId();
            callIdDisplay.textContent = currentCallId;
            joinCallContainer.classList.add('hidden');
            callIdContainer.classList.remove('hidden');
        });

        // Копирование ID
        copyCallIdBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentCallId);
            copyCallIdBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyCallIdBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });

        // Начать вызов
        startCallBtn.addEventListener('click', async () => {
            try {
                // Запрос доступа к микрофону
                localStream = await navigator.mediaDevices.getUserMedia({ 
                    audio: true,
                    video: false 
                });
                
                // Настройка UI
                callScreenSetup.classList.remove('active');
                userAvatar.textContent = 'ИП';
                userName.textContent = 'Иван Петров';
                connectionStatus.textContent = 'Ожидание подключения...';
                
                // Имитация подключения
                setTimeout(() => {
                    userStatus.classList.remove('offline');
                    userStatus.classList.add('online');
                    connectionDot.classList.remove('offline');
                    connectionDot.classList.add('online');
                    callStatus.textContent = 'В сети • 00:00';
                    connectionStatus.textContent = 'Говорит';
                    videoContainer.classList.remove('hidden');
                    
                    // Таймер звонка
                    startCallTimer();
                    
                    // Имитация видео потока
                    remoteVideo.srcObject = new MediaStream();
                }, 1500);
            } catch (error) {
                console.error('Ошибка доступа к медиаустройствам:', error);
                alert('Не удалось получить доступ к микрофону. Пожалуйста, проверьте разрешения.');
            }
        });

        // Присоединиться к вызову
        joinCallBtn.addEventListener('click', async () => {
            const callId = callIdInput.value.trim();
            if (!callId) {
                alert('Пожалуйста, введите ID вызова');
                return;
            }
            
            try {
                // Запрос доступа к микрофону
                localStream = await navigator.mediaDevices.getUserMedia({ 
                    audio: true,
                    video: false 
                });
                
                // Настройка UI
                callScreenSetup.classList.remove('active');
                userAvatar.textContent = 'АС';
                userName.textContent = 'Алексей Смирнов';
                connectionStatus.textContent = 'Подключение...';
                
                // Имитация подключения
                setTimeout(() => {
                    userStatus.classList.remove('offline');
                    userStatus.classList.add('online');
                    connectionDot.classList.remove('offline');
                    connectionDot.classList.add('online');
                    callStatus.textContent = 'В сети • 00:00';
                    connectionStatus.textContent = 'Говорит';
                    videoContainer.classList.remove('hidden');
                    
                    // Таймер звонка
                    startCallTimer();
                    
                    // Имитация видео потока
                    remoteVideo.srcObject = new MediaStream();
                }, 1500);
            } catch (error) {
                console.error('Ошибка доступа к медиаустройствам:', error);
                alert('Не удалось получить доступ к микрофону. Пожалуйста, проверьте разрешения.');
            }
        });

        // Запуск таймера звонка
        function startCallTimer() {
            callSeconds = 0;
            clearInterval(callTimer);
            callTimer = setInterval(() => {
                callSeconds++;
                const minutes = Math.floor(callSeconds / 60);
                const secs = callSeconds % 60;
                callStatus.textContent = `В сети • ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);
        }

        // Завершение вызова
        function endCall() {
            // Остановка таймера
            clearInterval(callTimer);
            
            // Остановка медиапотоков
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                remoteVideo.srcObject = null;
            }
            
            // Сброс UI
            callScreenSetup.classList.add('active');
            joinCallContainer.classList.remove('hidden');
            callIdContainer.classList.add('hidden');
            userStatus.classList.remove('online');
            userStatus.classList.add('offline');
            connectionDot.classList.remove('online');
            connectionDot.classList.add('offline');
            callStatus.textContent = 'Отключено';
            userName.textContent = 'Не подключено';
            connectionStatus.textContent = 'Ожидание подключения';
            videoContainer.classList.add('hidden');
            
            // Сброс состояния
            isMuted = false;
            isVideoOn = false;
            currentCallId = '';
            muteBtn.classList.remove('active');
            videoBtn.classList.remove('active');
            muteBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    });
</script>
