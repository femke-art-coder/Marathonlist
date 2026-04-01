// ── KONFIGURATION ──────────────────────────────────────────
const SUPABASE_URL = 'https://zznkbvcwhgqxgrakqewp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eiF7sdMyOQvUpJtsIvifqA_ztcxqHP2'; // Dein Key von oben

// ── 1. FUNKTION: LISTE AUSLESEN & ANZEIGEN ──────────────────
async function ladeMarathons() {
    const listContainer = document.getElementById('list');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/marathons?select=*&order=created_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) throw new Error('Fehler beim Laden');

        const data = await response.json();

        if (data.length === 0) {
            listContainer.innerHTML = '<p>Noch keine Läufe im Katalog.</p>';
            return;
        }

        // Hier bauen wir die Karten für die Liste
        listContainer.innerHTML = data.map(lauf => `
            <div class="entry-card">
                <strong>${lauf.name}</strong>
                <div class="card-meta">
                    📍 ${lauf.ort || 'Unbekannt'} | 📅 ${lauf.datum || 'Kein Datum'}
                </div>
                <div class="card-details">
                    Distanz: ${Array.isArray(lauf.distanzen) ? lauf.distanzen.join(', ') : (lauf.distanzen || '-')} <br>
                    Preis: ${lauf.kosten_frueh ? lauf.kosten_frueh + '€' : 'k.A.'}
                </div>
                <p><em>${lauf.besonderheiten || ''}</em></p>
            </div>
        `).join('');

    } catch (err) {
        listContainer.innerHTML = '<p>Fehler beim Aktualisieren der Liste.</p>';
        console.error(err);
    }
}

// ── 2. FUNKTION: FORMULAR ABSENDEN (EINTRAGEN) ──────────────
document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const msg = document.getElementById('msg');

    // Distanzen (Checkboxes) einsammeln
    const distanzen = [...document.querySelectorAll('input[name=distanzen]:checked')].map(el => el.value);

    // Das "Payload"-Paket schnüren (Exakt wie in deinem Entwurf)
    const payload = {
        name: fd.get('name')?.trim(),
        datum: fd.get('datum') || null,
        plz: fd.get('plz') || null,
        ort: fd.get('ort') || null,
        distanzen: distanzen.length ? distanzen : null,
        level: fd.get('level') || null,
        kosten_frueh: num(fd.get('kosten_frueh')),
        kosten_spaet: num(fd.get('kosten_spaet')),
        hm: num(fd.get('hm')),
        untergrund: fd.get('untergrund') || null,
        dlv: fd.get('dlv') === 'on',
        zeitlimit: fd.get('zeitlimit') || null,
        teilnehmerlimit: num(fd.get('teilnehmerlimit')),
        anmeldeschluss: fd.get('anmeldeschluss') || null,
        verpflegung: fd.get('verpflegung') || null,
        besonderheiten: fd.get('besonderheiten') || null,
        vibe: fd.get('vibe') || null,
    };

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/marathons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());

        // Erfolg melden
        showMsg('🎉 Danke! Der Lauf wurde eingetragen.', true);
        e.target.reset();

        // Liste nach dem Eintragen sofort neu laden
        ladeMarathons();

    } catch (err) {
        showMsg('Fehler beim Speichern: ' + err.message, false);
    }
});

// ── HILFSFUNKTIONEN ────────────────────────────────────────

function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}

function showMsg(text, ok) {
    const el = document.getElementById('msg');
    el.textContent = text;
    el.className = ok ? 'ok' : 'err';
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initial beim Laden der Seite die Liste füllen
ladeMarathons();
