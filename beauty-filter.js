/* =========================================================
   CHUK AN CHUKK
   BEAUTY FILTER ENGINE V1
   =========================================================
   Khusus efek beauty.
   Tidak mengatur:
   - kamera
   - mirror
   - zoom
   - crop
   - microphone
   ========================================================= */

"use strict";

window.ChukBeauty = (() => {

    const state = {
        enabled: true,

        smooth: 35,
        glow: 20,
        brightness: 10,
        contrast: 5,
        saturation: 5,
        warmth: 0,
        detail: 20
    };

    /* =========================
       SET VALUE
    ========================= */

    function set(name, value) {
        if (!(name in state)) return;

        value = Number(value);

        if (!Number.isFinite(value)) return;

        state[name] = value;
    }

    /* =========================
       GET VALUE
    ========================= */

    function get(name) {
        return state[name];
    }

    /* =========================
       ENABLE / DISABLE
    ========================= */

    function enable() {
        state.enabled = true;
    }

    function disable() {
        state.enabled = false;
    }

    function toggle() {
        state.enabled = !state.enabled;
        return state.enabled;
    }

    /* =========================
       PRESETS
    ========================= */

    function natural() {

        Object.assign(state, {
            enabled: true,
            smooth: 25,
            glow: 12,
            brightness: 5,
            contrast: 4,
            saturation: 3,
            warmth: 2,
            detail: 25
        });

        return getState();
    }

    function beauty() {

        Object.assign(state, {
            enabled: true,
            smooth: 45,
            glow: 20,
            brightness: 10,
            contrast: 5,
            saturation: 7,
            warmth: 3,
            detail: 18
        });

        return getState();
    }

    function dream() {

        Object.assign(state, {
            enabled: true,
            smooth: 60,
            glow: 35,
            brightness: 18,
            contrast: 3,
            saturation: 8,
            warmth: 5,
            detail: 12
        });

        return getState();
    }

    function reset() {

        Object.assign(state, {
            enabled: true,
            smooth: 0,
            glow: 0,
            brightness: 0,
            contrast: 0,
            saturation: 0,
            warmth: 0,
            detail: 100
        });

        return getState();
    }

    /* =========================
       CSS FILTER STRING
    ========================= */

    function getCSSFilter() {

        if (!state.enabled) {
            return "none";
        }

        const brightness =
            100 + state.brightness;

        const contrast =
            100 + state.contrast;

        const saturation =
            100 + state.saturation;

        /*
         * Smooth dibuat sangat kecil
         * supaya wajah tidak terlihat
         * seperti plastik.
         */

        const blur =
            Math.min(
                state.smooth * 0.012,
                0.8
            );

        return [
            `brightness(${brightness}%)`,
            `contrast(${contrast}%)`,
            `saturate(${saturation}%)`,
            `blur(${blur}px)`
        ].join(" ");
    }

    /* =========================
       CANVAS FILTER
    ========================= */

    function apply(ctx) {

        if (!ctx) return;

        ctx.filter =
            getCSSFilter();
    }

    /* =========================
       GLOW
    ========================= */

    function drawGlow(
        ctx,
        x,
        y,
        width,
        height
    ) {

        if (!ctx || !state.enabled) return;

        if (state.glow <= 0) return;

        const alpha =
            Math.min(
                state.glow / 100 * 0.08,
                0.08
            );

        ctx.save();

        ctx.fillStyle =
            `rgba(255,255,255,${alpha})`;

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.restore();
    }

    /* =========================
       WARM TONE
    ========================= */

    function drawWarmth(
        ctx,
        x,
        y,
        width,
        height
    ) {

        if (!ctx || !state.enabled) return;

        if (state.warmth <= 0) return;

        const alpha =
            Math.min(
                state.warmth / 100 * 0.06,
                0.06
            );

        ctx.save();

        ctx.fillStyle =
            `rgba(255,190,120,${alpha})`;

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.restore();
    }

    /* =========================
       BEAUTY EFFECT
    ========================= */

    function render(
        ctx,
        x,
        y,
        width,
        height
    ) {

        if (!ctx) return;

        drawGlow(
            ctx,
            x,
            y,
            width,
            height
        );

        drawWarmth(
            ctx,
            x,
            y,
            width,
            height
        );
    }

    /* =========================
       STATE
    ========================= */

    function getState() {
        return {
            ...state
        };
    }

    /* =========================
       PUBLIC API
    ========================= */

    return {
        state,
        set,
        get,
        enable,
        disable,
        toggle,
        natural,
        beauty,
        dream,
        reset,
        apply,
        render,
        getCSSFilter,
        getState
    };

})();
