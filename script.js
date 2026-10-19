const views = document.querySelectorAll('.page-view');
const navLinks = document.querySelectorAll('[data-route]');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const topicModal = document.querySelector('#topic-modal');
const topicCards = document.querySelectorAll('.issue-card');
const topicContent = {
	climate: {
		number: '01 / ԿԼԻՄԱ',
		title: 'Կլիմա և հնավայրեր',
		description: 'Կլիմայական պայմանները ազդել են այնպիսի գործունեությունների վրա, ինչպիսիք են հողագործությունն ու բնակության տեղորոշումը։',
		detail: 'Ինչպես ��ործել',
		body: 'Կլիման ձևավորել է մարդկանց որոշումները՝ բնակություն ընտրելու, crops աճեցնելու և ջրային համակարգեր ստեղծելու առումով։'
	},
	forest: {
		number: '02 / ԱՆՏԱՌՆԵՐ',
		title: 'Ինչպես օգտագործել անտառները',
		description: 'Անտառները էին տրամադրում վառելիք, շինանյութ և սնունդ՝ հատկապես փոքր համայնքներում։',
		detail: 'Պահպանության օրինակներ',
		body: 'Հայտնի է, որ տեղական բնակչություններն օգտագործել են անտառային ռեսուրսները, բայց երբեմն՝ ավելորդ հատումների պատճառով կարող էին փոխել տեղանքը։'
	},
	ocean: {
		number: '03 / ՋՐԱՏԱՐԱԾՔՆԵՐ',
		title: 'Ջուրն ու հնավայրերը',
		description: 'Գետերը և լճերը հաճախ որոշում են, որտեղ են հիմք առնում settlements-ները։',
		detail: 'Ջրի ճիշտ կառավարման քայլեր',
		body: 'Ջրի մոտ գտնվող հնավայրերը ունեն հարուստ պատմական ապրելակարգ՝ մոտակա ջրի օգտագործմամբ։'
	}
};

function openTopic(topic) {
	const content = topicContent[topic];
	if (!content) return;
	document.querySelector('#topic-number').textContent = content.number;
	document.querySelector('#topic-title').textContent = content.title;
	document.querySelector('#topic-description').textContent = content.description;
	document.querySelector('#topic-detail').innerHTML = `<strong>${content.detail}</strong><p>${content.body}</p>`;
	document.querySelector('#topic-sections').innerHTML = `<h3>Ուշադրության կենտրոնում</h3><ul><li>Պատմական և բնապահպանական կապ</li><li>Պահպանման պարզ քայլեր</li></ul>`;
	document.querySelector('#topic-image').style.backgroundImage = `url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80")`;
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

if (topicCards) {
	topicCards.forEach(card => {
		card.addEventListener('click', () => openTopic(card.dataset.topic));
	});
}

topicModal.addEventListener('click', event => {
	if (event.target.matches('[data-close-modal]') || event.target.matches('.modal-close')) closeTopic();
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
	if (!progressFill) return;
	progressFill.style.width = `${percent}%`;
}

const feedbackByQuestion = [
	'Ջուրը կարևոր ռեսուրս է. մտածիր, թե ինչպես է այն ունեցել նշանակություն հնավայրէրում։',
	'Սնունդը կապում էր մարդկանց բնության հետ՝ հողագործություն, որս և դաշտային աշխատանքներ։',
	'Վառելիքը ազդում էր անտառների վրա․ մտածիր՝ ինչ ազդեցություն ունի այսպես օգտագործումը։',
	'Շինարարությունն ու նյութերի ընտրությունը փոխում էին տեղանքը։',
	'Վերականգնումը կարող է լինել դանդաղ՝ կախված վնասի չափից։',
	'Բույսերն ու կենդանիները ապահովում էին սնունդ և նյութեր․ գնահատիր նրանց դերը։',
	'Ուսումնասիրելիս միշտ պահպանիր վայրի կանոնները՝ չաղտոտել և չվնասել։',
	'Ուսումնասիրելիս ընտրիր այն քայլերը, որոնք չեն վնասի բույսերին և հողի կառուցվածքին։',
	'Այսպիսի նախագծերը օգնում են կապել պատմությունը և բնական գիտությունները։',
	'Սովորելը միայն սկզբն է․ դերակատարն ես դու՝ կիրառիր՝ վերանայելու և պաշտպանելու համար։'
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
		resultMessage.textContent = footprint <= 20 ? 'Թեստը ցույց է տալիս, որ անցած համայնքները համեմատաբար քիչ ազդեցություն են ունեցել.' : footprint <= 35 ? 'Միջին ազդեցություն՝ կան նշաններ, որտեղ պետք է զգույշ լինել.' : 'Բարձր ազդեցություն՝ կարիք կա վերականգնման և նոր մոտեցումների.';
		resultTip.textContent = footprint > 35 ? 'Ելք՝ քննարկել, թե ինչ հնավայրերի մոտ կարելի է սկսել վերականգնումը։' : 'Կողմնորոշող քայլ՝ դասարանում պատրաստել առաջարկներ պահպանման համար։';
		nextButton.textContent = 'Սկսել նորից';
		nextButton.disabled = false;
		quizFeedback.className = 'quiz-feedback visible success';
		quizFeedback.textContent = 'Թեստն ավարտված է։ Քննարկեք արդյունքները դասարանում։';
		nextButton.onclick = resetCalculator;
	}
});

function resetCalculator() {
	currentQuestion = 0;
	footprint = 0;
	document.querySelector('#footprint-form').reset();
	questions.forEach((question, index) => question.classList.toggle('active-question', index === 0));
	quizIntro.classList.remove('quiz-hidden');
	setQuizProgress(0);
	nextButton.innerHTML = 'Ընտրիր պատասխանը <span>→</span>';
	nextButton.disabled = true;
	nextButton.onclick = null;
	resultValue.textContent = '—';
	resultMessage.textContent = 'Ավարտիր թեստը՝ գնահատականը տեսնելու համար։';
	resultTip.textContent = 'Արդյունքները պահվում են միայն այս դիտարկիչում։';
	quizFeedback.className = 'quiz-feedback';
	quizFeedback.textContent = '';
	quizStarted = false;
}

const signup = document.querySelector('#signup-form');
if (signup) {
	signup.addEventListener('submit', event => {
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
		status.textContent = 'Դու գրանցված ես։ Շնորհակալություն։';
		form.reset();
	});
}
