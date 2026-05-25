let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let currentSubject = '';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectSubject(subject) {
    currentSubject = subject;
    showScreen('landing-' + subject);
}

function goBack() {
    showScreen('subject-select');
}

function goToSubjects() {
    showScreen('subject-select');
}

function goToModes() {
    showScreen('landing-' + currentSubject);
}

function buildMiniQuiz(sourcePool, fullPool) {
    const allAnswers = fullPool.map(q => q.answer);
    return sourcePool.map((item, idx) => {
        const otherAnswers = allAnswers.filter(a => a !== item.answer);
        const shuffled = shuffle(otherAnswers);
        return {
            question: item.question,
            correct: item.answer,
            wrong1: shuffled[0],
            wrong2: shuffled[1]
        };
    });
}

function getRandomCheckbox() {
    if (currentSubject === 'tmo') {
        return document.getElementById('randomOrderTmo').checked;
    } else {
        return document.getElementById('randomOrderOp').checked;
    }
}

function startQuiz(mode) {
    const random = getRandomCheckbox();

    if (mode === 'tmo-all') {
        let pool = [...QUESTIONS_MINI];
        if (random) pool = shuffle(pool);
        currentQuiz = buildMiniQuiz(pool, QUESTIONS_MINI);
    } else if (mode === 'tmo-blitz') {
        let pool = [...QUESTIONS_MINI];
        if (random) pool = shuffle(pool);
        pool = pool.slice(0, 10);
        currentQuiz = buildMiniQuiz(pool, QUESTIONS_MINI);
    } else if (mode === 'tmo-short-all') {
        let pool = [...QUESTIONS];
        if (random) pool = shuffle(pool);
        currentQuiz = pool;
    } else if (mode === 'tmo-short-blitz') {
        let pool = [...QUESTIONS];
        if (random) pool = shuffle(pool);
        currentQuiz = pool.slice(0, 10);
    } else if (mode === 'op-all') {
        let pool = [...QUESTIONS_OP];
        if (random) pool = shuffle(pool);
        currentQuiz = buildMiniQuiz(pool, QUESTIONS_OP);
    } else if (mode === 'op-blitz') {
        let pool = [...QUESTIONS_OP];
        if (random) pool = shuffle(pool);
        pool = pool.slice(0, 10);
        currentQuiz = buildMiniQuiz(pool, QUESTIONS_OP);
    }

    currentIndex = 0;
    score = 0;
    document.getElementById('totalQuestions').textContent = currentQuiz.length;
    showScreen('quiz');
    renderQuestion();
}

function renderQuestion() {
    answered = false;
    const q = currentQuiz[currentIndex];
    document.getElementById('questionNum').textContent = currentIndex + 1;
    document.getElementById('score').textContent = score;
    document.getElementById('progressFill').style.width =
        ((currentIndex) / currentQuiz.length * 100) + '%';
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('btnNext').style.display = 'none';

    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';

    const options = shuffle([
        { text: q.correct, isCorrect: true },
        { text: q.wrong1, isCorrect: false },
        { text: q.wrong2, isCorrect: false }
    ]);

    options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = opt.text;
        btn.onclick = () => selectAnswer(btn, opt.isCorrect, q.correct);
        answersDiv.appendChild(btn);
    });
}

function selectAnswer(btn, isCorrect, correctText) {
    if (answered) return;
    answered = true;

    const allBtns = document.querySelectorAll('.answer-btn');
    allBtns.forEach(b => {
        b.classList.add('disabled');
        if (b.textContent === correctText) {
            b.classList.add('show-correct');
        }
    });

    const feedback = document.getElementById('feedback');

    if (isCorrect) {
        btn.classList.add('correct');
        score++;
        feedback.textContent = '✓ Правильно!';
        feedback.className = 'feedback correct';
    } else {
        btn.classList.add('wrong');
        feedback.innerHTML = '✗ Неправильно!<br><strong>Правильный ответ:</strong> ' + correctText;
        feedback.className = 'feedback wrong';
    }

    document.getElementById('score').textContent = score;
    document.getElementById('btnNext').style.display = 'block';

    if (currentIndex === currentQuiz.length - 1) {
        document.getElementById('btnNext').textContent = 'Показать результаты';
    } else {
        document.getElementById('btnNext').textContent = 'Следующий вопрос →';
    }
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex >= currentQuiz.length) {
        showResults();
        return;
    }
    renderQuestion();
}

function showResults() {
    showScreen('results');
    const total = currentQuiz.length;
    const pct = Math.round((score / total) * 100);
    document.getElementById('resultsScore').textContent = `${score} / ${total} (${pct}%)`;

    let msg = '';
    if (pct >= 90) msg = 'Отлично! Ты прекрасно знаешь материал! 🎉';
    else if (pct >= 70) msg = 'Хорошо! Есть что повторить, но основа крепкая 👍';
    else if (pct >= 50) msg = 'Неплохо, но стоит подучить материал 📖';
    else msg = 'Нужно ещё поработать над материалом 💪';

    document.getElementById('resultsMessage').textContent = msg;
}

function quitQuiz() {
    showScreen('landing-' + currentSubject);
}
