/* ============================================================
   auth.js — S+Tutor.my Central Settings & Auth Module
   Included on every page. Handles:
   1. Night mode (applied before paint to avoid flash)
   2. Language preference (BM / EN)
   3. Auth state — STAuth (login / logout / getUser)
   4. Navbar dynamic rendering (auth buttons, active link)
   ============================================================ */

/* ── 1. NIGHT MODE — apply immediately to prevent FOUC ── */
(function () {
  if (localStorage.getItem("stutor_night") === "1") {
    document.documentElement.classList.add("night-mode");
    document.body && document.body.classList.add("night-mode");
  }
})();

/* ── 2. STAuth namespace ── */
const STAuth = {
  KEY: "stutor_user",

  getUser() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  saveUser(email, name) {
    localStorage.setItem(this.KEY, JSON.stringify({ email, name }));
  },

  logout() {
    localStorage.removeItem(this.KEY);
    window.location.href = "index.html";
  },

  /* Call this at top of pages that require login */
  requireAuth(redirectTo) {
    if (!this.getUser()) {
      const page = redirectTo || window.location.pathname.split("/").pop() || "index.html";
      window.location.href = `login.html?next=${encodeURIComponent(page)}`;
    }
  }
};

/* ── 3. Apply night mode class to <html> & <body> ── */
function applyNightMode() {
  const on = localStorage.getItem("stutor_night") === "1";
  document.documentElement.classList.toggle("night-mode", on);
  document.body.classList.toggle("night-mode", on);
}

/* ── 4. Navbar enhancement — runs after DOM is ready ── */
function enhanceNavbar() {
  const user = STAuth.getUser();

  /* ── 4a. Update side-menu footer: show user info or login/signup ── */
  const footer = document.querySelector(".side-menu-footer");
  if (footer) {
    if (user) {
      footer.innerHTML = `
        <div style="padding:0 0 8px;font-size:0.82rem;color:var(--muted);line-height:1.4">
          Logged in as<br>
          <strong style="color:var(--navy);font-size:0.9rem">${escapeHtml(user.name || user.email)}</strong>
        </div>
        <a href="settings.html" class="btn-login" style="text-decoration:none;text-align:center">⚙️ Settings</a>
        <button class="btn-logout-menu" onclick="STAuth.logout()">Log Out</button>`;
    } else {
      footer.innerHTML = `
        <a href="login.html" class="btn-login">Log In</a>
        <a href="signup.html" class="btn-signup-menu">Sign Up &mdash; It&#39;s Free</a>`;
    }
  }

  /* ── 4b. Mark active link based on current page ── */
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".side-menu-nav a, .nav-links a").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href === page) a.classList.add("active");
    else a.classList.remove("active");
  });
}

/* ── 5. Night mode: also fix SVG logo fill in navbar for night mode ── */
function fixNavLogoForNight() {
  const on = localStorage.getItem("stutor_night") === "1";
  /* SVG rects in logo use hardcoded #1a1a4e — override in night mode */
  document.querySelectorAll(".logo-icon svg rect").forEach(rect => {
    rect.style.fill = on ? "var(--navy)" : "";
  });
}

/* ── 6. Helper ── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── 7. Hamburger / side-menu — call once per page ── */
function initHamburger() {
  var btn     = document.getElementById("hamburgerBtn");
  var menu    = document.getElementById("sideMenu");
  var overlay = document.getElementById("menuOverlay");
  var close   = document.getElementById("menuClose");
  if (!btn || !menu || !overlay || !close) return;
  function openMenu()  { menu.classList.add("is-open"); overlay.classList.add("is-open"); btn.classList.add("is-open"); btn.setAttribute("aria-expanded","true");  document.body.style.overflow="hidden"; }
  function closeMenu() { menu.classList.remove("is-open"); overlay.classList.remove("is-open"); btn.classList.remove("is-open"); btn.setAttribute("aria-expanded","false"); document.body.style.overflow=""; }
  btn.addEventListener("click", openMenu);
  close.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeMenu(); });
}

/* ── 8. Favourites helpers (shared by profile.html & favourite.html) ── */
const STFav = {
  get() {
    try { return JSON.parse(localStorage.getItem("stutor_favourites")) || []; }
    catch { return []; }
  },
  save(favs) {
    localStorage.setItem("stutor_favourites", JSON.stringify(favs));
  },
  isFav(id) {
    return this.get().some(t => t.id === id);
  },
  toggle(tutor) {
    let favs = this.get();
    if (favs.some(f => f.id === tutor.id)) {
      favs = favs.filter(f => f.id !== tutor.id);
    } else {
      favs.push(tutor);
    }
    this.save(favs);
    return this.isFav(tutor.id);
  },
  remove(id) {
    this.save(this.get().filter(t => t.id !== id));
  }
};

/* ── INIT: run after DOM ready ── */
document.addEventListener("DOMContentLoaded", function () {
  applyNightMode();
  fixNavLogoForNight();
  enhanceNavbar();
  initHamburger();
});

/* Also apply immediately if body is already available (script at bottom of body) */
if (document.body) {
  applyNightMode();
}