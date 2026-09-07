# brawler-ranking

BRAWL RANKER — blinde Tierlist für Brawl Stars Brawler. Pro Runde bekommst du
10 zufällige Brawler nacheinander gezeigt (immer nur einen) und musst ihn
sofort auf einen freien Platz zwischen 1 und 10 setzen. Kein Zurück.

Reine statische Seite (HTML/CSS/JS, kein Build-Schritt), Styling angelehnt an
[zettzilla](https://github.com/graigJin/zettzilla). Brawler-Daten und -Bilder
kommen zur Laufzeit von [Brawlify](https://brawlify.com); es ist kein
offizielles Supercell-Produkt.

## Lokal testen

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

(Direkt per `file://` öffnen funktioniert nicht, weil `assets/data/brawlers.json`
per `fetch()` geladen wird.)

## Deploy auf dem VPS

1. Repo auf den Server pullen, z.B. nach `/var/www/brawler-ranking`
2. `deploy/nginx-brawler-ranking.conf` nach
   `/etc/nginx/sites-available/brawler-ranking` kopieren, Domain anpassen
3. `ln -s /etc/nginx/sites-available/brawler-ranking /etc/nginx/sites-enabled/`
4. `certbot --nginx -d <deine-domain>`
5. `nginx -t && systemctl reload nginx`

Updates danach einfach per `git pull` im Repo-Ordner — kein Rebuild nötig.

## Daten aktualisieren

`assets/data/brawlers.json` enthält alle aktuell bei Brawlify mit Bild
verfügbaren Brawler (id, name, image, rarity, rarityColor). Bei neuen
Releases kann die Liste über die Brawlify-API neu gezogen werden:

```bash
curl -s -A "Mozilla/5.0" https://api.brawlapi.com/v1/brawlers
```
