// Valentine app interactions
(() => {
	const intro = document.getElementById('intro');
	const ask = document.getElementById('ask');
	const overlay = document.getElementById('overlay');
	const heartsRoot = document.getElementById('hearts');

	const nameInput = document.getElementById('name-input');
	const startBtn = document.getElementById('start-button');
	const yesBtn = document.getElementById('yes-button');
	const noBtn = document.getElementById('no-button');
	const greeting = document.getElementById('greeting');
	const resultTitle = document.getElementById('result-title');
	const resultText = document.getElementById('result-text');
	const resultEmoji = document.getElementById('result-emoji');
	const restart = document.getElementById('restart');

	let name = '';
	let evadeCount = 0;

	startBtn.addEventListener('click', () => {
		const raw = nameInput.value.trim();
		if (!raw) {
			nameInput.focus();
			nameInput.classList.add('pulse');
			setTimeout(() => nameInput.classList.remove('pulse'), 420);
			return;
		}
		name = raw;
		greeting.textContent = `Hey ${name} —`; // personalize
		intro.classList.add('hidden');
		ask.classList.remove('hidden');
		// move focus to yes for keyboard users
		yesBtn.focus();
	});

	// Yes handler — show romantic overlay and hearts
	yesBtn.addEventListener('click', () => {
		yesBtn.classList.add('pulse');
		setTimeout(() => yesBtn.classList.remove('pulse'), 420);
		showResult(true);
		sprinkleHearts(28);
	});

	// No is evasive: it moves to a random spot within the container on mouseenter
	noBtn.addEventListener('mouseenter', (e) => {
		evadeCount++;
		const container = document.querySelector('#ask .container');
		const rect = container.getBoundingClientRect();
		// compute random position inside rect but keep button visible
		const btnW = noBtn.offsetWidth;
		const btnH = noBtn.offsetHeight;
		const padding = 12;
		const maxX = Math.max(0, rect.width - btnW - padding);
		const maxY = Math.max(0, rect.height - btnH - padding);
		const x = Math.floor(Math.random() * maxX) + rect.left + padding;
		const y = Math.floor(Math.random() * maxY) + rect.top + padding;

		// position fixed relative to viewport to make it feel playful
		noBtn.style.position = 'fixed';
		noBtn.style.left = `${Math.min(window.innerWidth - btnW - 8, x)}px`;
		noBtn.style.top = `${Math.min(window.innerHeight - btnH - 8, y)}px`;

		// after a few evasions, gently stop avoiding and let click happen
		if (evadeCount > 6) {
			noBtn.removeEventListener('mouseenter', arguments.callee);
			noBtn.textContent = "...okay maybe?";
		}
	});

	// If the user clicks No, run a romantic persuasion sequence and then auto-accept (Yes)
	noBtn.addEventListener('click', () => {
		// lines to persuade — short romantic lines
		const lines = [
			`${name}, your smile is my favorite sight.`,
			`Every moment with you feels like a favorite song.`,
			`If I had one wish, it would be to hold your hand forever.`,
			`Say yes and let's make our story the sweetest one. 💞`
		];

		// temporarily disable the No button so user can't spam it
		noBtn.disabled = true;
		noBtn.style.pointerEvents = 'none';
		noBtn.textContent = '...listening';

		persuadeThenAccept(lines, 2000);
	});

	restart.addEventListener('click', () => {
		overlay.classList.add('hidden');
		intro.classList.remove('hidden');
		ask.classList.add('hidden');
		nameInput.value = '';
		nameInput.focus();
		// reset no button position
		noBtn.style.position = '';
		noBtn.style.left = '';
		noBtn.style.top = '';
		noBtn.textContent = 'No';
		evadeCount = 0;
	});

	// Persuasion UI: show lines one-by-one and then trigger acceptance
	function persuadeThenAccept(lines = [], interval = 1500) {
		// create card
		const card = document.createElement('div');
		card.className = 'persuade-card';
		const lineEl = document.createElement('div');
		lineEl.className = 'persuade-line';
		card.appendChild(lineEl);
		document.body.appendChild(card);

		let i = 0;
		const t = setInterval(() => {
			lineEl.textContent = lines[i] || '';
			lineEl.classList.remove('visible');
			// force reflow to restart animation
			void lineEl.offsetWidth;
			lineEl.classList.add('visible');
			i++;
			if (i >= lines.length) {
				clearInterval(t);
				// after a short pause, remove card and trigger Yes
				setTimeout(() => {
					card.classList.add('fade-out');
					setTimeout(() => card.remove(), 420);
					// restore no button state
					noBtn.disabled = false;
					noBtn.style.pointerEvents = '';
					noBtn.textContent = 'No';
					// programmatically accept
					yesBtn.click();
				}, 900);
			}
		}, interval);
	}

	function showResult(accepted) {
		overlay.classList.remove('hidden');
		if (accepted) {
			resultEmoji.textContent = '💘';
			resultTitle.textContent = `Yes, ${name}!`;
			resultText.textContent = `You just made my heart so happy. Let's make every day special together.`;
		} else {
			resultEmoji.textContent = '🤍';
			resultTitle.textContent = `That's okay, ${name}`;
			resultText.textContent = `No pressure — I'll still think you're wonderful. If you change your mind, I'm right here.`;
		}
	}

	// create floating heart elements that animate up and fade
	function sprinkleHearts(count = 12) {
		for (let i = 0; i < count; i++) {
			const heart = document.createElement('div');
			heart.className = 'heart';
			heart.textContent = (Math.random() > 0.5) ? '💖' : '💕';
			// random horizontal start
			const startX = Math.random() * window.innerWidth;
			const startY = window.innerHeight - 40 + (Math.random() * 20);
			heart.style.left = `${startX}px`;
			heart.style.top = `${startY}px`;
			heart.style.fontSize = `${12 + Math.floor(Math.random() * 28)}px`;
			heart.style.opacity = `${0.9 - Math.random() * 0.4}`;
			// slight delay for wave effect
			heart.style.animationDelay = `${Math.random() * 600}ms`;

			heartsRoot.appendChild(heart);
			// cleanup after animation
			setTimeout(() => {
				heart.remove();
			}, 3800);
		}
	}

	// allow Enter key to submit name
	nameInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') startBtn.click();
	});

	// small accessibility helper: focus start field on load
	window.addEventListener('load', () => {
		nameInput.focus();
	});
})();
