# Silver Klíma — Aláírás Stúdió

Outlook-kompatibilis email aláírás generátor a Silver Klíma munkatársak számára. Töltsd ki egyszer az adataidat, válassz bannert, és másold a vágólapra.

## Élesben

🌐 **https://peggipalasics.github.io/silverklima-alairas/**

(GitHub Pages-en hostolva — minden recipientnek mindenhol működni fog a beillesztés.)

## Mit ad

- 2 aláírás-elrendezés: **Editorial** (magazinos, név elöl) és **Kompakt** (logo balra, T/E/W címkés sorok).
- 5 választható banner:
  - 3 Zöld Település (városi illusztráció, földgömb, napsütés — animált GIF)
  - 2 Általános gépészet (sötét + világos fémcsöves — animált GIF)
- Egy gombnyomásra rich-HTML + plain-text vágólap-csomagot készít, Outlook beilleszti.
- LocalStorage-be menti a kitöltött adatokat és a választott bannert.

## Hogyan használd

1. Nyisd meg az élesben link-et fent.
2. Töltsd ki a saját adataidat (név, pozíció, telefon, email, weboldal).
3. Válassz bannert.
4. Válassz elrendezést, és nyomd meg a **Másolás Outlookba** gombot.
5. **Outlook Desktop:** Fájl → Beállítások → Levél → Aláírások → Új → Ctrl+V → Mentés.
6. **Outlook Web / Mac:** Beállítások → Levél → Megírás és válaszadás → Beillesztés.

## Fejlesztőknek

A teljes studio egy darab statikus HTML fájl (`index.html`), React + Babel CDN-ről. Nincs build step.

- `index.html` — a studio + az aláírás-generátorok (`buildEditorial`, `buildCompact`, `buildPlain`)
- `assets/` — a logó és az 5 banner GIF
- `generate_banners.py` — a régi procedurális banner-generátor (Pillow), már nem aktívan használt — a bannerek most fix GIF-ek

### Banner cseréje

Cserélj GIF-et az `assets/` mappában (ugyanazzal a fájlnévvel), commit + push, és a Pages automatikusan frissül.

### Új banner hozzáadása

Az `index.html` `BANNERS` map-jébe vegyél fel egy új entry-t. Pl.:

```js
ujBanner: {
  label: 'Új banner címe',
  subtitle: 'Rövid leírás',
  preview: 'assets/banner-uj.gif',
  production: 'https://peggipalasics.github.io/silverklima-alairas/assets/banner-uj.gif',
  w: 520, h: 104,
},
```

És frissítsd a `◉ BANNER STÍLUS · 0X` címkét a számra.
