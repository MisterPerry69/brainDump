# BrainDump web: specifica di design

Fork personale di Karakeep. Questa specifica copre solo l'app web (`apps/web`).
Le bozze approvate sono in `C:\Users\aleda\braindump-design\prove\` (09 = bozza di tutto, 12 = palette finale).

## Obiettivo
Rifare l'aspetto dell'app web nello stile "mappa tattica" approvato. Le cartelle (liste) devono essere sempre visibili e la roba da smistare deve stare in primo piano. La logica di Karakeep va toccata il meno possibile: si cambia la UI e si riusano le query esistenti.

## Palette finale (solo tema scuro per ora)
| ruolo | colore |
|---|---|
| fondo | #262626 |
| testo | #e8efe9 |
| testo spento | #8d9a90 |
| linee / righelli | #c5d9c7 |
| accento (inbox, SALVA, logo) | #f25430 |
| inchiostro sui blocchi | #262626 |
| cartelle, a rotazione | #9fc2cc, #f4d35e, #e9e4d4, #b2d0b8, #f7a1c4 |

Font: Archivo (900 per numeri e nomi), JetBrains Mono per le etichette.
Angoli smussati con clip-path (14 / 8 / 5 px) al posto dei bordi arrotondati.
Effetti: glitch sui numeri grandi, strisce di pericolo, griglia di fondo quasi invisibile, grana. Niente scanline.

## Cosa cambia, in ordine

1. **Tema e nome.** I token shadcn in `tooling/tailwind/globals.css` prendono la palette. Il tema scuro diventa quello predefinito, il raggio va a 0 e i font vengono caricati con `next/font`. Il nome Karakeep diventa BrainDump (titolo, metadata, logo `BD//`). Basta questo perché tutta l'app prenda subito il nuovo aspetto.
2. **Home a mappa** (`/dashboard/bookmarks`). Ha in alto l'HUD e l'input terminale (riuso di `EditorCard`). Il blocco DA_SMISTARE contiene i bookmark non archiviati che non stanno in nessuna lista (`-is:inlist`), con il contatore e il bottone SMISTA. I blocchi delle cartelle sono pesati per numero di elementi e ordinati dal più pieno. Il nastro IN_ARRIVO mostra gli ultimi salvataggi. Sotto la mappa resta la griglia di tutti i bookmark.
3. **Cartella aperta** (`/dashboard/lists/[id]`). A sinistra la colonna delle cartelle a tessere, in alto l'intestazione nel colore della cartella, poi righe uniformi di altezza uguale con i tag. Le cose non aperte da 30 giorni hanno il tratteggio.
4. **Smistamento** (`/dashboard/smista`, nuovo). Mostra una cosa alla volta tra quelle da smistare. Con i tasti 1–9 la sposti nella cartella, [A] archivia, [X] elimina, [→] salta. Sopra c'è il contatore "01 / 07".
5. **Dettaglio.** Rifacimento grafico del pannello di anteprima esistente, con il selettore di cartella in evidenza.

Il colore di una cartella dipende dalla sua posizione nell'ordine (indice % 5). Nessuna modifica al database.

## Fuori da questa specifica
App Android, condivisione da Android, backup, tema chiaro (la "Menta chiara", prova 11 C, viene dopo), cartella suggerita dall'AI, bug della sparizione dalla home (da riprodurre a parte).

## Verifica
- `pnpm typecheck --filter=@karakeep/web` e `pnpm lint` passano.
- L'app gira in locale e gli screenshot di home, cartella e smistamento somigliano alla bozza 09 con la palette 12.
- Lo smistamento da tastiera sposta davvero il bookmark nella lista, e dopo il contatore DA_SMISTARE scende.
