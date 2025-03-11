# MijnIPChecker

Een moderne website om IP-adres informatie te bekijken, vergelijkbaar met whatismyipaddress.com maar met een betere uitstraling.

## Functionaliteiten

- **IP-adres weergave**: Toont automatisch het IP-adres van de bezoeker
- **Gedetailleerde IP-informatie**: Toont locatie, ISP, land, stad, tijdzone en netwerk
- **IP Lookup Tool**: Zoek informatie over een specifiek IP-adres
- **Domein naar IP Tool**: Converteer een domeinnaam naar bijbehorende IP-adressen
- **IP Verborgen Check**: Controleer of je IP-adres verborgen is (bijv. door VPN of proxy)
- **Responsive Design**: Werkt goed op zowel desktop als mobiele apparaten
- **Gebruikslogboek**: Verzamelt geanonimiseerde gebruiksgegevens voor verbeteringsdoeleinden via Discord webhooks

## Technische Details

Deze website is gebouwd met:
- HTML5
- CSS3 (met moderne features zoals CSS Grid, Flexbox en CSS Variables)
- Vanilla JavaScript (ES6+)

## API's

De website maakt gebruik van de volgende externe API's:
- [ipify](https://api.ipify.org) - Voor het ophalen van het IP-adres van de bezoeker
- [ipapi.co](https://ipapi.co) - Voor het ophalen van gedetailleerde IP-informatie
- [ipwho.is](https://ipwho.is) - Alternatieve API voor IP-informatie
- [dns.google](https://dns.google) - Voor het omzetten van domeinnamen naar IP-adressen
- [allorigins.win](https://allorigins.win) - CORS-proxy voor API-aanroepen
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook) - Voor het verzamelen van gebruiksgegevens

## Installatie en Gebruik

### Lokaal gebruik

1. Download of kloon deze repository
2. Open `index.html` in een webbrowser
3. De website werkt direct zonder extra configuratie

### Hosting op GitHub Pages

Deze website is volledig geoptimaliseerd voor hosting op GitHub Pages:

1. Maak een GitHub repository aan
2. Upload alle bestanden naar de repository
3. Ga naar repository instellingen > Pages
4. Selecteer de branch die je wilt publiceren (meestal 'main')
5. Klik op 'Save' en je website is live!

De website gebruikt alleen client-side code en maakt gebruik van CORS-proxies en JSONP waar nodig om cross-origin beperkingen te omzeilen.

## Logging en Privacy

Deze website verzamelt geanonimiseerde gebruiksgegevens voor verbeteringsdoeleinden via Discord webhooks. Dit omvat:

- Welke functies worden gebruikt
- Hoe gebruikers door de website navigeren
- Technische informatie zoals browser en schermgrootte
- Geanonimiseerde IP-gerelateerde informatie (land, stad, etc.)

De verzamelde gegevens worden naar een privé Discord kanaal gestuurd via webhooks en worden ook lokaal opgeslagen in de browser als fallback. Er worden geen persoonlijk identificeerbare gegevens verzameld of opgeslagen.

Gebruikers kunnen ervoor kiezen om niet deel te nemen aan deze gegevensverzameling door cookies te weigeren via de cookie banner.

Zie het [privacybeleid](privacy.html) voor meer informatie.

## Licentie

Dit project is beschikbaar onder de MIT-licentie.

## Auteur

Gemaakt door [Jouw Naam] 