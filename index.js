const fs = require("fs");
const puppeteer = require("puppeteer");

const BASE_URL = "https://mercado.carrefour.com.br";

(async () => {
    const searchTerm = "bebidas";
    const searchUrl = `${BASE_URL}/s?q=${encodeURIComponent(searchTerm)}`;

    console.log("Verificando a acessibilidade da URL...");
    try {
        const response = await fetch(searchUrl);
        if (!response.ok) throw new Error(`Erro ao acessar a URL: ${response.statusText}`);
    } catch (error) {
        console.error("Erro ao fazer a requisição com fetch:", error);
        return;
    }

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log("Acessando o site...");
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    console.log("Coletando dados das bebidas...");
    const bebidas = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("[data-product-card-content='true']"))
            .map(el => {
                const titleElement = el.querySelector("h3 a[data-testid='product-link']");
                const priceElement = el.querySelector("[data-test-id='price']");
                const imageElement = el.querySelector("img");

                const title = titleElement?.innerText.trim() || "";
                const price = priceElement?.innerText.trim() || "";
                const image = imageElement?.src || "";

                return { title, price, image };
            });
    });

    console.log(`Foram encontradas ${bebidas.length} bebidas.`);
    fs.writeFileSync("output.json", JSON.stringify(bebidas, null, 2));

    await browser.close();
    console.log("Dados salvos em output.json");
})();
