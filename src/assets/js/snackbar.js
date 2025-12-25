// @ts-check

/**
 * @typedef SnackbarOption
 * @property {number | undefined} duration Duration in milliseconds
 * @property {boolean | undefined} allowClose Whether to show a close button
 */

/**
 * @returns {Animation}
 */
export const hideSnackbar = ( /** @type {HTMLDivElement} */ self, /** @type {number} */ delay) => {
    /** 
     * @type {{ keyframes: Keyframe[]; options: KeyframeAnimationOptions; }}
     */
    const animation = {
        keyframes: [
            { bottom: `${self.clientHeight * -1}px` }
        ],
        options: {
            duration: 300,
            delay: delay,
            easing: "ease-in",
            fill: "both",
        }
    };
    const anime = self.animate(animation.keyframes, animation.options);
    anime.addEventListener("finish", () => {
        self.style.display = "none";
    });
    return anime;
};

export const showSnackbar = (/** @type {string} */ message, /** @type {SnackbarOption} */ option = { duration: undefined, allowClose: undefined }) => {
    const snackbar = /** @type {HTMLDivElement} */  (document.getElementById("snackbarBox"));
    const snackbarMessage = /** @type {HTMLSpanElement} */ (document.getElementById("snackbarMessage"));
    snackbarMessage.textContent = message;
    snackbar.style.display = "flex";
    for (const ani of snackbar.getAnimations()) {
        ani.cancel();
    }
    snackbar.animate([
        { bottom: `${snackbar.clientHeight * -1}px` },
        { bottom: "1rem" }
    ], {
        duration: 300,
        easing: "ease-out",
        fill: "forwards"
    });
    const hideDelay = option?.duration ?? 5000;
    hideSnackbar(snackbar, hideDelay);

    const closeButton = /** @type {HTMLButtonElement} */ (document.getElementById("snackbarCloseButton"));
    if (option?.allowClose !== false) {
        closeButton.style.display = "inline-block";
    } else {
        closeButton.style.display = "none";
    }
};

window.addEventListener("DOMContentLoaded", () => {
    const closeButton = /** @type {HTMLButtonElement} */ (document.getElementById("snackbarCloseButton"));
    const snackbar = /** @type {HTMLDivElement} */ (document.getElementById("snackbarBox"));
    closeButton.addEventListener("click", () => {
        hideSnackbar(snackbar, 0);
    });

    const pause = () => {
        for (const anime of snackbar.getAnimations()) {
            if (anime.playState === "running") {
                anime.pause();
            }
        }
    };
    const play = () => {
        for (const anime of snackbar.getAnimations()) {
            if (anime.playState === "paused") {
                anime.play();
            }
        }
    };

    snackbar.addEventListener("mouseenter", () => {
        pause();
    });
    snackbar.addEventListener("focusin", () => {
        pause();
    });
    snackbar.addEventListener("mouseleave", () => {
        if (!snackbar.matches(":focus-within")) {
            play();
        }
    });
    snackbar.addEventListener("focusout", () => {
        if (!snackbar.matches(":focus-within") && !snackbar.matches(":hover")) {
            play();
        }
    });
});
