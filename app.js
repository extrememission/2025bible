document.addEventListener('DOMContentLoaded', () => {
    const booksContainer = document.getElementById('books');
    const searchInput = document.getElementById('search');
    const resultCount = document.getElementById('result-count');
    const themeToggle = document.getElementById('theme-toggle');
    let bibleData = [];

    const bookAbbrev = {
        1: 'Ge', 2: 'Ex', 3: 'Le', 4: 'Nu', 5: 'De', 6: 'Jo', 7: 'Jg', 
        8: 'Ru', 9: '1S', 10: '2S', 11: '1K', 12: '2K', 13: '1C', 14: '2C',
        15: 'Ez', 16: 'Ne', 17: 'Es', 18: 'Jb', 19: 'Ps', 20: 'Pr', 21: 'Ec',
        22: 'So', 23: 'Is', 24: 'Je', 25: 'La', 26: 'Ez', 27: 'Da', 28: 'Ho',
        29: 'Jo', 30: 'Am', 31: 'Ob', 32: 'Jo', 33: 'Mi', 34: 'Na', 35: 'Ha',
        36: 'Ze', 37: 'Ha', 38: 'Ze', 39: 'Ma', 40: 'Mt', 41: 'Mr', 42: 'Lu',
        43: 'Jn', 44: 'Ac', 45: 'Ro', 46: '1C', 47: '2C', 48: 'Ga', 49: 'Ep',
        50: 'Ph', 51: 'Co', 52: '1T', 53: '2T', 54: '1T', 55: '2T', 56: 'Ti',
        57: 'Pm', 58: 'He', 59: 'Ja', 60: '1P', 61: '2P', 62: '1J', 63: '2J',
        64: '3J', 65: 'Ju', 66: 'Re'
    };

    const fullBookNames = {
        1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
        6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
        11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
        15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms',
        20: 'Proverbs', 21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah',
        24: 'Jeremiah', 25: 'Lamentations', 26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea',
        29: 'Joel', 30: 'Amos', 31: 'Obadiah', 32: 'Jonah', 33: 'Micah',
        34: 'Nahum', 35: 'Habakkuk', 36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah',
        39: 'Malachi', 40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John',
        44: 'Acts', 45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians',
        48: 'Galatians', 49: 'Ephesians', 50: 'Philippians', 51: 'Colossians',
        52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
        55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
        60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
        65: 'Jude', 66: 'Revelation'
    };

    // Theme handling
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    fetch('data/kjv.json')
        .then(response => response.json())
        .then(data => {
            bibleData = data;
            displayBooks();
            searchInput.addEventListener('input', debounce(handleSearch, 500));
        })
        .catch(error => {
            console.error('Error loading Bible data:', error);
            resultCount.textContent = 'Error loading data. Please try again later.';
        });

    function displayBooks() {
        booksContainer.innerHTML = '';
        for (let i = 1; i <= 66; i++) {
            const box = document.createElement('div');
            box.className = 'box';
            box.textContent = bookAbbrev[i];
            box.setAttribute('data-book-id', i);
            box.addEventListener('click', () => displayChapters(i));
            box.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                displayBooks();
            });
            booksContainer.appendChild(box);
        }
    }

    function displayChapters(bookId) {
        const chapters = new Set(bibleData
            .filter(verse => verse.book === bookId)
            .map(verse => verse.chapter));

        booksContainer.innerHTML = '';
        chapters.forEach(chapter => {
            const box = document.createElement('div');
            box.className = 'box';
            box.textContent = chapter;
            box.addEventListener('click', () => displayVerses(bookId, chapter));
            box.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                displayBooks();
            });
            booksContainer.appendChild(box);
        });

        const backBtn = document.createElement('div');
        backBtn.className = 'box';
        backBtn.textContent = '←';
        backBtn.addEventListener('click', displayBooks);
        booksContainer.insertBefore(backBtn, booksContainer.firstChild);
    }

    function displayVerses(bookId, chapter, targetVerse = null) {
        const verses = bibleData.filter(verse => 
            verse.book === bookId && verse.chapter === chapter);

        booksContainer.innerHTML = '';
        verses.forEach(verse => {
            const box = document.createElement('div');
            box.className = 'box verse-box';
            box.innerHTML = `<span class="verse-number">${verse.verse}</span> ${verse.text}`;
            box.setAttribute('data-verse-id', `${bookId}-${chapter}-${verse.verse}`);
            box.addEventListener('click', () => handleVerseClick(box));
            box.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                displayChapters(bookId);
            });
            booksContainer.appendChild(box);

            if (targetVerse && verse.verse === targetVerse) {
                setTimeout(() => {
                    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    box.classList.add('highlight');
                }, 100);
            }
        });

        const backBtn = document.createElement('div');
        backBtn.className = 'box';
        backBtn.textContent = '←';
        backBtn.addEventListener('click', () => displayChapters(bookId));
        booksContainer.insertBefore(backBtn, booksContainer.firstChild);
    }

    function handleVerseClick(verseBox) {
        const selectedVerses = document.querySelectorAll('.verse-box.selected');
        
        if (!verseBox.classList.contains('selected')) {
            if (!event.shiftKey) {
                selectedVerses.forEach(v => v.classList.remove('selected'));
            }
            verseBox.classList.add('selected');
        } else {
            verseBox.classList.remove('selected');
        }

        updateClipboardButton();
    }

    function updateClipboardButton() {
        const existingBtn = document.getElementById('copy-btn');
        if (existingBtn) existingBtn.remove();

        const selectedVerses = document.querySelectorAll('.verse-box.selected');
        if (selectedVerses.length > 0) {
            const copyBtn = document.createElement('button');
            copyBtn.id = 'copy-btn';
            copyBtn.textContent = 'Copy Selected';
            copyBtn.addEventListener('click', copySelectedVerses);
            document.body.appendChild(copyBtn);
        }
    }

    function copySelectedVerses() {
        const selectedVerses = document.querySelectorAll('.verse-box.selected');
        const textToCopy = Array.from(selectedVerses)
            .map(verse => {
                const [bookId, chapter, verseNum] = verse.getAttribute('data-verse-id').split('-');
                return `${fullBookNames[bookId]} ${chapter}:${verseNum} ${verse.textContent.replace(/^\d+\s/, '')}`;
            })
            .join('\n');

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const copyBtn = document.getElementById('copy-btn');
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.remove(), 1000);
            })
            .catch(err => console.error('Failed to copy:', err));
    }

    function handleSearch(e) {
        const searchTerm = e.target.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            displayBooks();
            resultCount.textContent = '';
            return;
        }

        const results = bibleData.filter(verse => 
            verse.text.toLowerCase().includes(searchTerm)
        );

        resultCount.textContent = `${results.length} results found`;
        displaySearchResults(results, searchTerm);
    }

    function displaySearchResults(results, searchTerm) {
        booksContainer.innerHTML = '';
        results.forEach(verse => {
            const box = document.createElement('div');
            box.className = 'box verse-box';
            const text = verse.text.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span class="highlight">${match}</span>`
            );
            box.innerHTML = `${bookAbbrev[verse.book]} ${verse.chapter}:${verse.verse} ${text}`;
            box.addEventListener('click', () => 
                displayVerses(verse.book, verse.chapter, verse.verse));
            booksContainer.appendChild(box);
        });
    }

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }
});
