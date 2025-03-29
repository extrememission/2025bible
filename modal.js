
window.onload = () => {
    const modal = document.getElementById('splash-modal');
    let isDataLoaded = false;
    
    function hideModal() {
        if (!isDataLoaded) return;
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    
    window.addEventListener('bibleDataLoaded', () => {
        isDataLoaded = true;
        setTimeout(hideModal, 2000);
    });

    // Ensure modal stays visible if data isn't loaded
    setInterval(() => {
        if (!isDataLoaded) {
            modal.style.display = 'flex';
            modal.style.opacity = '1';
        }
    }, 100);
};
