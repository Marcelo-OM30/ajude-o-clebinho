document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const storyText = document.getElementById('story-text');
    const choicesDiv = document.getElementById('choices');
    const bugCounterSpan = document.getElementById('bug-counter');
    const restartBtn = document.getElementById('restart-btn');
    const startBtn = document.getElementById('start-btn');
    const bugSound = document.getElementById('bug-sound');
    const correctSound = document.getElementById('correct-sound');
    const videoModal = document.getElementById('video-modal');
    const eventVideoIframe = document.getElementById('event-video-iframe');

    let playerPosition;
    let bugCount;

    const boardSquares = [
        { name: 'Início' },
        { name: 'Refinamento' },
        { name: 'Planejamento' },
        { name: 'Daily Meeting' },
        { name: 'Automação' },
        { name: 'Revisão de Código' },
        { name: 'Testes Ad-Hoc' },
        { name: 'Integração Contínua' },
        { name: 'Reunião de Sprint' },
        { name: 'Feedback do PO' },
        { name: 'Deploy' },
        { name: 'Monitoramento' },
        { name: 'Fim da Sprint' },
    ];

    const gameEvents = {
        0: { // Início
            text: "A sprint começou! Clebinho, seu café está pronto. É hora de começar os trabalhos.",
            choices: [
                { text: "Pegar o café e ir para o refinamento!", bugs: 0, move: 1, consequence: "Café na mão, ideias na cabeça. Vamos para o refinamento!" }
            ]
        },
        1: { // Refinamento
            text: "Hora do refinamento da história. O que fazer?",
            choices: [
                { text: "Participar ativamente com o PO e Devs", bugs: 0, move: 1, consequence: "Você colaborou e os critérios de aceite estão claros!" },
                { text: "Esperar a tarefa chegar para você", bugs: 1, move: 1, consequence: "Você não participou e um requisito importante passou despercebido. +1 bug!" }
            ]
        },
        2: { // Planejamento
            text: "Reunião de planejamento da Sprint. Como você estima as tarefas de QA?",
            choices: [
                { text: "Analisar a complexidade e pedir tempo suficiente", bugs: 0, move: 1, consequence: "Sua estimativa foi precisa e você terá tempo para testes de qualidade." },
                { text: "Aceitar a estimativa do time sem questionar", bugs: 1, move: 1, consequence: "A estimativa foi curta e você terá que correr com os testes. +1 bug!" }
            ]
        },
        3: { // Daily Meeting
            text: "Hora da Daily! O time está reunido para sincronizar. Vamos assistir.",
            choices: [
                { text: "Participar da Daily", video: "https://www.youtube.com/embed/mXnj7JEM3pk?si=jtnTU6J6u8ABmpMg&autoplay=1", bugs: 0, move: 1, consequence: "Daily assistida! Todos na mesma página, prontos para o próximo passo." }
            ]
        },
        4: { // Automação (era 5)
            text: "É hora de automatizar os testes. Você tem acesso ao código?",
            choices: [
                { text: "Sim, o time me deu acesso e ajuda", bugs: 0, move: 2, consequence: "Com acesso ao código, a automação foi mais robusta e eficiente! Você avança mais rápido." },
                { text: "Não, testo apenas pela interface", bugs: 2, move: 1, consequence: "Sem acesso ao código, sua automação é frágil e superficial. +2 bugs!" }
            ]
        },
        5: { // Revisão de Código (era 6)
            text: "Um dev pede para você 'dar uma olhadinha' em um Pull Request antes de liberar para testes.",
            choices: [
                { text: "Revisar o código junto com o dev, questionando a lógica", bugs: 0, move: 1, consequence: "Você encontrou uma falha de lógica na revisão e evitou um bug complexo!" },
                { text: "Apenas aprovar para não atrasar a tarefa", bugs: 2, move: 1, consequence: "O PR continha um erro que agora está na branch principal. +2 bugs!" }
            ]
        },
        6: { // Testes Ad-Hoc (era 7)
            text: "Tempo livre! O que fazer?",
            choices: [
                { text: "Executar testes exploratórios planejados", bugs: 0, move: 1, consequence: "Seus testes exploratórios revelaram pontos de melhoria!" },
                { text: "Fazer testes aleatórios sem critério", bugs: 1, move: 1, consequence: "Você testou, mas sem foco, e um bug crítico passou. +1 bug!" }
            ]
        },
        7: { // Integração Contínua (era 8)
            text: "O pipeline de Integração Contínua quebrou após um merge.",
            choices: [
                { text: "Analisar os logs e ajudar o time a encontrar a causa", bugs: 0, move: 1, consequence: "Trabalho em equipe! Vocês encontraram o problema e o pipeline está verde de novo." },
                { text: "Ignorar, pois a responsabilidade é dos Devs", bugs: 1, move: 1, consequence: "O pipeline quebrado atrasou a entrega e um bug passou despercebido. +1 bug!" }
            ]
        },
        8: { // Reunião de Sprint (era 9)
            text: "Reunião de revisão da Sprint. Como você apresenta os resultados de QA?",
            choices: [
                { text: "Mostrar métricas, bugs encontrados e processos de teste", bugs: 0, move: 1, consequence: "Sua apresentação foi clara e o time valorizou o trabalho de QA." },
                { text: "Dizer que 'está tudo testado'", bugs: 1, move: 1, consequence: "A falta de detalhes gerou desconfiança e o PO pediu mais testes. +1 bug!" }
            ]
        },
        9: { // Feedback do PO (era 10)
            text: "O Product Owner está validando a entrega e encontra um comportamento que ele não esperava.",
            choices: [
                { text: "Conversar com o PO e o Dev para entender a divergência", bugs: 0, move: 1, consequence: "A conversa esclareceu que era um mal-entendido nos requisitos. O time ajustou a funcionalidade." },
                { text: "Dizer que 'nos meus testes funcionou'", bugs: 2, move: 1, consequence: "A resposta defensiva criou um atrito e o PO abriu um bug crítico. +2 bugs!" }
            ]
        },
        10: { // Deploy (era 11)
            text: "O deploy para produção vai acontecer!",
            choices: [
                { text: "Acompanhar o deploy e os logs", bugs: 0, move: 2, consequence: "Você acompanhou o deploy e garantiu que tudo correu bem. Sprint concluída com sucesso!" },
                { text: "Confiar que tudo vai dar certo", bugs: 3, move: 1, consequence: "O deploy falhou durante a madrugada e ninguém viu. +3 bugs!" }
            ]
        },
        11: { // Monitoramento (era 12)
            text: "A funcionalidade está em produção. E agora?",
            choices: [
                { text: "Analisar os logs e ferramentas de monitoramento em busca de anomalias", bugs: 0, move: 1, consequence: "Você detectou um pico de erros e o time corrigiu antes que os usuários percebessem. Ufa!" },
                { text: "Partir para a próxima tarefa, o trabalho acabou", bugs: 2, move: 1, consequence: "Um erro silencioso começou a corromper dados em produção e só foi descoberto dias depois. +2 bugs!" }
            ]
        }
    };

    function createBoard() {
        gameBoard.innerHTML = '';
        boardSquares.forEach((square, index) => {
            const squareDiv = document.createElement('div');
            squareDiv.classList.add('square');
            squareDiv.id = `square-${index}`;
            squareDiv.innerText = `${index}: ${square.name}`;
            gameBoard.appendChild(squareDiv);
        });
        const playerDiv = document.createElement('div');
        playerDiv.id = 'player';
        gameBoard.appendChild(playerDiv);
    }

    function updatePlayerPosition() {
        const targetSquare = document.getElementById(`square-${playerPosition}`);
        const playerDiv = document.getElementById('player');
        if (targetSquare && playerDiv) {
            playerDiv.style.left = `${targetSquare.offsetLeft + (targetSquare.offsetWidth / 2) - 20}px`;
            playerDiv.style.top = `${targetSquare.offsetTop + (targetSquare.offsetHeight / 2) - 30}px`;
        }
    }

    // Função central que decide o que mostrar na tela.
    function renderGameState() {
        updatePlayerPosition();
        choicesDiv.innerHTML = ''; // Limpa botões antigos

        if (playerPosition >= boardSquares.length - 1) {
            endGame();
            return;
        }

        const event = gameEvents[playerPosition];
        if (event) {
            // Casa com evento
            storyText.innerText = event.text;
            event.choices.forEach(choice => {
                const button = document.createElement('button');
                button.innerText = choice.text;
                button.onclick = () => handleChoice(choice);
                choicesDiv.appendChild(button);
            });
        } else {
            // Este bloco não deve mais ser alcançado se todos os eventos estiverem mapeados
            // Mas por segurança, podemos avançar ou terminar o jogo
            if (playerPosition < boardSquares.length - 1) {
                 playerPosition++;
                 renderGameState();
            } else {
                endGame();
            }
        }
    }

    function handleChoice(choice) {
        storyText.innerText = choice.consequence;
        if (choice.bugs > 0) {
            bugSound.currentTime = 0;
            const playPromise = bugSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Erro ao tocar o som do bug:", error);
                });
            }
        } else {
            correctSound.currentTime = 0;
            const playPromise = correctSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Erro ao tocar o som de acerto:", error);
                });
            }
        }
        bugCount += choice.bugs;
        bugCounterSpan.innerText = bugCount;
        
        const nextPosition = playerPosition + choice.move;

        choicesDiv.innerHTML = ''; // Limpa os botões de escolha

        // Se a escolha tiver um vídeo, toca o vídeo. Senão, avança após um delay.
        if (choice.video) {
            playVideo(choice.video, () => {
                playerPosition = nextPosition;
                renderGameState();
            });
        } else {
            // Adiciona um pequeno atraso para o jogador ler a consequência
            setTimeout(() => {
                playerPosition = nextPosition;
                renderGameState(); // Move e renderiza o novo estado
            }, 2500); // Atraso de 2.5 segundos
        }
    }

    function endGame() {
        let endText = `Fim da Sprint! Total de bugs em produção: ${bugCount}.`;
        if (bugCount <= 2) {
            endText += "\n\nParabéns! Você foi um QA exemplar e o cliente está satisfeito!";
        } else if (bugCount <= 5) {
            endText += "\n\nO projeto foi entregue, mas alguns bugs irritaram o cliente. Há espaço para melhorias.";
        } else {
            endText += "\n\nO cliente está furioso com a quantidade de bugs. O projeto é considerado um fracasso.";
        }
        storyText.innerText = endText;
        choicesDiv.innerHTML = ''; 
    }

    function playVideo(src, onEndedCallback) {
        videoModal.classList.remove('hidden');
        eventVideoIframe.src = src;

        // Função para finalizar o vídeo e limpar os listeners
        function closeVideo() {
            videoModal.classList.add('hidden');
            eventVideoIframe.src = ""; // Para a reprodução do vídeo do YouTube
            videoModal.removeEventListener('click', onOverlayClick);
            if (onEndedCallback) {
                onEndedCallback();
            }
        }

        // Listener para clique fora do vídeo (no overlay)
        function onOverlayClick(e) {
            if (e.target === videoModal) {
                closeVideo();
            }
        }

        // Como não temos um evento 'ended' confiável para iframes, 
        // o fechamento é manual (clicando fora)
        videoModal.addEventListener('click', onOverlayClick);
    }

    async function startGame() {
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        
        playerPosition = 0;
        bugCount = 0;
        bugCounterSpan.innerText = bugCount;
        renderGameState();
    }

    function restartGame() {
        playerPosition = 0;
        bugCount = 0;
        bugCounterSpan.innerText = bugCount;
        videoModal.classList.add('hidden'); // Garante que o modal de vídeo feche ao reiniciar
        eventVideoIframe.src = ""; // Para a reprodução do vídeo
        renderGameState();
    }

    function init() {
        createBoard();
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
    }

    init();
});
