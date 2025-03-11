# MijnIPChecker op GitHub Pages hosten

Deze handleiding legt uit hoe je de MijnIPChecker website kunt hosten op GitHub Pages.

## Stappen

1. **Maak een GitHub account** (als je die nog niet hebt)
   - Ga naar [github.com](https://github.com) en registreer een account

2. **Maak een nieuwe repository**
   - Klik op de "+" knop rechtsboven en kies "New repository"
   - Geef je repository een naam (bijv. "mijn-ip-checker")
   - Kies of je repository openbaar of privé moet zijn
   - Klik op "Create repository"

3. **Upload de bestanden**
   - Je kunt de bestanden uploaden via de GitHub website of met Git
   - **Via de website**:
     - Klik op "uploading an existing file" op de repository pagina
     - Sleep alle bestanden naar het uploadvenster of klik om bestanden te selecteren
     - Klik op "Commit changes"
   - **Met Git**:
     ```bash
     git clone https://github.com/jouw-gebruikersnaam/mijn-ip-checker.git
     cd mijn-ip-checker
     # Kopieer alle bestanden naar deze map
     git add .
     git commit -m "Eerste commit"
     git push origin main
     ```

4. **GitHub Pages inschakelen**
   - Ga naar de repository instellingen (tabblad "Settings")
   - Scroll naar beneden naar de sectie "GitHub Pages"
   - Bij "Source", selecteer de branch die je wilt publiceren (meestal "main")
   - Klik op "Save"
   - GitHub zal een bericht tonen met de URL waar je website beschikbaar is (meestal `https://jouw-gebruikersnaam.github.io/mijn-ip-checker`)

5. **Controleer je website**
   - Het kan een paar minuten duren voordat je website live is
   - Bezoek de URL die GitHub heeft gegeven om te controleren of alles werkt

## Opmerkingen

- De website is volledig client-side en gebruikt CORS-proxies en JSONP waar nodig om cross-origin beperkingen te omzeilen
- Logging gebeurt via Discord webhooks en lokaal in de browser
- De Discord webhook URL is al geconfigureerd in de code, dus er is geen extra setup nodig
- Als je wijzigingen maakt aan de code, moet je deze opnieuw uploaden naar GitHub en het kan een paar minuten duren voordat de wijzigingen zichtbaar zijn op je website

## Problemen oplossen

Als je problemen ondervindt met het hosten van de website op GitHub Pages, controleer dan het volgende:

- Zorg ervoor dat alle bestanden correct zijn geüpload naar de repository
- Controleer of GitHub Pages is ingeschakeld voor de juiste branch
- Controleer de browser console voor eventuele JavaScript fouten
- Als je CORS-fouten ziet, controleer dan of de CORS-proxies nog steeds werken (deze kunnen in de toekomst veranderen) 