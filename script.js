/* =========================================================
   AMITKUMAR PANDEY
   HERO — THz DRIVEN SPIN PRECESSION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("spinCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width;
    let height;
    let dpr;

    let time = 0;

    let spins = [];

    let pulseX = -300;

    let pulseSpeed = 2.8;

    let pulseActive = true;


    /* =====================================================
       RESIZE
    ====================================================== */

    function resizeCanvas() {

        dpr = window.devicePixelRatio || 1;

        width = canvas.clientWidth;
        height = canvas.clientHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        createSpins();
    }


    /* =====================================================
       CREATE SPINS
    ====================================================== */

    function createSpins() {

        spins = [];

        /*
         * The spins occupy the right side of the Hero.
         */

        const startX = width * 0.22;
        const endX   = width * 0.62;

        const startY = height * 0.25;

        const columns = 11;
        const rows = 1;

        const spacingX =
            (endX - startX) / (columns - 1);

        const spacingY = 85;


        for (let row = 0; row < rows; row++) {

            for (let col = 0; col < columns; col++) {

                const x =
                    startX +
                    col * spacingX +
                    (row % 2) * 15;

                const y =
                    startY +
                    (row - 1) * spacingY;

                spins.push({

                    x: x,

                    y: y,

                    /*
                     * Alternating up/down initial orientation.
                     */

                    direction:
                        (row + col) % 2 === 0
                            ? 1
                            : -1,

                    /*
                     * Current excitation.
                     */

                    excitation: 0,

                    /*
                     * Phase of precession.
                     */

                    phase:
                        Math.random() * Math.PI * 2,

                    /*
                     * Slightly different precession
                     * frequencies.
                     */

                    frequency:
                        0.035 +
                        Math.random() * 0.018,

                    /*
                     * Maximum cone angle.
                     */

                    maxAngle:
                        0.65 +
                        Math.random() * 0.2,

                    /*
                     * Individual delay.
                     */

                    delay:
                        Math.random() * 0.12

                });
            }
        }
    }


    /* =====================================================
       DRAW ARROW
    ====================================================== */

    function drawArrow(
        x,
        y,
        angle,
        length,
        alpha,
        scale = 1
    ) {

        ctx.save();

        ctx.translate(x, y);

        ctx.rotate(angle);

        /*
         * Glow
         */

        ctx.shadowBlur = 15 * scale;

        ctx.shadowColor =
            "rgba(80,150,255,0.8)";

        /*
         * Arrow shaft
         */

        ctx.beginPath();

        ctx.moveTo(0, length * 0.45);

        ctx.lineTo(0, -length * 0.42);

        ctx.strokeStyle =
            `rgba(90,165,255,${alpha})`;

        ctx.lineWidth = 2.2 * scale;

        ctx.stroke();


        /*
         * Arrow head
         */

        ctx.beginPath();

        ctx.moveTo(0, -length * 0.52);

        ctx.lineTo(
            -6 * scale,
            -length * 0.32
        );

        ctx.lineTo(
            6 * scale,
            -length * 0.32
        );

        ctx.closePath();

        ctx.fillStyle =
            `rgba(90,165,255,${alpha})`;

        ctx.fill();


        ctx.restore();
    }


    /* =====================================================
       DRAW PRECESSION TRAIL
    ====================================================== */

    function drawPrecessionTrail(spin) {

        if (spin.excitation < 0.05) return;

        ctx.save();

        ctx.translate(
            spin.x,
            spin.y
        );

        ctx.rotate(
            spin.phase * 0.25
        );


        const radius =
            28 * spin.excitation;


        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            radius,
            radius * 0.35,
            0,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(60,150,255,${
                0.28 * spin.excitation
            })`;

        ctx.lineWidth = 1;

        ctx.shadowBlur = 10;

        ctx.shadowColor =
            "rgba(50,130,255,0.6)";

        ctx.stroke();

        ctx.restore();
    }


    /* =====================================================
       DRAW SPIN
    ====================================================== */

    function drawSpin(spin) {

        /*
         * The THz pulse excites the spin.
         */

        const distance =
            Math.abs(pulseX - spin.x);

        if (distance < 80) {

            spin.excitation += 0.035;

        }
        else {

            spin.excitation -= 0.004;

        }


        spin.excitation =
            Math.max(
                0,
                Math.min(
                    1,
                    spin.excitation
                )
            );


        /*
         * Precession phase.
         */

        spin.phase +=
            spin.frequency *
            (0.5 + spin.excitation);


        /*
         * Cone angle grows with excitation.
         */

        const coneAngle =
            spin.maxAngle *
            spin.excitation;


        /*
         * Horizontal component of the
         * precessing spin.
         */

        const horizontal =
            Math.sin(spin.phase) *
            coneAngle;


        /*
         * Convert to screen angle.
         *
         * direction = +1 -> up
         * direction = -1 -> down
         */

        const baseAngle =
            spin.direction === 1
                ? 0
                : Math.PI;


        const angle =
            baseAngle + horizontal;


        /*
         * Precession trail first.
         */

        drawPrecessionTrail(spin);


        /*
         * Draw spin.
         */

        const alpha =
            0.35 +
            spin.excitation * 0.65;


        const scale =
            0.8 +
            spin.excitation * 0.25;


        drawArrow(
            spin.x,
            spin.y,
            angle,
            58,
            alpha,
            scale
        );


        /*
         * Small magnetic center.
         */

        ctx.beginPath();

        ctx.arc(
            spin.x,
            spin.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(160,210,255,${alpha})`;

        ctx.shadowBlur = 12;

        ctx.shadowColor =
            "rgba(70,150,255,0.8)";

        ctx.fill();

    }


    /* =====================================================
       DRAW THz PULSE
    ====================================================== */

    function drawPulse() {

        const centerY =
            height * 0.25;


        /*
         * Pulse envelope.
         */

        ctx.save();

        ctx.lineWidth = 3;

        ctx.shadowBlur = 22;

        ctx.shadowColor =
            "rgba(60,150,255,0.8)";


        ctx.beginPath();


        const wavelength = 145;

        const amplitude = 42;


        for (
            let x = pulseX - 300;
            x < pulseX + 500;
            x += 3
        ) {

            const local =
                x - pulseX;

            const envelope =
                Math.exp(
                    -Math.pow(
                        local / 180,
                        2
                    )
                );

            const y =
                centerY +
                Math.sin(
                    local / wavelength *
                    Math.PI * 2
                ) *
                amplitude *
                envelope;

            if (
                x === pulseX - 300
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }
            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }


        ctx.strokeStyle =
            "rgba(100,180,255,0.85)";

        ctx.stroke();


        /*
         * Golden secondary component.
         */

        ctx.beginPath();


        for (
            let x = pulseX - 220;
            x < pulseX + 430;
            x += 3
        ) {

            const local =
                x - pulseX;

            const envelope =
                Math.exp(
                    -Math.pow(
                        local / 180,
                        2
                    )
                );

            const y =
                centerY +
                Math.sin(
                    local / wavelength *
                    Math.PI * 2 +
                    1.5
                ) *
                amplitude *
                0.38 *
                envelope;

            if (
                x === pulseX - 220
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }
            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }


        ctx.strokeStyle =
            "rgba(230,170,90,0.7)";

        ctx.stroke();


        /*
         * Pulse particles.
         */

        for (let i = 0; i < 20; i++) {

            const px =
                pulseX +
                (Math.random() - 0.5) *
                360;

            const envelope =
                Math.exp(
                    -Math.pow(
                        (px - pulseX) / 170,
                        2
                    )
                );

            const py =
                centerY +
                (Math.random() - 0.5) *
                100 *
                envelope;

            ctx.beginPath();

            ctx.arc(
                px,
                py,
                Math.random() * 1.5 + 0.4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(120,190,255,0.55)";

            ctx.fill();
        }


        ctx.restore();
    }


    /* =====================================================
       ANIMATION
    ====================================================== */

    function animate() {

        time += 1;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Move the THz pulse.
         */

        if (pulseActive) {

            pulseX += pulseSpeed;

            /*
             * Restart after leaving the screen.
             */

            if (pulseX > width + 350) {

                pulseX =
                    -350;

            }
        }


        /*
         * Draw pulse.
         */

        drawPulse();


        /*
         * Draw spins.
         */

        spins.forEach(
            drawSpin
        );


        requestAnimationFrame(
            animate
        );
    }


    /* =====================================================
       START
    ====================================================== */

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    resizeCanvas();

    animate();

});

/* =========================================================
   LIGHT / DARK MODE
========================================================= */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    // Restore previous preference
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        themeToggle.textContent = "☀";
    }


    // Toggle theme
    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        const isLight =
            document.body.classList.contains("light-mode");

        themeToggle.textContent = isLight ? "☀" : "◐";

        localStorage.setItem(
            "theme",
            isLight ? "light" : "dark"
        );

    });

}