document.addEventListener('DOMContentLoaded', function() {
    
    const API_URL = 'http://5.35.102.132:5000/api';
    
   
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
   
    const dom = {
        authButtons: document.querySelector('.header__auth'),
        profileSection: document.querySelector('.header__profile'),
        profileName: document.querySelector('.profile__name'),
        profilePoints: document.querySelector('.profile__points'),
        announcementsList: document.querySelector('.announcements__list'),
        addButton: document.querySelector('.main__add-btn'),
        formContainer: document.querySelector('.form-container'),
        form: document.querySelector('.form'),
        loginModal: document.querySelector('.auth-modal--login'),
        registerModal: document.querySelector('.auth-modal--register'),
        loginForm: document.querySelector('.auth-form--login'),
        registerForm: document.querySelector('.auth-form--register'),
        loginError: document.querySelector('.auth-form--login .auth-form__error'),
        registerError: document.querySelector('.auth-form--register .auth-form__error')
    };

   
    const api = {
        
        register: async (username, password) => {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        },

       
        login: async (username, password) => {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            return await response.json();
        },

      
        getAds: async () => {
            const response = await fetch(`${API_URL}/ads`);
            return await response.json();
        },

        
        createAd: async (adData, username, password) => {
            const response = await fetch(`${API_URL}/ads`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                },
                body: JSON.stringify(adData)
            });
            return await response.json();
        },

        
        deleteAd: async (id, username, password) => {
            const response = await fetch(`${API_URL}/ads/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            return await response.json();
        },

        
        takeAd: async (id, username, password) => {
            const response = await fetch(`${API_URL}/ads/${id}/take`, {
                method: 'POST',
                headers: { 
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            return await response.json();
        },

       
        completeAd: async (id, username, password) => {
            const response = await fetch(`${API_URL}/ads/${id}/complete`, {
                method: 'POST',
                headers: { 
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            return await response.json();
        },

        
        confirmAd: async (id, username, password) => {
            const response = await fetch(`${API_URL}/ads/${id}/confirm`, {
                method: 'POST',
                headers: { 
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            return await response.json();
        }
    };

    
    const helpers = {
        closeAllModals: () => {
            dom.loginModal.style.display = 'none';
            dom.registerModal.style.display = 'none';
        },
        
        showModal: (modal) => {
            helpers.closeAllModals();
            modal.style.display = 'flex';
        },
        
        reloadPage: () => {
            location.reload();
        },
        
        handleAuthSuccess: (user, password) => {
            currentUser = { ...user, password };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            helpers.closeAllModals();
            helpers.reloadPage();
        },
        
        logout: () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            helpers.reloadPage();
        },
        
        showAddForm: () => {
            if (currentUser) {
                dom.formContainer.style.display = 'block';
                dom.addButton.style.display = 'none';
            } else {
                alert('Для добавления объявления необходимо войти в систему');
            }
        },
        
        hideAddForm: () => {
            dom.formContainer.style.display = 'none';
            dom.addButton.style.display = 'block';
            dom.form.reset();
        },
        
        updateAuthUI: () => {
            if (currentUser) {
                dom.authButtons.style.display = 'none';
                dom.profileSection.style.display = 'flex';
                dom.profileName.textContent = currentUser.username;
                dom.profilePoints.textContent = `Баллы: ${currentUser.points}`;
                dom.addButton.style.display = 'block';
            } else {
                dom.authButtons.style.display = 'block';
                dom.profileSection.style.display = 'none';
                dom.addButton.style.display = 'none';
                dom.formContainer.style.display = 'none';
            }
        }
    };

    
    const announcements = {
        render: async () => {
            try {
                const ads = await api.getAds();
                dom.announcementsList.innerHTML = '';
                
                ads.forEach(ad => {
                    const adElement = document.createElement('div');
                    adElement.className = 'announcement';
                    
                    
                    adElement.innerHTML = `
                        <div class="announcement__header">
                            <h3 class="announcement__title">${ad.title}</h3>
                            <span class="announcement__points">${ad.points} баллов</span>
                        </div>
                        <div class="announcement__author">Автор: ${ad.authorName}</div>
                        <div class="announcement__description-container">
                            <p class="announcement__description">${ad.description}</p>
                        </div>
                        <div class="announcement__date">${new Date(ad.createdAt).toLocaleString()}</div>
                        ${announcements.createStatusHTML(ad)}
                        ${announcements.createActionsHTML(ad)}
                    `;
                    
                    
                    const descContainer = adElement.querySelector('.announcement__description-container');
                    const desc = adElement.querySelector('.announcement__description');
                    
                    if (desc.scrollHeight > desc.clientHeight) {
                        const toggleBtn = document.createElement('button');
                        toggleBtn.className = 'announcement__toggle-description';
                        toggleBtn.textContent = 'Развернуть';
                        descContainer.appendChild(toggleBtn);
                        
                        toggleBtn.addEventListener('click', function() {
                            desc.classList.toggle('expanded');
                            this.textContent = desc.classList.contains('expanded') ? 'Свернуть' : 'Развернуть';
                        });
                    }
                    
                    dom.announcementsList.appendChild(adElement);
                });
                
                announcements.initButtons();
            } catch (error) {
                console.error('Ошибка загрузки объявлений:', error);
            }
        },
        
        createStatusHTML: (ad) => {
            if (ad.status === 'in_progress') {
                return `<div class="announcement__status">В процессе выполнения</div>`;
            }
            if (ad.status === 'completed') {
                return ad.pointsAwarded 
                    ? `<div class="announcement__status announcement__status--completed">Задание выполнено</div>`
                    : `<div class="announcement__status announcement__status--pending">Ожидает подтверждения</div>`;
            }
            return '';
        },
        
        createActionsHTML: (ad) => {
            if (!currentUser) return '';
            
            if (ad.status === 'active') {
                if (currentUser.id !== ad.authorId) {
                    return `
                        <div class="announcement__actions">
                            <button class="announcement__button announcement__button--take" data-id="${ad.id}">
                                Взять задание
                            </button>
                        </div>
                    `;
                } else {
                    return `
                        <div class="announcement__actions">
                            <button class="announcement__button announcement__button--cancel" data-id="${ad.id}">
                                Удалить
                            </button>
                        </div>
                    `;
                }
            }
            
            if (ad.status === 'in_progress' && currentUser.id === ad.executorId) {
                return `
                    <div class="announcement__actions">
                        <button class="announcement__button announcement__button--complete" data-id="${ad.id}">
                            Завершить
                        </button>
                    </div>
                `;
            }
            
            if (ad.status === 'completed' && currentUser.id === ad.authorId && !ad.pointsAwarded) {
                return `
                    <div class="announcement__actions">
                        <button class="announcement__button announcement__button--confirm" data-id="${ad.id}">
                            Подтвердить
                        </button>
                    </div>
                `;
            }
            
            return '';
        },
        
        initButtons: () => {
            document.querySelectorAll('.announcement__button--take').forEach(btn => {
                btn.addEventListener('click', announcements.take);
            });
            
            document.querySelectorAll('.announcement__button--complete').forEach(btn => {
                btn.addEventListener('click', announcements.complete);
            });
            
            document.querySelectorAll('.announcement__button--confirm').forEach(btn => {
                btn.addEventListener('click', announcements.confirm);
            });
            
            document.querySelectorAll('.announcement__button--cancel').forEach(btn => {
                btn.addEventListener('click', announcements.cancel);
            });
        },
        
        take: async function() {
            const id = this.getAttribute('data-id');
            try {
                await api.takeAd(id, currentUser.username, currentUser.password);
                await announcements.render();
                alert('Вы взяли задание!');
            } catch (error) {
                alert(error.message || 'Ошибка при взятии задания');
            }
        },
        
        complete: async function() {
            const id = this.getAttribute('data-id');
            try {
                await api.completeAd(id, currentUser.username, currentUser.password);
                await announcements.render();
                alert('Задание завершено!');
            } catch (error) {
                alert(error.message || 'Ошибка при завершении задания');
            }
        },
        
        confirm: async function() {
            const id = this.getAttribute('data-id');
            try {
                await api.confirmAd(id, currentUser.username, currentUser.password);
                await announcements.render();
                alert('Баллы переданы исполнителю!');
                helpers.updateAuthUI();
            } catch (error) {
                alert(error.message || 'Ошибка при подтверждении');
            }
        },
        
        cancel: async function() {
            const id = this.getAttribute('data-id');
            try {
                await api.deleteAd(id, currentUser.username, currentUser.password);
                await announcements.render();
            } catch (error) {
                alert(error.message || 'Ошибка при удалении');
            }
        },
        
        submit: async (e) => {
            e.preventDefault();
            
            try {
                const title = document.getElementById('title').value;
                const description = document.getElementById('description').value;
                const points = parseInt(document.getElementById('points').value);
                
                if (!title || !description) throw new Error('Заполните все поля');
                if (points < 10 || points > 50) throw new Error('Баллы: от 10 до 50');
                
                await api.createAd({
                    title,
                    description,
                    points,
                    createdAt: new Date().toISOString()
                }, currentUser.username, currentUser.password);
                
                await announcements.render();
                helpers.hideAddForm();
            } catch (error) {
                alert(error.message || 'Ошибка при создании объявления');
            }
        }
    };

    
    const init = {
        eventListeners: () => {
           
            document.querySelector('.header__auth-btn--login').addEventListener('click', 
                () => helpers.showModal(dom.loginModal));
            document.querySelector('.header__auth-btn--register').addEventListener('click', 
                () => helpers.showModal(dom.registerModal));
            
            
            document.querySelectorAll('.auth-modal__close').forEach(btn => {
                btn.addEventListener('click', helpers.closeAllModals);
            });
            
            
            document.querySelectorAll('.auth-modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) helpers.closeAllModals();
                });
            });
            
            
            dom.loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('login-username').value;
                const password = document.getElementById('login-password').value;
                
                try {
                    const user = await api.login(username, password);
                    helpers.handleAuthSuccess(user, password);
                    dom.loginError.textContent = '';
                } catch (error) {
                    dom.loginError.textContent = 'Неверный логин или пароль';
                }
            });
            
            
            dom.registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('register-username').value;
                const password = document.getElementById('register-password').value;
                const passwordConfirm = document.getElementById('register-password-confirm').value;
                
                if (password !== passwordConfirm) {
                    dom.registerError.textContent = 'Пароли не совпадают';
                    return;
                }
                
                try {
                    await api.register(username, password);
                    const user = await api.login(username, password);
                    helpers.handleAuthSuccess(user, password);
                    dom.registerError.textContent = '';
                } catch (error) {
                    dom.registerError.textContent = error.message || 'Ошибка регистрации';
                }
            });
            
          
            document.querySelector('.profile__logout').addEventListener('click', helpers.logout);
            

            dom.addButton.addEventListener('click', helpers.showAddForm);
            document.querySelector('.form__button--cancel').addEventListener('click', helpers.hideAddForm);
            dom.form.addEventListener('submit', announcements.submit);
        },
        
        start: async () => {
            init.eventListeners();
            helpers.updateAuthUI();
            await announcements.render();
        }
    };


    init.start();
});