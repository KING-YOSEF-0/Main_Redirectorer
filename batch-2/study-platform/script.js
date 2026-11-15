const flashcards = [
    {
        question: "What is JavaScript?",
        answer: "A programming language for web development"
    },
    {
        question: "What is HTML?",
        answer: "HyperText Markup Language for structuring web pages"
    },
    {
        question: "What is CSS?",
        answer: "Cascading Style Sheets for styling web pages"
    }
];

let currentCardIndex = 0;

function showCard(index) {
    const card = flashcards[index];
    document.querySelector('.flashcard-front').textContent = card.question;
    document.querySelector('.flashcard-back').textContent = card.answer;
    updateCardClass();
}

function flipCard() {
    const back = document.querySelector('.flashcard-back');
    back.style.display = back.style.display === 'none' ? 'block' : 'none';
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    showCard(currentCardIndex);
}

function previousCard() {
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    showCard(currentCardIndex);
}

function updateCardClass() {
    const card = document.querySelector('.flashcard');
    card.className = 'flashcard';
}

showCard(currentCardIndex);