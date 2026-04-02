var REDIRECT_URL = "login.html";


var registerModal = document.getElementById("registerModal");
var loginModal = document.getElementById("loginModal");
var btnRegister = document.getElementById("r1p3");
var btnLogin = document.getElementById("r1p4");
var closeRegister = document.getElementById("closeRegister");
var closeLogin = document.getElementById("closeLogin");
var switchToLogin = document.getElementById("switchToLogin");
var switchToRegister = document.getElementById("switchToRegister");
var registerForm = document.getElementById("registerForm");
var loginForm = document.getElementById("loginForm");


function openModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
}


btnRegister.addEventListener("click", function () {
    openModal(registerModal);
});


btnLogin.addEventListener("click", function () {
    openModal(loginModal);
});


closeRegister.addEventListener("click", function () {
    closeModal(registerModal);
});

closeLogin.addEventListener("click", function () {
    closeModal(loginModal);
});


switchToLogin.addEventListener("click", function () {
    closeModal(registerModal);
    setTimeout(function () {
        openModal(loginModal);
    }, 200);
});

switchToRegister.addEventListener("click", function () {
    closeModal(loginModal);
    setTimeout(function () {
        openModal(registerModal);
    }, 200);
});


registerModal.addEventListener("click", function (e) {
    if (e.target === registerModal) {
        closeModal(registerModal);
    }
});

loginModal.addEventListener("click", function (e) {
    if (e.target === loginModal) {
        closeModal(loginModal);
    }
});


document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal(registerModal);
        closeModal(loginModal);
    }
});


function showMessage(elementId, text, type) {
    var msg = document.getElementById(elementId);
    msg.textContent = text;
    msg.className = "form-message show " + type;
}


function getUsers() {
    var data = localStorage.getItem("users");
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}


registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("reg-name").value.trim();
    var email = document.getElementById("reg-email").value.trim().toLowerCase();
    var password = document.getElementById("reg-password").value;
    var passwordConfirm = document.getElementById("reg-password-confirm").value;

    if (!name || !email || !password || !passwordConfirm) {
        showMessage("reg-message", "Заполните все поля!", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("reg-message", "Пароль минимум 6 символов!", "error");
        return;
    }

    if (password !== passwordConfirm) {
        showMessage("reg-message", "Пароли не совпадают!", "error");
        return;
    }

    var users = getUsers();
    var i;
    for (i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            showMessage("reg-message", "Аккаунт с таким email уже существует!", "error");
            return;
        }
    }

    var newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    showMessage("reg-message", "Регистрация успешна! Перенаправляем...", "success");

    setTimeout(function () {
        window.location.href = REDIRECT_URL;
    }, 1500);
});


loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = document.getElementById("login-email").value.trim().toLowerCase();
    var password = document.getElementById("login-password").value;

    if (!email || !password) {
        showMessage("login-message", "Заполните все поля!", "error");
        return;
    }

    var users = getUsers();
    var foundUser = null;
    var i;
    for (i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            foundUser = users[i];
            break;
        }
    }

    if (!foundUser) {
        showMessage("login-message", "Неверный email или пароль!", "error");
        return;
    }

    setCurrentUser(foundUser);

    showMessage("login-message", "Добро пожаловать, " + foundUser.name + "!", "success");

    setTimeout(function () {
        window.location.href = REDIRECT_URL;
    }, 1500);
});
let current = 0;
const slides = document.querySelectorAll('.slide');
const total = slides.length;


function changeSlide(direction) {
  slides[current].classList.remove('active');   
  current = (current + direction + total) % total; 
  slides[current].classList.add('active');       
  resetTimer();                                  
}


let timer = setInterval(() => changeSlide(1), 5000);


function resetTimer() {
  clearInterval(timer);
  timer = setInterval(() => changeSlide(1), 5000);
}