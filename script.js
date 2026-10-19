const views = document.querySelectorAll('.page-view');
const navLinks = document.querySelectorAll('[data-route]');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const topicModal = document.querySelector('#topic-modal');
const topicCards = document.querySelectorAll('.issue-card');
const topicContent = {
	climate: { number: '01 / ԿԼԻՄԱ', title: 'Հովացնենք մոլորակը', description: 'Կլիմայի փոփոխության վրա ազդում են միլիոնավոր առօրյա որ[...]
	forest: { number: '02 / ԱՆՏԱՌՆԵՐ', title: 'Պահպանենք անտառները', description: 'Անտառները պաշտպանում են կենսաբազմազանությունը, կո�[...]
	ocean: { number: '03 / ՕՎԿԻԱՆՈՍՆԵՐ', title: 'Տեղ թողնենք օվկիանոսներին', description: 'Օվկիանոսը կարգավորում է կլիման և սնունդ տա[...]
};

function openTopic(topic) {
	const content = topicContent[topic];
	if (!content) return;
	document.querySelector('#topic-number').textContent = content.number;
	document.querySelector('#topic-title').textContent = content.title;
	document.querySelector('#topic-description').textContent = content.description;
	document.querySelector('#topic-detail').innerHTML = `<strong>${content.detail}</strong><p>${content.body}</p>`;
	document.querySelector('#topic-sections').innerHTML = `<h3>Ուշադրության կենտրոնում</h3><ul>${content.facts.map(fact => `<li>${fact}</li>`).join('')}</ul><h3>Մեկ պարզ հա[...]
	document.querySelector('#topic-image').style.backgroundImage = `url("${content.image}")`;
	topicModal.classList.add('is-open');
	topicModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-open');
	topicModal.querySelector('.modal-close').focus();
}

function closeTopic() {
	topicModal.classList.remove('is-open');
	topicModal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('modal-open');
}

topicCards.forEach(card => {
	card.addEventListener('click', () => openTopic(card.dataset.topic));
});
topicModal.addEventListener('click', event => {
	if (event.target.matches('[data-close-modal]')) closeTopic();
});
document.addEventListener('keydown', event => {
	if (event.key === 'Escape' && topicModal.classList.contains('is-open')) closeTopic();
});

function showView(route) {
	const target = document.querySelector(`[data-view="${route}"]`) || document.querySelector('[data-view="home"]');
	views.forEach(view => view.classList.toggle('active-view', view === target));
	document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
	mainNav.classList.remove('open');
	menuToggle.setAttribute('aria-expanded', 'false');
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => link.addEventListener('click', event => {
	const route = link.dataset.route;
	if (!route) return;
	event.preventDefault();
	history.pushState({ route }, '', `#${route}`);
	showView(route);
	if (topicModal.classList.contains('is-open')) closeTopic();
}));

menuToggle.addEventListener('click', () => {
	const isOpen = mainNav.classList.toggle('open');
	menuToggle.setAttribute('aria-expanded', String(isOpen));
});

window.addEventListener('popstate', () => showView(location.hash.slice(1) || 'home'));
showView(location.hash.slice(1) || 'home');

const counters = document.querySelectorAll('.counter');
const animateCounters = () => counters.forEach(counter => {
	const target = Number(counter.dataset.target);
	let current = 0;
	const step = Math.max(1, target / 35);
	const tick = () => {
		current = Math.min(target, current + step);
		counter.textContent = target === 1 ? current.toFixed(1) : Math.floor(current);
		if (current < target) requestAnimationFrame(tick);
	};
	tick();
});
setTimeout(animateCounters, 350);

const questions = [...document.querySelectorAll('.question')];
const nextButton = document.querySelector('#next-question');
const progressFill = document.querySelector('.progress-fill');
const resultValue = document.querySelector('#result-value');
const resultMessage = document.querySelector('#result-message');
const resultTip = document.querySelector('#result-tip');
const quizIntro = document.querySelector('#quiz-intro');
const startQuizButton = document.querySelector('#start-quiz');
const quizFeedback = document.querySelector('#quiz-feedback');
let currentQuestion = 0;
let footprint = 0;
let quizStarted = false;

function setQuizProgress(percent) {
	progressFill.style.width = `${progressFill.parentElement.clientWidth * percent / 100}px`;
}

const feedbackByQuestion = [
	'Յուրաքանչյուր ուղևորություն ազդեցություն ունի։ Քայլելը, հեծանիվն ու հանրային տրանսպորտը սովորաբար ամենք�[...]
	'Տան էներգիայի ընտրությունները գումարվում են։ Վերականգնվող էլեկտրաէներգիան և արդյունավետ ջեռուցումը ժաման[...]
	'Սնունդը կապում է կլիման, հողն ու ջուրը։ Ավելի շատ բուսական սնունդը ազդեցությունը նվազեցնելու գործնական միջ�[...]
	'Ավելի քիչ գնելն ու օգտագործված իրեր ընտրելը երկարացնում են նյութերի կյանքը և նվազեցնում նոր ապրանքների արտ�[...]
	'Ջուր խնայելով՝ խնայում ենք նաև այն մաքրելու, տաքացնելու և տուն հասցնելու էներգիան։',
	'Նորոգումը, կրկնակի օգտագործումն ու տեսակավորումը կանխում են թափոնները և արժեքավոր նյութերը պահել շրջանառ�[...]
	'Տեղական և սեզոնային մթերքը կարող է նվազեցնել փոխադրումը, փաթեթավորումն ու հեռավոր էկոհամակարգերի վրա ճնշու[...]
	'Թռիչքները կարճ ժամանակում մեծ հետք են թողնում։ Գնացք ընտրելը, տեսազանգեր օգտագործելը կամ ավելի քիչ ուղևորո�[...]
	'Ջերմամեկուսացումն ու արդյունավետ սարքերը տունն ավելի հարմարավետ են դարձնում և նվազեցնում անհրաժեշտ էներգի[...]
	'Կլիմայի համար գործելը սկսվում է հստակ հաջորդ քայլից։ Իրատեսական ծրագիրն ավելի օգտակար է, քան կատարյալ խոստո[...]
];

function selectAnswer() {
	const selected = questions[currentQuestion].querySelector('input:checked');
	if (!selected) return;
	nextButton.disabled = false;
	nextButton.innerHTML = currentQuestion === questions.length - 1 ? 'Տեսնել արդյունքը <span>→</span>' : 'Հաջորդ հարցը <span>→</span>';
	quizFeedback.className = 'quiz-feedback visible';
	quizFeedback.textContent = feedbackByQuestion[currentQuestion];
}

questions.forEach(question => question.addEventListener('change', selectAnswer));

document.querySelectorAll('.mini-quiz').forEach(quiz => {
	const result = quiz.querySelector('.mini-result');
	const miniQuestions = [...quiz.querySelectorAll('.mini-question')];
	const next = quiz.querySelector('.mini-next');
	const progress = quiz.querySelector('.mini-progress span');
	let miniIndex = 0;
	let miniScore = 0;
	let answered = false;
	let miniComplete = false;
	const showMiniQuestion = () => {
		miniQuestions.forEach((question, index) => question.classList.toggle('active-mini-question', index === miniIndex));
		progress.style.width = `${(miniIndex / miniQuestions.length) * 100}%`;
		next.disabled = true;
		next.innerHTML = 'Ընտրիր պատասխանը <span>→</span>';
		answered = false;
	};
	quiz.querySelectorAll('[data-answer]').forEach(option => option.addEventListener('click', () => {
		if (answered) return;
		answered = true;
		const isCorrect = option.dataset.answer === 'correct';
		if (isCorrect) miniScore += 1;
		quiz.querySelectorAll('.mini-question.active-mini-question [data-answer]').forEach(button => button.classList.remove('correct-answer', 'wrong-answer'));
		option.classList.add(isCorrect ? 'correct-answer' : 'wrong-answer');
		result.textContent = isCorrect ? 'Ճիշտ է։ Բացատրիր ընկերոջդ, թե ինչու է այս լուծումն օգտակար։' : 'Ոչ այնքան։ Կրկին կարդա տարբ�[...]
		next.disabled = false;
		next.innerHTML = miniIndex === miniQuestions.length - 1 ? 'Տեսնել միավորները <span>→</span>' : 'Հաջորդ հարցը <span>→</span>';
	}));
	next.addEventListener('click', () => {
		if (!answered) return;
		if (miniComplete) return;
		if (miniIndex < miniQuestions.length - 1) {
			miniIndex += 1;
			result.textContent = '';
			showMiniQuestion();
			return;
		}
		progress.style.width = '100%';
		result.textContent = `Քո միավորն է՝ ${miniScore} / ${miniQuestions.length}։ ${miniScore === miniQuestions.length ? 'Հիանալի աշխատանք։' : 'Միասին վերանայ[...]
		miniComplete = true;
		next.textContent = 'Փորձել կրկին';
		next.onclick = () => {
			miniIndex = 0;
			miniScore = 0;
			miniComplete = false;
			next.onclick = null;
			result.textContent = '';
			showMiniQuestion();
		};
	});
	showMiniQuestion();
});

startQuizButton.addEventListener('click', () => {
	quizStarted = true;
	quizIntro.classList.add('quiz-hidden');
	questions[0].classList.add('active-question');
	setQuizProgress(10);
	nextButton.disabled = true;
	nextButton.innerHTML = 'Ընտրիր պատասխանը <span>→</span>';
});

nextButton.addEventListener('click', () => {
	if (!quizStarted) return;
	const selected = questions[currentQuestion].querySelector('input:checked');
	if (!selected) {
		quizFeedback.className = 'quiz-feedback visible error';
		quizFeedback.textContent = 'Շարունակելու համար ընտրիր պատասխանը։';
		return;
	}
	footprint += Number(selected.value);
	if (currentQuestion < questions.length - 1) {
		currentQuestion += 1;
		questions.forEach((question, index) => question.classList.toggle('active-question', index === currentQuestion));
		setQuizProgress(((currentQuestion + 1) / questions.length) * 100);
		nextButton.disabled = true;
		nextButton.innerHTML = 'Ընտրիր պատասխանը <span>→</span>';
		quizFeedback.className = 'quiz-feedback';
		quizFeedback.textContent = '';
	} else {
		setQuizProgress(100);
		resultValue.textContent = footprint.toFixed(1);
		resultMessage.textContent = footprint <= 15 ? 'Հիանալի է։ Քո առօրյան արդեն ցածր ածխածնային հիմք ունի։' : footprint <= 25 ? 'Լավ սկիզբ է։ Կա�[...]
		resultTip.textContent = footprint > 25 ? 'Քննարկում դասարանում․ ո՞ր մեկ փոփոխությունը կարող է այս ամիս ամենից շատ նվազեցնել մ�[...]
		nextButton.textContent = 'Սկսել նորից';
		nextButton.disabled = false;
		quizFeedback.className = 'quiz-feedback visible success';
		quizFeedback.textContent = 'Թեստն ավարտված է։ Համեմատիր արդյունքդ դասընկերոջդ հետ և քննարկեք մեկ իրագործելի հաջորդ քայլ[...]
		nextButton.onclick = resetCalculator;
	}
});

function resetCalculator() {
	currentQuestion = 0;
	footprint = 0;
	document.querySelector('#footprint-form').reset();
	questions.forEach((question, index) => question.classList.toggle('active-question', index === 0));
	questions.forEach(question => question.classList.remove('active-question'));
	quizIntro.classList.remove('quiz-hidden');
	setQuizProgress(0);
	nextButton.innerHTML = 'Ընտրիր պատասխանը <span>→</span>';
	nextButton.disabled = true;
	nextButton.onclick = null;
	resultValue.textContent = '—';
	resultMessage.textContent = 'Ավարտիր թեստը՝ գնահատականը տեսնելու համար։';
	resultTip.textContent = 'Քո պատասխանները մնում են այս դիտարկիչում։ Օգտագործիր արդյունքը՝ քննարկում սկսելու համար։';
	quizFeedback.className = 'quiz-feedback';
	quizFeedback.textContent = '';
	quizStarted = false;
}

document.querySelector('#signup-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const status = document.querySelector('#form-status');
	if (!form.checkValidity()) {
		status.className = 'form-status error';
		status.textContent = 'Լրացրու անունդ և էլեկտրոնային փոստը, ինչպես նաև տուր համաձայնությունդ։';
		form.reportValidity();
		return;
	}
	status.className = 'form-status success';
	status.textContent = 'Դու գրանցված ես։ Բարի գալուստ մեր նախաձեռնություն։';
	form.reset();
});
