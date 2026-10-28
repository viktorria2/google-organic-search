# Google organic search

Jedna HTML stránka, jedno pole, 1. strana organických výsledků, uložení **JSON** nebo **CSV**.

Prohlížeč Google přímo stáhnout nemůže (CORS), proto je tu malý Node server. Z gitu:

```bash
npm install
npm test
npm start
```

Otevřete http://localhost:8000

`npm start` nejdřív zkusí Google. Když Google vrátí CAPTCHA, použije záložní organický SERP.

Volitelně: `docker compose up --build`

Video: https://youtu.be/u5TaWzDPdMY
