# Note — Prenotazioni su piattaforme esterne (GetYourGuide e simili)

*Riepilogo di una discussione del 2026-07-11, da riprendere.*

## La domanda di partenza
Mettere Rasna su piattaforme tipo GetYourGuide/Viator, con l'idea che la piattaforma porti traffico al sito Rasna, dove poi il preventivo e il pagamento vengono gestiti manualmente (prezzo variabile in base alle attività scelte, numero ospiti, ecc.).

## Perché GetYourGuide/Viator (e Klook, Airbnb Experiences) non vanno bene per questo modello
Il loro modello di business richiede prenotazione E pagamento **dentro** la loro piattaforma, a prezzo fisso — non accettano listing che rimandano a un sito esterno per un preventivo, perché altrimenti perdono la commissione sulla transazione. Con un prezzo variabile come quello di Rasna, semplicemente non rientriamo nel loro formato.

## Alternative valutate

1. **Google Things to Do / Google Travel** — l'unica opzione gratuita che linka direttamente al sito senza commissioni. Serve aggiungere dati strutturati (schema.org `TouristTrip`/`Offer`) alla pagina + un Google Business Profile. Google mostra poi un pulsante tipo "Check availability" che porta dritto al sito. **Prossimo passo tecnico proposto, non ancora implementato.**

2. **Evaneos** — marketplace pensato apposta per agenzie che vendono viaggi su misura a preventivo (non a prezzo fisso): il cliente chiede, tu quoti, loro prendono commissione solo se si chiude la vendita. Modello più vicino a quello desiderato, ma richiede candidatura/approvazione come operatore — non è una semplice integrazione tecnica.

3. **Listing "vetrina" a prezzo fisso su GYG/Viator** — solo il pacchetto base (es. €1.450, 4 giorni) come prodotto singolo a prezzo fisso venduto interamente dentro la loro piattaforma, mentre il viaggio su misura completo resta sul sito Rasna come upsell. Possibile, ma significa vendere quel pacchetto attraverso di loro (con relativa commissione), non un semplice redirect.

## Nota importante — Partita IVA / aspetti legali (da risolvere col commercialista)
- La soglia di €5.000 spesso citata riguarda i **contributi INPS gestione separata per prestazioni occasionali** (lavoro autonomo isolato, non ripetuto) — **non** è una soglia generale sotto cui si può incassare senza P.IVA.
- Rasna, per come è strutturato (sito, marketing, obiettivo di 15-20 gruppi/anno), è **attività abituale**: per legge la P.IVA serve dal primo euro incassato.
- Vendendo un pacchetto (alloggio + pasti + attività + trasporto per un prezzo unico) si rientra anche nella disciplina dei **pacchetti turistici** (Codice del Turismo, recepimento della direttiva UE 2015/2302): garanzie assicurative contro l'insolvenza e informative precontrattuali obbligatorie dal primo pacchetto venduto, non legate al fatturato.
- Azione consigliata: sentire il commercialista prima di incassare pagamenti reali — eventualmente strutturare il primo viaggio pilota come "rimborso spese" tra amici (già previsto in `BUSINESS_PLAN.md`, Fase 2) finché la parte fiscale non è a posto.

## Stato attuale del sito (`index.html`)
- Form di richiesta preventivo via Formspree (nessun pagamento/calendario integrato) — funziona indipendentemente dalla P.IVA.
- Prezzo pubblicato: €1.450/persona, a partire da 4 giorni, tutto incluso.

## Prossimi passi (da riprendere)
- [ ] Decidere se procedere con i dati strutturati schema.org per Google Things to Do (gratuito, immediato, non richiede P.IVA per essere implementato)
- [ ] Valutare candidatura su Evaneos
- [ ] Sentire il commercialista su P.IVA / pacchetti turistici prima di incassare pagamenti reali
