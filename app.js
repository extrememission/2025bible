document.addEventListener('DOMContentLoaded', () => {
    const booksContainer = document.getElementById('books');
    const searchInput = document.getElementById('search');
    const resultCount = document.getElementById('result-count');
    const stickyMessage = document.getElementById('sticky-message');
    const installButton = document.getElementById('installButton');
    const bibleData = [];
    
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.style.display = 'block';
    });
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installButton.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });

    const params = new URLSearchParams(window.location.search);
    const book = params.get('book');
    const chapter = params.get('chapter');
    const verse = params.get('verse');

    function showMessage(message, hasLink = false) {
        stickyMessage.style.opacity = '0';
        setTimeout(() => {
            stickyMessage.innerHTML = hasLink ? 
                message.replace('here', '<span class="message-link">here</span>') : 
                message;
            stickyMessage.style.opacity = '1';
        }, 300);
    }

    function addTouchListeners(element) {
        let startX, startY;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY) && diffX < -50) {
                if (e.target.classList.contains('verse-box')) {
                    const bookId = e.target.dataset.bookId;
                    toggleChapters(bookId);
                } else if (e.target.classList.contains('chapter-box')) {
                    displayBooks();
                }
            }
        }, { passive: false });
    }

    function displayBooks() {
        booksContainer.innerHTML = '';
        const abbreviatedBooks = [
            "GE", "EX", "LE", "NU", "DE", "JO", "JU", "RU", "1S", "2S",
            "1K", "2K", "1C", "2C", "EZ", "NE", "ES", "JO", "PS", "PR",
            "EC", "SO", "IS", "JE", "LA", "EZ", "DA", "HO", "JO", "AM",
            "OB", "JO", "MI", "NA", "HA", "ZE", "HA", "ZE", "MA",
            "MA", "MA", "LU", "JO", "AC", "RO", "1C", "2C", "GA", "EP",
            "PH", "CO", "1T", "2T", "1T", "2T", "TI", "PH",
            "HE", "JA", "1P", "2P", "1J", "2J", "3J", "JU", "RE"
        ];
        
        abbreviatedBooks.forEach((abbr, index) => {
            const bookId = (index + 1).toString();
            const bookBox = createBoxElement(abbr);
            bookBox.classList.add('book-box');
            if (parseInt(bookId) >= 40) { // Matthew (40) through Revelation
                bookBox.classList.add('new-testament');
            }
            bookBox.dataset.bookId = bookId;
            bookBox.addEventListener('click', () => toggleChapters(bookId));
            bookBox.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                displayBooks();
            });
            addTouchListeners(bookBox);
            booksContainer.appendChild(bookBox);
        });
        stickyMessage.style.display = 'none';
    }

    function toggleChapters(bookId) {
        booksContainer.innerHTML = '';
        const chapters = getChaptersByBookId(bookId);
        chapters.forEach(chapter => {
            const chapterBox = createBoxElement(`${bookNames[bookId]} ${chapter}`);
            chapterBox.classList.add('chapter-box');
            chapterBox.dataset.chapter = chapter;
            chapterBox.dataset.bookId = bookId;
            chapterBox.addEventListener('click', () => toggleVerses(bookId, chapter));
            chapterBox.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                displayBooks();
            });
            addTouchListeners(chapterBox);
            booksContainer.appendChild(chapterBox);
        });
        stickyMessage.style.display = 'block';
        stickyMessage.innerHTML = '<span class="message-link">TAP HERE</span> OR SWIPE LEFT TO GO BACK';
    }

    function getChaptersByBookId(bookId) {
        const chapters = new Set();
        bibleData.forEach(verse => {
            if (verse.field[1] === parseInt(bookId)) {
                chapters.add(verse.field[2]);
            }
        });
        return Array.from(chapters).sort((a, b) => a - b);
    }

    function toggleVerses(bookId, chapter, targetVerseNumber = null) {
        booksContainer.innerHTML = '';
        const verses = getVersesByBookAndChapter(bookId, chapter);
        verses.forEach(verse => {
            const verseNumber = verse.field[3];
            const verseText = `${verse.field[4]}\n—${bookNames[bookId]} ${chapter}:${verseNumber}`;
            const verseBox = document.createElement('div');
            verseBox.className = 'box verse-box';

            const textDiv = document.createElement('div');
            textDiv.className = 'verse-content';
            textDiv.innerHTML = verseText;

            const copyIcon = document.createElement('i');
            copyIcon.className = 'material-icons copy-icon';
            copyIcon.textContent = 'content_copy';

            copyIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const parts = verseText.split('\n');
                const formattedText = `${parts[0]}\n—${parts[1].substring(1)}`;

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(formattedText)
                        .then(() => {
                            copyIcon.textContent = 'done';
                            setTimeout(() => copyIcon.textContent = 'content_copy', 1000);
                        });
                }
            });

            const nativeShareIcon = document.createElement('i');
            nativeShareIcon.className = 'material-icons native-share-icon';
            nativeShareIcon.textContent = 'ios_share';

            nativeShareIcon.addEventListener('click', async (e) => {
                e.stopPropagation();
                const parts = verseText.split('\n');
                const formattedText = `${parts[0]}\n—${parts[1].substring(1)}`;
                
                if (navigator.share) {
                    try {
                        await navigator.share({
                            text: formattedText
                        });
                        nativeShareIcon.textContent = 'done';
                        setTimeout(() => nativeShareIcon.textContent = 'ios_share', 1000);
                    } catch (err) {
                        console.error('Share failed:', err);
                    }
                }
            });

            const shareIcon = document.createElement('i');
            shareIcon.className = 'material-icons share-icon';
            shareIcon.textContent = 'share';

            shareIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/verse.html?book=${bookId}&chapter=${chapter}&verse=${verseNumber}`;

    // Open the URL in a new tab
    window.open(url, '_blank');

    // Optionally, you can still copy the URL to clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url)
            .then(() => {
                shareIcon.textContent = 'done';
                setTimeout(() => shareIcon.textContent = 'share', 1000);
            });
    }
});


            verseBox.appendChild(textDiv);
            verseBox.appendChild(copyIcon);
            verseBox.appendChild(nativeShareIcon);
            verseBox.appendChild(shareIcon);
            verseBox.dataset.verse = verseNumber;
            verseBox.dataset.bookId = bookId;
            verseBox.dataset.chapter = chapter;

            verseBox.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleChapters(bookId);
            });

            addTouchListeners(verseBox);
            booksContainer.appendChild(verseBox);

            if (targetVerseNumber && parseInt(verseNumber) === parseInt(targetVerseNumber)) {
                setTimeout(() => {
                    const verseBoxRect = verseBox.getBoundingClientRect();
                    const scrollTop = window.scrollY || window.pageYOffset;
                    const offsetTop = verseBoxRect.top + scrollTop - 20;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    const highlightSpan = document.createElement('span');
                    highlightSpan.className = 'highlight';
                    highlightSpan.textContent = verse.field[4];
                    textDiv.innerHTML = `${highlightSpan.outerHTML}\n—${bookNames[bookId]} ${chapter}:${verseNumber}`;
                }, 100);
            }
        });
        stickyMessage.style.display = 'block';
        stickyMessage.innerHTML = '<span class="message-link">TAP HERE</span> OR SWIPE LEFT TO GO BACK';
    }

    function getVersesByBookAndChapter(bookId, chapter) {
        return bibleData.filter(verse =>
            verse.field[1] === parseInt(bookId) &&
            verse.field[2] === parseInt(chapter)
        );
    }

    function searchHandler() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.length < 3) {
            booksContainer.innerHTML = '';
            resultCount.textContent = 'Enter verse reference or search term to begin search.';
            return;
        }

        booksContainer.innerHTML = '';
        setTimeout(() => {
            if (searchTerm.includes(':')) {
                const [bookChapterPart, versePart] = searchTerm.split(':');
                const verse = parseInt(versePart);
                const matches = bookChapterPart.match(/^(.+?)(?:\s+(\d+))?$/);
                if (!matches) {
                    resultCount.textContent = 'Reference not found. Try a different format.';
                    return;
                }

                const [_, bookPart, chapter = 1] = matches;
                const bookId = Object.entries(bookNames).find(([_, name]) => {
                    const searchName = name.toLowerCase().replace(/\s+/g, '');
                    const searchTerm = bookPart.toLowerCase().replace(/\s+/g, '');
                    return searchName.startsWith(searchTerm);
                })?.[0];

                if (bookId) {
                    const verses = getVersesByBookAndChapter(bookId, parseInt(chapter));
                    const targetVerse = verses.find(v => v.field[3] === verse);
                    if (targetVerse) {
                        resultCount.textContent = 'Reference found';
                        const verseText = targetVerse.field[4];
                        const fullText = `${verseText}\n—${bookNames[bookId]} ${chapter}:${verse}`;
                        const resultBox = createBoxElement(fullText);
                        resultBox.classList.add('result-box');
                        resultBox.addEventListener('click', () => {
                            toggleChapters(bookId);
                            toggleVerses(bookId, chapter, verse);
                            searchInput.value = '';
                            resultCount.textContent = '';
                        });
                        booksContainer.appendChild(resultBox);
                        return;
                    }
                }
                resultCount.textContent = 'Reference not found. Try a different format.';
                return;
            }

            const results = bibleData.filter(verse =>
                verse.field[4].toLowerCase().includes(searchTerm)
            );
            const highlightTerm = new RegExp(`(${searchTerm})`, 'gi');
            resultCount.textContent = `Results: ${results.length}`;

            results.forEach(result => {
                const bookId = result.field[1];
                const bookName = bookNames[bookId];
                const chapter = result.field[2];
                const verseNumber = result.field[3];
                const verseText = result.field[4].replace(highlightTerm, '<span class="highlight">$1</span>');
                const fullText = `${verseText}\n—${bookName} ${chapter}:${verseNumber}`;
                const resultBox = createBoxElement(fullText);
                resultBox.classList.add('result-box');
                resultBox.addEventListener('click', () => {
                    toggleChapters(bookId);
                    toggleVerses(bookId, chapter, verseNumber);
                    searchInput.value = '';
                    resultCount.textContent = '';
                });
                booksContainer.appendChild(resultBox);
            });
        }, 500);
    }

    function createBoxElement(text) {
        const box = document.createElement('div');
        box.className = 'box';
        box.innerHTML = text;
        return box;
    }

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    // Initialize the app
    if (book && chapter && verse) {
        fetch('data/kjv.json')
            .then(response => response.json())
            .then(data => {
                bibleData.push(...data.resultset.row);
                toggleChapters(book);
                toggleVerses(book, chapter, verse);
            });
    } else {
        displayBooks();
    }

    const offlineToggle = document.getElementById('offlineToggle');
    
    offlineToggle.addEventListener('change', async (e) => {
        if (e.target.checked) {
            try {
                const cache = await caches.open('bible-v2');
                await cache.addAll(ASSETS);
                const response = await fetch('data/kjv.json');
                await cache.put('data/kjv.json', response.clone());
                offlineToggle.disabled = true;
                e.target.checked = true;
            } catch (error) {
                console.error('Failed to cache data:', error);
                e.target.checked = false;
            }
        }
    });

    fetch('data/kjv.json')
        .then(response => response.json())
        .then(data => {
            bibleData.push(...data.resultset.row);
            searchInput.addEventListener('input', debounce(searchHandler, 500));
            window.dispatchEvent(new Event('bibleDataLoaded'));
            })
        .catch(error => {
            console.error('Error fetching Bible data:', error);
            resultCount.textContent = 'Error loading data. Please try again later.';
        });

    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 0) {
            showMessage("Select a result to see the verse in context");
        } else {
            stickyMessage.style.opacity = '0';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('message-link')) {
            if (document.querySelector('.verse-box')) {
                const bookId = document.querySelector('.verse-box').dataset.bookId;
                toggleChapters(bookId);
            } else if (document.querySelector('.chapter-box')) {
                displayBooks();
            }
        }
    });
});
