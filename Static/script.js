const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
let attemptsLeft = 6;

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';

    if (attemptsLeft < 6) {
        ctx.beginPath();
        ctx.moveTo(20, 180);
        ctx.lineTo(180, 180);
        ctx.moveTo(100, 180);
        ctx.lineTo(100, 20);
        ctx.lineTo(150, 20);
        ctx.lineTo(150, 40);
        ctx.stroke();
    }
    if (attemptsLeft < 5) {
        ctx.beginPath();
        ctx.arc(150, 60, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (attemptsLeft < 4) {
        ctx.beginPath();
        ctx.moveTo(150, 80);
        ctx.lineTo(150, 120);
        ctx.stroke();
    }
    if (attemptsLeft < 3) {
        ctx.beginPath();
        ctx.moveTo(150, 90);
        ctx.lineTo(130, 110);
        ctx.stroke();
    }
        if (attemptsLeft < 2) {
        ctx.beginPath();
        ctx.moveTo(150, 90);
        ctx.lineTo(170, 110);
        ctx.stroke();
    }
        if (attemptsLeft < 1) {
        ctx.beginPath();
        ctx.moveTo(150, 120);
        ctx.lineTo(130, 140);
        ctx.stroke();
    }
    // Right leg
    if (attemptsLeft < 0) {
        ctx.beginPath();
        ctx.moveTo(150, 120);
        ctx.lineTo(170, 140);
        ctx.stroke();
    }
}

function createAlphabetButtons() {
    const alphabetDiv = document.getElementById('alphabet');
    alphabetDiv.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'letter-btn';
        button.onclick = () => makeGuess(letter);
        alphabetDiv.appendChild(button);
    }
}

function updateAlphabetButtons(guessedLetters) {
    const buttons = document.querySelectorAll('.letter-btn');
    buttons.forEach(button => {
        if (guessedLetters.includes(button.textContent)) {
            button.disabled = true;
        }
    });
}

function makeGuess(letter = null) {
    const input = document.getElementById('letter-input');
    letter = letter || input.value.toUpperCase();
    input.value = '';

    fetch('/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `letter=${letter}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('message').textContent = data.error;
            return;
        }
        document.getElementById('word-display').textContent = data.display_word;
        document.getElementById('attempts').textContent = `Attempts left: ${data.attempts_left}`;
        document.getElementById('guessed-letters').textContent = `Guessed letters: ${data.guessed_letters.join(', ')}`;
        attemptsLeft = data.attempts_left;
        drawHangman();
        updateAlphabetButtons(data.guessed_letters);
        document.getElementById('message').textContent = '';

        if (data.game_over) {
            if (data.won) {
                document.getElementById('message').textContent = `You won! The word was ${data.word}.`;
            } else {
                document.getElementById('message').textContent = `Game over! The word was ${data.word}.`;
            }
            document.getElementById('letter-input').disabled = true;
            document.querySelectorAll('.letter-btn').forEach(btn => btn.disabled = true);
        }
    });
}

function resetGame() {
    fetch('/reset', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        document.getElementById('word-display').textContent = data.display_word;
        document.getElementById('attempts').textContent = `Attempts left: ${data.attempts_left}`;
        document.getElementById('guessed-letters').textContent = `Guessed letters: ${data.guessed_letters.join(', ')}`;
        document.getElementById('message').textContent = '';
        document.getElementById('letter-input').disabled = false;
        attemptsLeft = data.attempts_left;
        drawHangman();
        createAlphabetButtons();
    });
}

fetch('/reset', { method: 'POST' })
.then(response => response.json())
.then(data => {
    document.getElementById('word-display').textContent = data.display_word;
    document.getElementById('attempts').textContent = `Attempts left: ${data.attempts_left}`;
    document.getElementById('guessed-letters').textContent = `Guessed letters: ${data.guessed_letters.join(', ')}`;
    attemptsLeft = data.attempts_left;
    drawHangman();
    createAlphabetButtons();
});

document.getElementById('letter-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
});
