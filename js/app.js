document.addEventListener('DOMContentLoaded', function() {
    const yesButton = document.getElementById('yes-button');
    const noButton = document.getElementById('no-button');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (!yesButton || !noButton || !modal) return;

    // make No absolute so it stays within the .container element
    const container = document.querySelector('.container');
    if (!container) return;
    noButton.style.position = 'absolute';
    noButton.style.transition = 'left 0.18s ease, top 0.18s ease, transform 0.12s ease';
    noButton.style.zIndex = '3';
    noButton.style.pointerEvents = 'auto';

    const padding = 12;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const placeInitial = () => {
        const yesRect = yesButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // measure Yes and compute a target size for No (match Yes)
        const targetW = Math.max(Math.round(yesRect.width), 56); // fallback min width
        const targetH = Math.max(Math.round(yesRect.height), 36); // fallback min height

        // ensure the No button will fit in the viewport; if not, shrink it
        const maxAllowedW = Math.max(24, window.innerWidth - (padding * 2));
        const maxAllowedH = Math.max(20, window.innerHeight - (padding * 2));
        const finalW = Math.min(targetW, maxAllowedW);
        const finalH = Math.min(targetH, maxAllowedH);


        noButton.style.width = `${finalW}px`;
        noButton.style.height = `${finalH}px`;
        noButton.style.lineHeight = `${finalH}px`;

        // read actual rendered size (includes borders/padding) and adjust if needed
        let actualW = noButton.offsetWidth;
        let actualH = noButton.offsetHeight;
        // if the rendered size is still too large for viewport, shrink it to fit
        if (actualW > window.innerWidth - padding * 2) {
            actualW = window.innerWidth - padding * 2;
            noButton.style.width = `${actualW}px`;
        }
        if (actualH > window.innerHeight - padding * 2) {
            actualH = window.innerHeight - padding * 2;
            noButton.style.height = `${actualH}px`;
            noButton.style.lineHeight = `${actualH}px`;
        }

    // compute left so centered with Yes, and top directly above Yes using actual sizes
    // convert to coordinates relative to the container (because No is absolute inside it)
    let left = (yesRect.left - containerRect.left) + (yesRect.width - actualW) / 2;
    let top = (yesRect.top - containerRect.top) - actualH - 8; // 8px gap above yes

        // if not enough space above, put below yes
        if (top < padding) {
            // place below yes (relative to container)
            top = (yesRect.bottom - containerRect.top) + 8;
        }

        // clamp into container bounds
        left = clamp(left, padding, containerRect.width - actualW - padding);
        top = clamp(top, padding, containerRect.height - actualH - padding);

        noButton.style.left = `${left}px`;
        noButton.style.top = `${top}px`;
    };

    // small delay to allow layout to finish and fonts to load
    setTimeout(placeInitial, 60);
    window.addEventListener('resize', () => {
        // on resize, recalc size & position relative to Yes
        placeInitial();
    });

    const moveAway = (ev) => {
        const containerRect = container.getBoundingClientRect();
        const noW = noButton.offsetWidth;
        const noH = noButton.offsetHeight;
        // compute allowed min/max positions for left/top inside container coordinates
        const minX = padding;
        const minY = padding;
        const maxX = Math.max(minX, containerRect.width - noW - padding);
        const maxY = Math.max(minY, containerRect.height - noH - padding);
        const yesRect = yesButton.getBoundingClientRect();

        let x, y, attempts = 0;
        do {
            // biased away from cursor: prefer corners
            const corner = Math.random() > 0.6;
            if (corner) {
                x = Math.random() > 0.5 ? maxX : minX;
                y = Math.random() > 0.5 ? maxY : minY;
            } else {
                x = (Math.random() * (maxX - minX)) + minX;
                y = (Math.random() * (maxY - minY)) + minY;
            }
            attempts++;
            // avoid overlapping yes area
            const overlapX = (x < yesRect.right && (x + noW) > yesRect.left);
            const overlapY = (y < yesRect.bottom && (y + noH) > yesRect.top);
            if (!(overlapX && overlapY) || attempts > 30) break;
        } while (attempts < 60);

    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);

    // set position relative to container (No is absolute inside container)
    noButton.style.left = `${x}px`;
    noButton.style.top = `${y}px`;
        noButton.style.transform = 'translateY(-4px)';
        setTimeout(() => { noButton.style.transform = ''; }, 160);
    };

    noButton.addEventListener('mouseover', moveAway);
    // remove mousemove to avoid jitter on small screens; keep hover/focus
    noButton.addEventListener('focus', moveAway);

    noButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        noButton.style.transform = 'scale(0.98)';
        setTimeout(() => noButton.style.transform = '', 120);
    });

    // Modal control
    const openModal = () => {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => modalOk && modalOk.focus(), 60);
    };
    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        yesButton.focus();
    };

    yesButton.addEventListener('click', openModal);
    modalClose && modalClose.addEventListener('click', closeModal);
    modalOk && modalOk.addEventListener('click', closeModal);
    modalBackdrop && modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    // safety: clamp if viewport changes after moves
    window.addEventListener('resize', () => {
        const left = parseFloat(noButton.style.left) || 0;
        const top = parseFloat(noButton.style.top) || 0;
        const maxX = Math.max(padding, window.innerWidth - noButton.offsetWidth - padding);
        const maxY = Math.max(padding, window.innerHeight - noButton.offsetHeight - padding);
        if (left > maxX) noButton.style.left = `${maxX}px`;
        if (top > maxY) noButton.style.top = `${maxY}px`;
    });
});