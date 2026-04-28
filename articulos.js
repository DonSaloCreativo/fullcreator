const ARTICLES_API = "https://script.google.com/macros/s/AKfycbwdT-CW9y2YFWuNf-pEDmUrSyTfhWTs5gClUfQZg07gNWxEAoc1kNP0COIhVj8AGCKH/exec";
const ARTICLES_SHEET_NAMES = ["Publicaciones", "Articulos"];

const DEMO_ARTICLES = [
  {
    title: "Cómo convertir una idea en un proyecto digital real",
    summary: "Una mirada práctica para pasar de una intuición inicial a una estructura clara, ejecutable y con foco real.",
    body: `Toda idea necesita pasar por un proceso de traducción para convertirse en proyecto. No basta con que algo suene interesante: también necesita objetivo, prioridad, estructura y una forma de ejecución posible.

En muchos proyectos digitales, el problema no es la falta de creatividad, sino la falta de claridad. Cuando una idea todavía no tiene forma, conviene preguntarse qué resuelve, para quién existe y cuál sería la primera versión realista que podría ponerse en marcha.

Pensar así permite evitar que el proyecto se vuelva una acumulación de tareas sin dirección. También ayuda a detectar qué parte sí vale la pena construir primero y qué parte puede esperar.`,
    image: "./images/logo.png",
    date: "28/04/2026",
    slug: "convertir-idea-en-proyecto-digital",
    status: "Publicado"
  },
  {
    title: "IA útil para equipos pequeños: menos ruido, más criterio",
    summary: "Cómo pensar la IA como apoyo concreto para tareas reales sin volverla una moda vacía dentro del trabajo diario.",
    body: `La IA puede ayudar mucho cuando se usa con un objetivo claro. El problema aparece cuando se intenta meterla en todo sin distinguir entre tareas repetitivas, tareas creativas y tareas que requieren criterio humano fuerte.

Para equipos pequeños, lo más útil suele estar en lo simple: ordenar ideas, resumir textos, prototipar estructuras, generar primeros borradores y acelerar tareas operativas.

Pero incluso ahí, el valor no está en delegar completamente el pensamiento, sino en usar la herramienta para liberar tiempo y mejorar la calidad de las decisiones.`,
    image: "./images/logo.png",
    date: "26/04/2026",
    slug: "ia-util-para-equipos-pequenos",
    status: "Publicado"
  }
];

function normalizeArticleText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapArticle(item = {}) {
  const title = item.Titulo || item.Título || item.title || "";
  const summary = item.Resumen || item.summary || "";
  const body = item.Texto || item["Texto completo"] || item.body || "";
  const image = item.Imagen || item.image || "";
  const date = item.Fecha || item.date || "";
  const slug = item.Slug || item.slug || normalizeArticleText(title);
  const status = item.Estado || item.status || "Publicado";
  return { title, summary, body, image, date, slug, status };
}

function isPublished(status) {
  return String(status || "").trim().toLowerCase() === "publicado";
}

async function loadArticles() {
  try {
    for (const sheetName of ARTICLES_SHEET_NAMES) {
      const response = await fetch(`${ARTICLES_API}?hoja=${encodeURIComponent(sheetName)}`);
      const data = await response.json();
      const mapped = data.map(mapArticle).filter((article) => isPublished(article.status));

      if (mapped.length) {
        return mapped;
      }
    }

    return DEMO_ARTICLES;
  } catch (error) {
    console.error("No se pudieron cargar los artículos", error);
    return DEMO_ARTICLES;
  }
}

function getArticleSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function articleCardTemplate(article) {
  return `
    <article class="article-item">
      ${article.image ? `<img class="article-cover" src="${article.image}" alt="${article.title}" loading="lazy" decoding="async">` : ""}
      <div class="article-meta">
        ${article.date ? `<span>${article.date}</span>` : ""}
        <span>Artículo</span>
      </div>
      <h3>${article.title}</h3>
      <p>${article.summary || "Sin resumen disponible."}</p>
      <a class="article-link" href="./articulos.html?slug=${article.slug}">Leer artículo →</a>
    </article>
  `;
}

function renderArticleList(articles) {
  const grid = document.getElementById("articles-grid");
  const empty = document.getElementById("articles-empty");
  if (!grid || !empty) return;

  if (!articles.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = articles.map(articleCardTemplate).join("");
}

function renderArticleDetail(article) {
  const list = document.getElementById("articles-list");
  const view = document.getElementById("article-view");
  const image = document.getElementById("article-image");
  const date = document.getElementById("article-date");
  const title = document.getElementById("article-title");
  const summary = document.getElementById("article-summary");
  const body = document.getElementById("article-body");

  if (!list || !view || !title || !summary || !body || !date || !image) return;

  list.classList.add("hidden");
  view.classList.remove("hidden");

  if (article.image) {
    image.hidden = false;
    image.src = article.image;
    image.alt = article.title;
  } else {
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
  }

  date.textContent = article.date || "Sin fecha";
  title.textContent = article.title;
  summary.textContent = article.summary || "";

  const paragraphs = String(article.body || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");

  body.innerHTML = paragraphs || "<p>Sin contenido disponible.</p>";
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentSlug = getArticleSlug();
  const articles = (await loadArticles()).map(mapArticle);
  const filteredArticles = articles.filter((article) => isPublished(article.status));

  renderArticleList(filteredArticles);

  if (currentSlug) {
    const article = filteredArticles.find((item) => item.slug === currentSlug);
    if (article) {
      renderArticleDetail(article);
    }
  }

  const backButton = document.getElementById("article-back");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "./articulos.html";
    });
  }
});
