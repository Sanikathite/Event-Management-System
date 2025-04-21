document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleButton = document.createElement('div');
    toggleButton.className = 'sidebar-toggle';
    sidebar.insertBefore(toggleButton, sidebar.firstChild);

    toggleButton.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('sidebar-expanded');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && sidebar.classList.contains('expanded')) {
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('sidebar-expanded');
        }
    });

    // Prevent sidebar from closing when clicking inside it
    sidebar.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}); 