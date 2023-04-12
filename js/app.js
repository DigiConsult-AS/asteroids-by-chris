document.addEventListener('DOMContentLoaded', function () {
    const toggleMainBtn = document.getElementById('toggleMain');
    const mainContent = document.getElementById('mainContent');
    const arrow = document.getElementById('arrow');

    toggleMainBtn.addEventListener('click', function () {
        toggleMainBtn.blur();

        if (mainContent.classList.contains('fade-out') || !mainContent.classList.contains('fade-in')) {
            mainContent.classList.remove('fade-out');
            mainContent.classList.add('fade-in');
            toggleMainBtn.textContent = 'Hide Description';
            arrow.style.display = 'none';
        } else {
            mainContent.classList.remove('fade-in');
            mainContent.classList.add('fade-out');
            toggleMainBtn.textContent = 'Show Description';
        }
    });

    // Hide the description after 15 seconds and show the big arrow
    setTimeout(() => {
        mainContent.classList.remove('fade-in');
        mainContent.classList.add('fade-out');
        toggleMainBtn.textContent = 'Show Description';
        arrow.style.display = 'block';
        arrow.classList.add('glow');
    }, 5000);
});