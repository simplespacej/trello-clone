import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    loadBoardState();
    setupEventListeners();
});

function setupEventListeners() {
    const addCardButtons = document.querySelectorAll('.add-card');

    addCardButtons.forEach(button => {
        button.removeEventListener('click', addCardHandler); // Удаляем, если есть
        button.addEventListener('click', addCardHandler); // Добавляем один раз
    });
}

function addCardHandler(event) {
    const column = event.target.previousElementSibling;

    // Показываем окно один раз
    const cardText = prompt('Введите текст карточки:');
    if (cardText && cardText.trim() !== '') {
        createCard(column, cardText);
        saveBoardState();
    }

    // Убираем повторное добавление событий
    event.stopImmediatePropagation();
}

const columns = document.querySelectorAll('.cards');

columns.forEach(column => {
    column.addEventListener('dragover', (event) => {
        event.preventDefault();
        const dragging = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(column, event.clientY);
        if (afterElement == null) {
            column.appendChild(dragging);
        } else {
            column.insertBefore(dragging, afterElement);
        }
    });

    column.addEventListener('drop', (event) => {
        event.preventDefault();
        saveBoardState();
    });
});

function createCard(column, text) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('draggable', 'true');
    card.textContent = text;

    const removeButton = document.createElement('span');
    removeButton.textContent = ' ×';
    removeButton.classList.add('remove-card');
    card.appendChild(removeButton);

    removeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        card.remove();
        saveBoardState();
    });

    card.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
        setTimeout(() => {
            event.target.classList.add('dragging');
        }, 0);
    });

    card.addEventListener('dragend', (event) => {
        event.target.classList.remove('dragging');
        saveBoardState();
    });

    column.appendChild(card);
}

function saveBoardState() {
    const boardState = {
        todo: getColumnState('todo'),
        inProgress: getColumnState('in-progress'),
        done: getColumnState('done'),
    };

    localStorage.setItem('trelloBoardState', JSON.stringify(boardState));
}

function getColumnState(columnId) {
    const column = document.getElementById(columnId);
    return Array.from(column.querySelectorAll('.card'))
        .map(card => card.textContent.replace(' ×', '').trim())
        .filter(text => text.toUpperCase() !== columnId.toUpperCase());
}

function loadBoardState() {
    const savedState = localStorage.getItem('trelloBoardState');
    if (savedState) {
        const boardState = JSON.parse(savedState);
        restoreColumnState('todo', boardState.todo);
        restoreColumnState('in-progress', boardState.inProgress);
        restoreColumnState('done', boardState.done);
    }
}

function restoreColumnState(columnId, cards) {
    const column = document.getElementById(columnId);
    const cardContainer = column.querySelector('.cards');

    cardContainer.innerHTML = '';

    cards.forEach(text => {
        if (text.trim() !== '' && text.toUpperCase() !== columnId.toUpperCase()) {
            createCard(cardContainer, text);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
