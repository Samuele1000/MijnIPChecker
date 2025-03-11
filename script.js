// Wacht tot de DOM volledig is geladen
document.addEventListener('DOMContentLoaded', function() {
    // Elementen ophalen
    const ipAddressElement = document.getElementById('ip-address');
    const locationElement = document.getElementById('location');
    const ispElement = document.getElementById('isp');
    const countryElement = document.getElementById('country');
    const cityElement = document.getElementById('city');
    const timezoneElement = document.getElementById('timezone');
    const networkElement = document.getElementById('network');
    
    // IP Lookup tool elementen
    const ipLookupInput = document.getElementById('ip-lookup-input');
    const ipLookupBtn = document.getElementById('ip-lookup-btn');
    const ipLookupResult = document.getElementById('ip-lookup-result');
    
    // Domain Lookup tool elementen
    const domainLookupInput = document.getElementById('domain-lookup-input');
    const domainLookupBtn = document.getElementById('domain-lookup-btn');
    const domainLookupResult = document.getElementById('domain-lookup-result');
    
    // IP Hidden check elementen
    const checkHiddenBtn = document.getElementById('check-hidden-btn');
    const hiddenResult = document.getElementById('hidden-result');
    
    // Logging configuratie
    // GitHub Pages ondersteunt geen server-side code, dus we gebruiken Discord webhook voor logging
    let ENABLE_LOGGING = true;
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1348762922960027730/KiCxIrTuv5bihTxm6-1PmuWmWdpTZWG5r2Q2IKvYkIG9f-DWv_Uq8pNhcBOYPkjnscVt';
    
    // Array om logs te verzamelen
    let collectedLogs = [];
    let sessionStartTime = new Date();
    let hasLoggedPageLoad = false;
    let userIP = null;
    
    // Functie om gebruikersacties te loggen
    async function logAction(action, data = {}) {
        if (!ENABLE_LOGGING) return;
        
        try {
            const logData = {
                action: action,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                referrer: document.referrer,
                ...data
            };
            
            // Sla log lokaal op
            saveLogLocally(logData);
            
            // Voeg log toe aan verzamelde logs
            // Voorkom dubbele page_loaded logs
            if (action === 'page_loaded') {
                if (!hasLoggedPageLoad) {
                    collectedLogs.push(logData);
                    hasLoggedPageLoad = true;
                }
            } 
            // Sla alleen belangrijke logs op, filter veelvoorkomende logs
            else if (
                action === 'ip_lookup' || 
                action === 'domain_lookup' || 
                action === 'check_ip_hidden' ||
                action === 'ip_hidden_check' ||
                (action === 'ip_details_fetched' && data.success === true && userIP === null) ||
                action === 'cookie_consent'
            ) {
                collectedLogs.push(logData);
            }
            
            // Sla het IP-adres op voor latere referentie
            if (action === 'ip_fetched' && data.success === true) {
                userIP = data.ip;
            }
            
            console.log('Log toegevoegd aan verzameling:', logData);
            
        } catch (error) {
            console.error('Fout bij het loggen van actie:', error);
            // Sla log lokaal op als er een fout optreedt
            saveLogLocally({
                action: action,
                timestamp: new Date().toISOString(),
                error: 'Failed to log to collection',
                errorMessage: error.message,
                ...data
            });
        }
    }
    
    // Functie om verzamelde logs naar Discord te sturen
    async function sendCollectedLogs(resetLogs = true) {
        // Beperk tot essentiële events en één keer per sessie
        if (!ENABLE_LOGGING || collectedLogs.length === 0) return;
        
        // Verwijder herhaalde en onnodige logs
        const uniqueLogs = collectedLogs.filter(log => 
            log.action === 'session_started' ||
            log.action === 'ip_details_fetched' ||
            log.action === 'ip_hidden_check'
        );
        
        if (uniqueLogs.length === 0) return;

        try {
            // Bereken sessieduur
            const sessionDuration = Math.round((new Date() - sessionStartTime) / 1000);
            
            // Maak een samenvatting van de sessie
            const sessionSummary = {
                action: 'session_summary',
                timestamp: new Date().toISOString(),
                session_duration_seconds: sessionDuration,
                total_actions: collectedLogs.length,
                user_ip: userIP || 'Niet beschikbaar',
                user_agent: navigator.userAgent,
                screen_size: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                referrer: document.referrer
            };
            
            // Maak een kopie van de logs voor verzending
            const logsToSend = [...collectedLogs];
            
            // Voeg sessie samenvatting toe aan het begin van de logs
            logsToSend.unshift(sessionSummary);
            
            // Zoek IP informatie in de verzamelde logs
            const ipInfo = logsToSend.find(log => 
                log.action === 'ip_details_fetched' && 
                log.success === true
            );
            
            // Zoek VPN informatie
            const vpnInfo = logsToSend.find(log => 
                log.action === 'ip_hidden_check' && 
                log.success === true
            );
            
            // Haal browser informatie op
            const browserInfo = getDetailedBrowserInfo();
            
            // Maak het IP informatie veld
            const ipInfoField = {
                name: "🌐 Internet & IP Informatie",
                value: `**IP Adres:** ${userIP || 'Niet beschikbaar'}\n` +
                       `**Provider:** ${ipInfo && ipInfo.org ? ipInfo.org : (ipInfo && ipInfo.isp ? ipInfo.isp : 'Niet beschikbaar')}\n` +
                       `**Hostname:** ${ipInfo && ipInfo.hostname ? ipInfo.hostname : 'Niet beschikbaar'}\n` +
                       `**Socket:** ${userIP || 'Niet beschikbaar'}:80\n` +
                       `**Land:** ${ipInfo && ipInfo.country_name ? ipInfo.country_name : 'Niet beschikbaar'}\n` +
                       `**Stad:** ${ipInfo && ipInfo.city ? ipInfo.city : 'Niet beschikbaar'}\n` +
                       `**ISP:** ${ipInfo && ipInfo.org ? ipInfo.org : (ipInfo && ipInfo.isp ? ipInfo.isp : 'Niet beschikbaar')}\n` +
                       `**VPN Gedetecteerd:** ${vpnInfo && vpnInfo.is_hidden ? '✅ Ja' : '❌ Nee'}`,
                inline: false
            };
            
            // Maak het browser informatie veld
            const browserInfoField = {
                name: "🖥️ Browser Informatie",
                value: `**Browser:** ${browserInfo.browser}\n` +
                       `**Code Naam:** ${browserInfo.codeName}\n` +
                       `**Versie:** ${browserInfo.version}\n` +
                       `**User Agent:** ${navigator.userAgent}`,
                inline: false
            };
            
            // Maak het sessie informatie veld
            const sessionInfoField = {
                name: "📊 Sessie Informatie",
                value: `**Duur:** ${formatDuration(sessionDuration)}\n` +
                       `**Scherm:** ${sessionSummary.screen_size}\n` +
                       `**Taal:** ${sessionSummary.language}\n` +
                       `**Verwijzer:** ${sessionSummary.referrer || 'Direct bezoek'}`,
                inline: false
            };
            
            // Maak Discord bericht met alle informatie in de embed
            const discordMessage = {
                username: "MijnIPChecker Logger",
                avatar_url: "https://cdn-icons-png.flaticon.com/512/1691/1691948.png",
                embeds: [{
                    title: `Bezoeker Gedetecteerd`,
                    description: `Een nieuwe bezoeker heeft de website bezocht om ${new Date().toLocaleTimeString('nl-NL')}`,
                    color: 3447003, // Blauw
                    fields: [
                        ipInfoField,
                        browserInfoField,
                        sessionInfoField
                    ],
                    footer: {
                        text: "MijnIPChecker Logging"
                    },
                    timestamp: new Date().toISOString()
                }]
            };
            
            // Stuur naar Discord webhook
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(discordMessage),
                keepalive: true
            });
            
            console.log('Verzamelde logs verzonden naar Discord webhook');
            
            // Reset verzamelde logs alleen als dat is aangegeven
            if (resetLogs) {
                collectedLogs = [];
            }
            
        } catch (error) {
            console.error('Fout bij het verzenden van verzamelde logs:', error);
        }
    }
    
    // Helper functie om logs te comprimeren
    function getCompressedLogs(logs) {
        const compressedLogs = {};
        logs.forEach(log => {
            const actionType = log.action;
            if (!compressedLogs[actionType]) {
                compressedLogs[actionType] = 1;
            } else {
                compressedLogs[actionType]++;
            }
        });
        return compressedLogs;
    }
    
    // Helper functie om gedetailleerde browser informatie te krijgen
    function getDetailedBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "Onbekend";
        let codeName = "Mozilla";
        let version = "";
        
        // Browser detectie
        if (ua.indexOf("Firefox") > -1) {
            browser = "Firefox";
            const vMatch = ua.match(/Firefox\/(\d+\.\d+)/);
            version = vMatch ? vMatch[1] : "";
        } else if (ua.indexOf("Chrome") > -1 && ua.indexOf("Edg") === -1 && ua.indexOf("OPR") === -1) {
            browser = "Chrome";
            const vMatch = ua.match(/Chrome\/(\d+\.\d+)/);
            version = vMatch ? vMatch[1] : "";
        } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
            browser = "Safari";
            const vMatch = ua.match(/Version\/(\d+\.\d+)/);
            version = vMatch ? vMatch[1] : "";
        } else if (ua.indexOf("Edg") > -1) {
            browser = "Edge";
            const vMatch = ua.match(/Edg\/(\d+\.\d+)/);
            version = vMatch ? vMatch[1] : "";
        } else if (ua.indexOf("OPR") > -1) {
            browser = "Opera";
            const vMatch = ua.match(/OPR\/(\d+\.\d+)/);
            version = vMatch ? vMatch[1] : "";
        } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
            browser = "Internet Explorer";
            const vMatch = ua.match(/MSIE (\d+\.\d+)/);
            version = vMatch ? vMatch[1] : "11.0"; // IE 11 doesn't use MSIE in UA
        }
        
        return {
            browser,
            codeName,
            version
        };
    }
    
    // Helper functie om tijdsduur te formatteren
    function formatDuration(seconds) {
        if (seconds < 60) return `${seconds} seconden`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} min, ${remainingSeconds} sec`;
    }
    
    // Helper functie om browser informatie te krijgen
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName = "Onbekend";
        
        if (ua.indexOf("Firefox") > -1) {
            browserName = "Firefox";
        } else if (ua.indexOf("Chrome") > -1) {
            browserName = "Chrome";
        } else if (ua.indexOf("Safari") > -1) {
            browserName = "Safari";
        } else if (ua.indexOf("Edge") > -1) {
            browserName = "Edge";
        } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
            browserName = "Internet Explorer";
        }
        
        return browserName;
    }
    
    // Helper functie om IP samenvatting te krijgen
    function getIPSummary() {
        // Zoek IP informatie in de verzamelde logs
        const ipInfo = collectedLogs.find(log => 
            log.action === 'ip_details_fetched' && 
            log.success === true
        );
        
        if (!ipInfo) return "Geen IP informatie beschikbaar";
        
        let summary = `IP: ${userIP || 'Niet beschikbaar'}`;
        
        if (ipInfo.country_code) {
            summary += `\nLand: ${ipInfo.country_code}`;
        }
        
        if (ipInfo.has_city) {
            summary += "\nStad: Beschikbaar";
        }
        
        if (ipInfo.has_isp) {
            summary += "\nISP: Beschikbaar";
        }
        
        return summary;
    }
    
    // Functie om logs lokaal op te slaan als fallback
    function saveLogLocally(logData) {
        try {
            const logs = JSON.parse(localStorage.getItem('mijnipchecker_logs') || '[]');
            logs.push(logData);
            
            // Beperk het aantal opgeslagen logs (max 100)
            if (logs.length > 100) {
                logs.shift(); // Verwijder de oudste log
            }
            
            localStorage.setItem('mijnipchecker_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Fout bij het lokaal opslaan van logs:', error);
        }
    }
    
    // Functie om het IP-adres van de gebruiker op te halen
    async function getUserIP() {
        try {
            // Gebruik JSONP voor ipify om CORS-problemen te voorkomen
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                window.getIP = (data) => {
                    document.body.removeChild(script);
                    resolve(data.ip);
                };
                script.src = 'https://api.ipify.org?format=jsonp&callback=getIP';
                document.body.appendChild(script);
                
                // Timeout na 5 seconden
                setTimeout(() => {
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                        reject(new Error('Timeout bij het ophalen van IP-adres'));
                    }
                }, 5000);
            });
        } catch (error) {
            console.error('Fout bij het ophalen van IP-adres:', error);
            
            // Log de fout
            logAction('ip_fetched', { 
                success: false, 
                error: error.message 
            });
            
            return 'Niet beschikbaar';
        }
    }
    
    // Functie om gedetailleerde IP-informatie op te halen
    async function getIPDetails(ip) {
        try {
            // Gebruik een CORS-proxy voor ipapi.co om CORS-problemen te voorkomen
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://ipapi.co/${ip}/json/`)}`);
            const data = await response.json();
            const ipData = JSON.parse(data.contents);
            
            // Log dat de IP-details succesvol zijn opgehaald
            logAction('ip_details_fetched', { 
                success: true,
                ip: ip,
                // Log meer gegevens voor betere rapportage
                country_code: ipData.country_code,
                country_name: ipData.country_name,
                city: ipData.city,
                region: ipData.region,
                org: ipData.org,
                hostname: ipData.hostname || 'Niet beschikbaar',
                has_city: !!ipData.city,
                has_region: !!ipData.region,
                has_timezone: !!ipData.timezone,
                has_isp: !!ipData.org
            });
            
            return ipData;
        } catch (error) {
            console.error('Fout bij het ophalen van IP-details:', error);
            
            // Probeer een alternatieve API als de eerste faalt
            try {
                const response = await fetch(`https://ipwho.is/${ip}`);
                const ipData = await response.json();
                
                // Converteer het formaat naar ipapi.co formaat
                const convertedData = {
                    ip: ipData.ip,
                    city: ipData.city,
                    region: ipData.region,
                    region_code: ipData.region_code,
                    country_name: ipData.country,
                    country_code: ipData.country_code,
                    timezone: ipData.timezone.id,
                    utc_offset: ipData.timezone.utc,
                    org: ipData.connection.isp,
                    isp: ipData.connection.isp,
                    hostname: ipData.connection.domain || 'Niet beschikbaar',
                    network: ipData.connection.domain
                };
                
                // Log dat de IP-details succesvol zijn opgehaald via alternatieve API
                logAction('ip_details_fetched', { 
                    success: true,
                    ip: ip,
                    source: 'alternative_api',
                    country_code: convertedData.country_code,
                    country_name: convertedData.country_name,
                    city: convertedData.city,
                    region: convertedData.region,
                    org: convertedData.org,
                    isp: convertedData.isp,
                    hostname: convertedData.hostname,
                    has_city: !!convertedData.city,
                    has_region: !!convertedData.region,
                    has_timezone: !!convertedData.timezone,
                    has_isp: !!convertedData.org
                });
                
                return convertedData;
            } catch (alternativeError) {
                console.error('Fout bij het ophalen van IP-details via alternatieve API:', alternativeError);
                
                // Log de fout
                logAction('ip_details_fetched', { 
                    success: false, 
                    ip: ip,
                    error: error.message,
                    alternative_error: alternativeError.message
                });
                
                return null;
            }
        }
    }
    
    // Functie om IP-informatie weer te geven
    function displayIPInfo(data) {
        if (!data) {
            setErrorState();
            
            // Log de fout
            logAction('display_ip_info', { success: false, reason: 'no_data' });
            
            return;
        }
        
        // Controleer of er een fout is in de API-respons
        if (data.error) {
            setErrorState();
            
            // Log de fout
            logAction('display_ip_info', { 
                success: false, 
                reason: 'api_error',
                error_message: data.error
            });
            
            return;
        }
        
        // Update de UI met IP-informatie
        locationElement.textContent = `${data.city}, ${data.region}, ${data.country_name}`;
        ispElement.textContent = data.org || 'Niet beschikbaar';
        countryElement.textContent = `${data.country_name} (${data.country_code})`;
        cityElement.textContent = data.city || 'Niet beschikbaar';
        timezoneElement.textContent = `${data.timezone} (UTC${data.utc_offset})`;
        networkElement.textContent = data.network || 'Niet beschikbaar';
        
        // Log dat de informatie succesvol is weergegeven
        logAction('display_ip_info', { 
            success: true,
            has_city: !!data.city,
            has_region: !!data.region,
            has_country: !!data.country_name,
            has_isp: !!data.org,
            has_timezone: !!data.timezone,
            has_network: !!data.network
        });
    }
    
    // Functie om een foutmelding weer te geven
    function setErrorState() {
        const errorMessage = 'Informatie niet beschikbaar';
        locationElement.textContent = errorMessage;
        ispElement.textContent = errorMessage;
        countryElement.textContent = errorMessage;
        cityElement.textContent = errorMessage;
        timezoneElement.textContent = errorMessage;
        networkElement.textContent = errorMessage;
    }
    
    // Functie om een domein naar IP te converteren
    async function domainToIP(domain) {
        try {
            // Gebruik een CORS-proxy voor dns.google om CORS-problemen te voorkomen
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://dns.google/resolve?name=${domain}`)}`);
            const data = await response.json();
            const dnsData = JSON.parse(data.contents);
            
            if (dnsData.Answer && dnsData.Answer.length > 0) {
                // Filter alleen A records (IPv4) of AAAA records (IPv6)
                const ipAddresses = dnsData.Answer
                    .filter(record => record.type === 1 || record.type === 28)
                    .map(record => record.data);
                
                // Log dat de domein naar IP conversie succesvol is
                logAction('domain_to_ip', { 
                    success: true,
                    domain: domain,
                    ip_count: ipAddresses.length,
                    has_ipv4: ipAddresses.some(ip => !ip.includes(':')),
                    has_ipv6: ipAddresses.some(ip => ip.includes(':'))
                });
                
                return ipAddresses;
            } else {
                // Log dat er geen IP-adressen zijn gevonden
                logAction('domain_to_ip', { 
                    success: false,
                    domain: domain,
                    reason: 'no_ips_found'
                });
                
                return ['Geen IP-adressen gevonden'];
            }
        } catch (error) {
            console.error('Fout bij het omzetten van domein naar IP:', error);
            
            // Probeer een alternatieve methode
            try {
                // Gebruik een alternatieve API die JSONP ondersteunt
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    const callbackName = 'dnsCallback_' + Math.floor(Math.random() * 1000000);
                    
                    window[callbackName] = (data) => {
                        document.body.removeChild(script);
                        delete window[callbackName];
                        
                        if (data && data.Answer && data.Answer.length > 0) {
                            const ipAddresses = data.Answer
                                .filter(record => record.type === 1 || record.type === 28)
                                .map(record => record.data);
                            
                            resolve(ipAddresses.length > 0 ? ipAddresses : ['Geen IP-adressen gevonden']);
                        } else {
                            resolve(['Geen IP-adressen gevonden']);
                        }
                    };
                    
                    script.src = `https://dns.google.com/resolve?name=${domain}&callback=${callbackName}`;
                    document.body.appendChild(script);
                    
                    // Timeout na 5 seconden
                    setTimeout(() => {
                        if (document.body.contains(script)) {
                            document.body.removeChild(script);
                            delete window[callbackName];
                            reject(new Error('Timeout bij het ophalen van DNS-informatie'));
                        }
                    }, 5000);
                });
            } catch (alternativeError) {
                console.error('Fout bij het omzetten van domein naar IP via alternatieve methode:', alternativeError);
                
                // Log de fout
                logAction('domain_to_ip', { 
                    success: false, 
                    domain: domain,
                    error: error.message,
                    alternative_error: alternativeError.message
                });
                
                return ['Fout bij het ophalen van IP-adres'];
            }
        }
    }
    
    // Functie om te controleren of een IP-adres verborgen is
    async function isIPHidden(ip) {
        try {
            // Controleer of het IP-adres een privé-adres is
            if (isPrivateIP(ip)) {
                // Log dat het IP-adres privé is
                logAction('ip_hidden_check', { 
                    success: true,
                    ip: ip,
                    is_hidden: true,
                    reason: 'private_ip'
                });
                
                // Toon popup voor goede online veiligheid
                showSecurityPopup();
                
                return {
                    hidden: true,
                    reason: 'Dit is een privé IP-adres, wat betekent dat je waarschijnlijk achter een router of proxy zit.'
                };
            }
            
            // Controleer of het IP-adres overeenkomt met bekende VPN/proxy providers
            const vpnCheckResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const vpnData = await vpnCheckResponse.json();
            
            // Uitgebreide lijst van VPN-gerelateerde trefwoorden
            const vpnKeywords = [
                'vpn', 'proxy', 'tor', 'cloud', 'host', 'server', 'data center', 
                'datacenter', 'hosting', 'anonymous', 'nordvpn', 'expressvpn', 
                'surfshark', 'cyberghost', 'protonvpn', 'privatevpn', 'mullvad',
                'ipvanish', 'purevpn', 'hotspot', 'shield', 'avast', 'kaspersky',
                'norton', 'mcafee', 'bitdefender', 'tunnelbear', 'windscribe',
                'hide.me', 'privateinternetaccess', 'pia', 'vyprvpn', 'strongvpn',
                'ivacy', 'perfectprivacy', 'privatetunnel', 'safervpn', 'zenmate',
                'astrill', 'goose', 'trust.zone', 'bolehvpn', 'switchvpn', 'airvpn',
                'ovpn', 'vpnac', 'vpnarea', 'vpnunlimited', 'witopia', 'torguard',
                'hidemyass', 'hma', 'privateinternetaccess', 'pia', 'aws', 'amazon',
                'azure', 'microsoft', 'google', 'gcp', 'digitalocean', 'linode',
                'vultr', 'ovh', 'hetzner', 'scaleway', 'oracle', 'ibm', 'alibaba',
                'tencent', 'cloudflare', 'akamai', 'fastly', 'cdn', 'vps', 'virtual',
                'dedicated', 'colocation', 'colo', 'telecom', 'isp', 'provider',
                'network', 'anonymous', 'privacy', 'secure', 'protected', 'hidden',
                'masked', 'encrypted', 'tunnel', 'wireguard', 'openvpn', 'l2tp',
                'pptp', 'ipsec', 'sstp', 'ikev2', 'softether', 'socks', 'proxy',
                'residential', 'mobile', 'cellular', 'exit node', 'relay'
            ];
            
            // Controleer of de organisatie of ASN naam een VPN-gerelateerd trefwoord bevat
            const orgName = (vpnData.org || '').toLowerCase();
            const asnName = (vpnData.asn || '').toLowerCase();
            
            const isVpnOrProxy = vpnKeywords.some(keyword => 
                orgName.includes(keyword) || asnName.includes(keyword)
            );
            
            if (isVpnOrProxy) {
                // Log dat het IP-adres een VPN/proxy is
                logAction('ip_hidden_check', { 
                    success: true,
                    ip: ip,
                    is_hidden: true,
                    reason: 'vpn_proxy_detected',
                    provider: vpnData.org
                });
                
                // Toon popup voor goede online veiligheid
                showSecurityPopup();
                
                return {
                    hidden: true,
                    reason: `Je gebruikt waarschijnlijk een VPN of proxy (${vpnData.org}).`
                };
            }
            
            // Log dat het IP-adres niet verborgen is
            logAction('ip_hidden_check', { 
                success: true,
                ip: ip,
                is_hidden: false,
                provider: vpnData.org || 'Onbekend'
            });
            
            return {
                hidden: false,
                reason: 'Je IP-adres lijkt niet verborgen te zijn. Je internetprovider en locatie zijn zichtbaar voor websites.'
            };
        } catch (error) {
            console.error('Fout bij het controleren of IP verborgen is:', error);
            
            // Log de fout
            logAction('ip_hidden_check', { 
                success: false, 
                ip: ip,
                error: error.message 
            });
            
            return {
                hidden: null,
                reason: 'Kon niet bepalen of je IP-adres verborgen is.'
            };
        }
    }
    
    // Functie om te controleren of een IP-adres privé is
    function isPrivateIP(ip) {
        // Eenvoudige check voor privé IP-adressen
        return /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);
    }
    
    // Functie om een laad-indicator weer te geven
    function showLoading(element) {
        element.innerHTML = '<div class="loading">Laden...</div>';
    }
    
    // Functie om een resultaat weer te geven
    function showResult(element, content, isError = false) {
        element.innerHTML = isError 
            ? `<div class="error">${content}</div>` 
            : content;
    }
    
    // Functie om een popup te tonen voor goede online veiligheid
    function showSecurityPopup() {
        // Controleer of de popup al is getoond in deze sessie
        if (localStorage.getItem('security_popup_shown')) return;
        
        // Maak de popup
        const popup = document.createElement('div');
        popup.className = 'security-popup';
        
        popup.innerHTML = `
            <div class="security-popup-content">
                <span class="close-popup">&times;</span>
                <h2>🔒 Goed bezig met je online veiligheid!</h2>
                <p>We hebben gedetecteerd dat je een VPN of proxy gebruikt. Dit is een uitstekende manier om je privacy online te beschermen!</p>
                
                <div class="security-tips">
                    <h3>Meer tips voor online veiligheid:</h3>
                    <ul>
                        <li>Gebruik sterke, unieke wachtwoorden voor elke website</li>
                        <li>Schakel tweefactorauthenticatie in waar mogelijk</li>
                        <li>Houd je software en apparaten up-to-date</li>
                        <li>Wees voorzichtig met het klikken op links in e-mails</li>
                    </ul>
                </div>
                
                <div class="security-cta">
                    <p>Bezoek onze wachtwoord generator voor sterke wachtwoorden:</p>
                    <a href="https://samuele1000.github.io/OwnWebSite/" target="_blank" class="security-btn">SemSecurity Wachtwoord Generator</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Voeg CSS toe voor de popup
        const style = document.createElement('style');
        style.textContent = `
            .security-popup {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .security-popup-content {
                background-color: white;
                border-radius: var(--border-radius);
                padding: 30px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .close-popup {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 24px;
                cursor: pointer;
                color: var(--gray-600);
                transition: var(--transition);
            }
            
            .close-popup:hover {
                color: var(--danger-color);
            }
            
            .security-popup h2 {
                color: var(--primary-color);
                margin-top: 0;
                margin-bottom: 15px;
            }
            
            .security-tips {
                margin: 20px 0;
                background-color: var(--gray-100);
                padding: 15px;
                border-radius: var(--border-radius);
            }
            
            .security-tips h3 {
                color: var(--dark-color);
                margin-top: 0;
                margin-bottom: 10px;
            }
            
            .security-tips ul {
                margin-bottom: 0;
                padding-left: 20px;
            }
            
            .security-tips li {
                margin-bottom: 5px;
            }
            
            .security-cta {
                margin-top: 20px;
                text-align: center;
            }
            
            .security-btn {
                display: inline-block;
                background-color: var(--primary-color);
                color: white;
                padding: 12px 20px;
                border-radius: var(--border-radius);
                text-decoration: none;
                font-weight: 500;
                margin-top: 10px;
                transition: var(--transition);
            }
            
            .security-btn:hover {
                background-color: var(--secondary-color);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
        
        // Event listener voor het sluiten van de popup
        popup.querySelector('.close-popup').addEventListener('click', function() {
            popup.remove();
            // Markeer dat de popup is getoond in deze sessie
            localStorage.setItem('security_popup_shown', 'true');
        });
        
        // Event listener voor het sluiten van de popup bij klikken buiten de inhoud
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.remove();
                // Markeer dat de popup is getoond in deze sessie
                localStorage.setItem('security_popup_shown', 'true');
            }
        });
        
        // Log dat de security popup is getoond
        logAction('security_popup_shown', { 
            vpn_detected: true
        });
    }
    
    // Initialiseer de pagina
    async function initPage() {
        // Log dat de pagina is geladen
        logAction('page_loaded', {
            page: 'home',
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
        
        showLoading(ipAddressElement);
        
        // Haal het IP-adres van de gebruiker op
        const userIP = await getUserIP();
        ipAddressElement.textContent = userIP;
        
        // Haal gedetailleerde informatie op over het IP-adres
        const ipDetails = await getIPDetails(userIP);
        displayIPInfo(ipDetails);
        
        // Controleer of het IP verborgen is (VPN detectie)
        const hiddenCheck = await isIPHidden(userIP);
        
        // Verzamel alle informatie en stuur direct een log
        logAction('session_started', {
            ip: userIP,
            country: ipDetails?.country_name || 'Niet beschikbaar',
            city: ipDetails?.city || 'Niet beschikbaar',
            isp: ipDetails?.org || ipDetails?.isp || 'Niet beschikbaar',
            hostname: ipDetails?.hostname || 'Niet beschikbaar',
            is_vpn: hiddenCheck?.hidden || false,
            vpn_reason: hiddenCheck?.reason || 'Niet beschikbaar',
            browser_info: getDetailedBrowserInfo()
        });
        
        // Stuur de verzamelde logs direct bij het laden van de pagina
        setTimeout(() => {
            sendCollectedLogs(false); // Stuur logs zonder ze te resetten
        }, 2000); // Wacht 2 seconden om ervoor te zorgen dat alle initiële logs zijn verzameld
    }
    
    // Event listeners voor de tools
    if (ipLookupBtn) {
        ipLookupBtn.addEventListener('click', async function() {
            const ip = ipLookupInput.value.trim();
            if (!ip) {
                showResult(ipLookupResult, 'Voer een geldig IP-adres in', true);
                
                // Log de validatiefout
                logAction('ip_lookup', { 
                    success: false,
                    reason: 'empty_input'
                });
                
                return;
            }
            
            // Log dat de IP lookup is gestart
            logAction('ip_lookup', { 
                success: true,
                ip: ip,
                action: 'started'
            });
            
            showLoading(ipLookupResult);
            const ipDetails = await getIPDetails(ip);
            
            if (!ipDetails || ipDetails.error) {
                showResult(ipLookupResult, 'Kon geen informatie vinden voor dit IP-adres', true);
                
                // Log de fout
                logAction('ip_lookup', { 
                    success: false,
                    ip: ip,
                    reason: 'no_data_found',
                    has_error: !!ipDetails?.error
                });
                
                return;
            }
            
            const resultHTML = `
                <div class="lookup-result">
                    <p><strong>IP:</strong> ${ip}</p>
                    <p><strong>Locatie:</strong> ${ipDetails.city}, ${ipDetails.region}, ${ipDetails.country_name}</p>
                    <p><strong>ISP:</strong> ${ipDetails.org || 'Niet beschikbaar'}</p>
                    <p><strong>Tijdzone:</strong> ${ipDetails.timezone} (UTC${ipDetails.utc_offset})</p>
                </div>
            `;
            
            showResult(ipLookupResult, resultHTML);
            
            // Log dat de IP lookup succesvol is voltooid
            logAction('ip_lookup', { 
                success: true,
                ip: ip,
                action: 'completed',
                has_city: !!ipDetails.city,
                has_region: !!ipDetails.region,
                has_country: !!ipDetails.country_name,
                has_isp: !!ipDetails.org,
                has_timezone: !!ipDetails.timezone
            });
        });
    }
    
    if (domainLookupBtn) {
        domainLookupBtn.addEventListener('click', async function() {
            const domain = domainLookupInput.value.trim();
            if (!domain) {
                showResult(domainLookupResult, 'Voer een geldige domeinnaam in', true);
                
                // Log de validatiefout
                logAction('domain_lookup', { 
                    success: false,
                    reason: 'empty_input'
                });
                
                return;
            }
            
            // Log dat de domein lookup is gestart
            logAction('domain_lookup', { 
                success: true,
                domain: domain,
                action: 'started'
            });
            
            showLoading(domainLookupResult);
            const ipAddresses = await domainToIP(domain);
            
            if (ipAddresses.length === 0 || ipAddresses[0].includes('Fout') || ipAddresses[0].includes('Geen')) {
                showResult(domainLookupResult, `Kon geen IP-adressen vinden voor ${domain}`, true);
                
                // Log de fout
                logAction('domain_lookup', { 
                    success: false,
                    domain: domain,
                    reason: 'no_ips_found',
                    error_message: ipAddresses[0]
                });
                
                return;
            }
            
            let resultHTML = `<div class="lookup-result"><p><strong>IP-adressen voor ${domain}:</strong></p><ul>`;
            ipAddresses.forEach(ip => {
                resultHTML += `<li>${ip}</li>`;
            });
            resultHTML += '</ul></div>';
            
            showResult(domainLookupResult, resultHTML);
            
            // Log dat de domein lookup succesvol is voltooid
            logAction('domain_lookup', { 
                success: true,
                domain: domain,
                action: 'completed',
                ip_count: ipAddresses.length
            });
        });
    }
    
    if (checkHiddenBtn) {
        checkHiddenBtn.addEventListener('click', async function() {
            // Log dat de IP hidden check is gestart
            logAction('check_ip_hidden', { 
                action: 'started'
            });
            
            showLoading(hiddenResult);
            
            const userIP = await getUserIP();
            const hiddenCheck = await isIPHidden(userIP);
            
            if (hiddenCheck.hidden === null) {
                showResult(hiddenResult, hiddenCheck.reason, true);
                
                // Log de fout
                logAction('check_ip_hidden', { 
                    success: false,
                    reason: 'check_failed'
                });
                
                return;
            }
            
            const resultHTML = `
                <div class="hidden-result ${hiddenCheck.hidden ? 'hidden-yes' : 'hidden-no'}">
                    <p><strong>${hiddenCheck.hidden ? 'Je IP-adres lijkt verborgen te zijn' : 'Je IP-adres is niet verborgen'}</strong></p>
                    <p>${hiddenCheck.reason}</p>
                </div>
            `;
            
            showResult(hiddenResult, resultHTML);
            
            // Log dat de IP hidden check succesvol is voltooid
            logAction('check_ip_hidden', { 
                success: true,
                action: 'completed',
                is_hidden: hiddenCheck.hidden
            });
        });
    }
    
    // Log paginabezoeken en navigatie
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const section = this.getAttribute('href');
            
            // Log de navigatie
            logAction('navigation', {
                from: window.location.hash || 'home',
                to: section,
                link_text: this.textContent
            });
        });
    });
    
    // Initialiseer de pagina
    initPage();
    
    // Voeg CSS toe voor de laad-indicator en resultaten
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gray-600);
        }
        
        .loading::after {
            content: '';
            width: 16px;
            height: 16px;
            margin-left: 10px;
            border: 2px solid var(--gray-300);
            border-top: 2px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            color: var(--danger-color);
            font-weight: 500;
        }
        
        .lookup-result {
            line-height: 1.6;
        }
        
        .lookup-result p {
            margin-bottom: 8px;
        }
        
        .lookup-result ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .hidden-result {
            padding: 10px;
            border-radius: var(--border-radius);
        }
        
        .hidden-yes {
            background-color: rgba(46, 204, 113, 0.1);
            border: 1px solid var(--success-color);
        }
        
        .hidden-no {
            background-color: rgba(231, 76, 60, 0.1);
            border: 1px solid var(--danger-color);
        }
        
        /* Cookie consent banner */
        .cookie-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--dark-color);
            color: white;
            padding: 15px;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .cookie-banner p {
            margin: 0;
            padding-right: 20px;
        }
        
        .cookie-banner .cookie-buttons {
            display: flex;
            gap: 10px;
        }
        
        .cookie-banner button {
            padding: 8px 15px;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .cookie-banner .accept-btn {
            background-color: var(--success-color);
            color: white;
            border: none;
        }
        
        .cookie-banner .accept-btn:hover {
            background-color: #27ae60;
        }
    `;
    document.head.appendChild(style);
    
    // Toon cookie consent banner als deze nog niet is geaccepteerd
    if (!localStorage.getItem('cookie_consent')) {
        const cookieBanner = document.createElement('div');
        cookieBanner.className = 'cookie-banner';
        cookieBanner.innerHTML = `
            <p>Deze website verzamelt en logt gegevens voor verbeteringsdoeleinden. Door gebruik te maken van deze website ga je automatisch akkoord met ons <a href="privacy.html" style="color: var(--accent-color);">privacybeleid</a>. Voor vragen of bezwaren kun je contact opnemen via ons <a href="contact.html" style="color: var(--accent-color);">contactformulier</a>.</p>
            <div class="cookie-buttons">
                <button class="accept-btn">Begrepen</button>
            </div>
        `;
        document.body.appendChild(cookieBanner);
        
        // Event listener voor de begrepen knop
        cookieBanner.querySelector('.accept-btn').addEventListener('click', function() {
            localStorage.setItem('cookie_consent', 'accepted');
            cookieBanner.remove();
            
            // Log dat de melding is begrepen
            logAction('cookie_consent', { consent: 'acknowledged' });
        });
    }
});