/* =========================================================
   CHUK AN CHUKK
   BEAUTY FILTER V5 — ULTRA LIGHT
   Fokus:
   - Kamera tetap smooth
   - Beauty full-frame
   - Tidak melakukan blur/masking berat setiap frame
   - Tetap kompatibel dengan live.js
   ========================================================= */

(function () {
    "use strict";

    console.log("✨ CHUK BEAUTY FILTER V5 — LOADING");

    /* =====================================================
       STATE
       ===================================================== */

    const state = {
        enabled: true,

        smooth: 45,
        brightness: 18,
        glow: 18,
        warmth: 4,
        detail: 22,

        faceDetected: false,
        bodyDetected: false
    };

    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, Number(value) || 0));
    }

    /* =====================================================
       SET
       ===================================================== */

    function set(name, value) {

        if (!(name in state)) {
            console.warn("⚠️ Beauty property tidak ditemukan:", name);
            return;
        }

        switch (name) {

            case "smooth":
            case "brightness":
            case "glow":
            case "warmth":
            case "detail":

                state[name] = clamp(value, 0, 100);
                break;

            case "enabled":

                state.enabled = Boolean(value);
                break;

            default:

                state[name] = value;
        }
    }

    /* =====================================================
       GET
       ===================================================== */

    function get(name) {
        return state[name];
    }

    /* =====================================================
       ENABLE / DISABLE
       ===================================================== */

    function enable() {
        state.enabled = true;
        console.log("✨ Beauty ON");
    }

    function disable() {
        state.enabled = false;
        console.log("✨ Beauty OFF");
    }

    function toggle() {
        state.enabled = !state.enabled;

        console.log(
            state.enabled
                ? "✨ Beauty ON"
                : "✨ Beauty OFF"
        );

        return state.enabled;
    }

    /* =====================================================
       PRESETS
       ===================================================== */

    function reset() {

        state.enabled = true;
        state.smooth = 45;
        state.brightness = 18;
        state.glow = 18;
        state.warmth = 4;
        state.detail = 22;

        console.log("✨ Beauty RESET");
    }

    function natural() {

        state.enabled = true;
        state.smooth = 25;
        state.brightness = 8;
        state.glow = 8;
        state.warmth = 2;
        state.detail = 15;

        console.log("🌿 Natural preset");
    }

    function beauty() {

        state.enabled = true;
        state.smooth = 50;
        state.brightness = 15;
        state.glow = 20;
        state.warmth = 5;
        state.detail = 20;

        console.log("💎 Beauty preset");
    }

    function dream() {

        state.enabled = true;
        state.smooth = 65;
        state.brightness = 20;
        state.glow = 35;
        state.warmth = 8;
        state.detail = 15;

        console.log("✨ Dream preset");
    }

    /* =====================================================
       LIGHTWEIGHT CSS FILTER
       ===================================================== */

    function getCSSFilter() {

        if (!state.enabled) {
            return "none";
        }

        /*
         * Tidak memakai blur().
         * Blur pada setiap frame menyebabkan kamera patah-patah
         * terutama di HP.
         */

        const brightness =
            1 + (state.brightness / 100) * 0.35;

        const saturation =
            1 + (state.smooth / 100) * 0.12;

        const contrast =
            1 - (state.detail / 100) * 0.06;

        return [
            `brightness(${brightness})`,
            `saturate(${saturation})`,
            `contrast(${contrast})`
        ].join(" ");
    }

    /* =====================================================
       OPTIONAL AI API
       ===================================================== */

    /*
     * API ini tetap disediakan agar live.js lama tidak error.
     *
     * V5 TIDAK menjalankan ImageSegmenter setiap frame.
     * Prioritas utama adalah smooth camera.
     */

    function getPersonMask(video, timestamp) {

        /*
         * Sengaja tidak menjalankan segmentation di sini.
         * MediaPipe segmentation adalah salah satu sumber
         * beban CPU/GPU terbesar.
         */

        return null;
    }

    function buildBodyMask(
        categoryMask,
        width,
        height
    ) {

        state.bodyDetected = false;

        return false;
    }

    function updateBodyMask(
        video,
        timestamp,
        width,
        height
    ) {

        /*
         * Disabled pada V5 Ultra Light.
         * Kamera akan jauh lebih ringan.
         */

        state.bodyDetected = false;

        return false;
    }

    /* =====================================================
       LEGACY FUNCTIONS
       ===================================================== */

    function applyBodyBeauty() {
        return false;
    }

    function applyBodyLight() {
        return false;
    }

    function applyBodyGlow() {
        return false;
    }

    function createFaceMask() {
        return null;
    }

    function applyFaceSmooth() {
        return false;
    }

    function applyFaceGlow() {
        return false;
    }

    /* =====================================================
       MAIN APPLY
       ===================================================== */

    function apply(
        ctx,
        sourceCanvas,
        landmarks,
        width,
        height
    ) {

        /*
         * Beauty utama sekarang dilakukan melalui
         * ctx.filter = getCSSFilter()
         *
         * Jadi fungsi ini sengaja ringan.
         *
         * Jangan melakukan blur/mask setiap frame di sini.
         */

        if (!state.enabled) {
            return;
        }

        /*
         * Sedikit warm glow menggunakan overlay sederhana.
         * Sangat ringan dibanding Gaussian blur.
         */

        if (
            ctx &&
            width &&
            height &&
            state.glow > 0
        ) {

            ctx.save();

            const alpha =
                (state.glow / 100) * 0.035;

            ctx.globalAlpha = alpha;

            ctx.fillStyle =
                state.warmth > 5
                    ? "#ffd9a0"
                    : "#fff4dc";

            ctx.fillRect(
                0,
                0,
                width,
                height
            );

            ctx.restore();
        }
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.ChukBeauty = {

        state,

        set,
        get,

        enable,
        disable,
        toggle,

        reset,
        natural,
        beauty,
        dream,

        getCSSFilter,

        getPersonMask,
        buildBodyMask,
        updateBodyMask,

        applyBodyBeauty,
        applyBodyLight,
        applyBodyGlow,

        createFaceMask,
        applyFaceSmooth,
        applyFaceGlow,

        apply
    };

    console.log(
        "✅ CHUK BEAUTY FILTER V5 — READY"
    );

})();
