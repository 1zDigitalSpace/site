const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// 检查本地存储或系统偏好
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  body.classList.add('dark-theme');
}

// 切换主题
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
});