from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

words = ['PYTHON', 'FLASK', 'HANGMAN', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM']

game_state = {
    'word': '',
    'guessed_letters': set(),
    'attempts_left': 6,
    'game_over': False,
    'won': False
}

def reset_game():
    """Reset the game state."""
    game_state['word'] = random.choice(words)
    game_state['guessed_letters'] = set()
    game_state['attempts_left'] = 6
    game_state['game_over'] = False
    game_state['won'] = False

@app.route('/')
def index():
    """Render the main game page."""
    reset_game()  # Start a new game
    return render_template('index.html')

@app.route('/guess', methods=['POST'])
def guess():
    """Handle a guess from the user."""
    if game_state['game_over']:
        return jsonify({'error': 'Game is over. Start a new game.'})

    letter = request.form.get('letter', '').upper()
    if not letter or len(letter) != 1 or not letter.isalpha():
        return jsonify({'error': 'Please enter a single letter.'})

    if letter in game_state['guessed_letters']:
        return jsonify({'error': 'Letter already guessed.'})

    game_state['guessed_letters'].add(letter)

    if letter not in game_state['word']:
        game_state['attempts_left'] -= 1

    
    if all(l in game_state['guessed_letters'] for l in game_state['word']):
        game_state['game_over'] = True
        game_state['won'] = True
    elif game_state['attempts_left'] <= 0:
        game_state['game_over'] = True
        game_state['won'] = False

    
    display_word = ''.join(l if l in game_state['guessed_letters'] else '_' for l in game_state['word'])
    
    return jsonify({
        'display_word': display_word,
        'attempts_left': game_state['attempts_left'],
        'guessed_letters': list(game_state['guessed_letters']),
        'game_over': game_state['game_over'],
        'won': game_state['won'],
        'word': game_state['word'] if game_state['game_over'] else ''
    })

@app.route('/reset', methods=['POST'])
def reset():
    """Reset the game and return new state."""
    reset_game()
    display_word = ''.join('_' for _ in game_state['word'])
    return jsonify({
        'display_word': display_word,
        'attempts_left': game_state['attempts_left'],
        'guessed_letters': list(game_state['guessed_letters']),
        'game_over': game_state['game_over'],
        'won': game_state['won'],
        'word': ''
    })

if __name__ == '__main__':
    app.run(debug=True)
