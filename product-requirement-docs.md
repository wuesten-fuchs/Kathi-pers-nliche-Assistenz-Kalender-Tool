### ✅ Ziel des Tools

- Erstellen eines monatlichen Schicht- und Bereitschaftsplans auf Basis der Verfügbarkeiten der Assistent:innen  
- Einfache Prototyp-Version (MVP), die im Browser läuft und manuelle Drag-and-Drop-Anpassungen erlaubt  

### 🧩 Eingabedaten

1. **Verfügbarkeiten**: CSV-Datei mit den Verfügbarkeiten der Assistent:innen für den kommenden Monat im Format `YYYY-MM-DD`  
2. **Dienstwunsch**: In den Namen steht in Klammern, wie viele Dienste die Person übernehmen möchte und üblicherweise übernimmt, z. B. `Maria (3-4/3-4)`  
3. **Stundenkonto** (optional): Datei mit aktuellem Über- oder Unterstundenstand der Assistent:innen  
4. **Besondere Wünsche** (optional): Vorgaben wie „Person X an Tag Y“ oder „zwei Dienste hintereinander“  

### 📅 Ausgabeformat (im Browser)

- **Horizontale Kalenderansicht**: 01.06., 02.06., …, scrollbar von links nach rechts  
- **Spalten**: Jeder Kalendertag ist eine eigene Spalte  
  - Zeile 1: Hauptdienst (Schicht)  
  - Zeile 2: Bereitschaft (Backup)  
- **Drag-and-Drop** zum Verschieben von Assistent:innen zwischen Tagen und Rollen  
- **Farbliche Markierung**: Jede Person erhält eine feste Farbe zur schnellen Orientierung  

### 🧠 Planungslogik

1. Pro Tag wird **eine** Person für die Schicht und **eine andere** Person für die Bereitschaft eingeplant  
2. Niemand darf am selben Tag Schicht **und** Bereitschaft übernehmen  
3. Nur Personen, die an einem Tag verfügbar sind, dürfen eingeteilt werden  
4. Dienste werden möglichst gleichmäßig verteilt (Rotation)  
5. Das Wunsch- und Übliches-Pensum in Klammern darf nicht überschritten werden  
6. Bei mehrtägigen Abwesenheiten des Auftraggebers (z. B. fünf Tage unterwegs) soll möglichst **eine** Assistenz diese Tage komplett übernehmen. Über- oder Unterstunden können anschließend im Folgemonat ausgeglichen werden.  

### ⏱️ Stundenkontingente und Überstunden

- Für jede Assistenz gibt es ein monatliches Soll-Stundenkontingent  
- Das Tool erfasst **geplante** und **tatsächliche** Stunden und bildet daraus Über- bzw. Unterstunden  
- Ein importierbares CSV kann Startstände aus Vormonaten enthalten  
- Über- oder Unterstunden werden als offenes Stundenkonto fortgeführt und können im Folgemonat berücksichtigt werden  
- Für das MVP genügt es, nur den **aktuellen Monat** zu planen und den bestehenden Stundenstand zu verwenden. Auswertungen für Vormonate sind als spätere Erweiterung vorgesehen.  

### ⚠️ Zusätzliche Regelprüfung

- Wird eine Person an weniger als drei Tagen pro Woche als verfügbar angegeben, soll dies erkannt und markiert werden  
- Wochen gelten von Montag bis Sonntag  
- Personen mit hohem Überstundenstand können bevorzugt eingeplant werden, um Stunden abzubauen  

### 🔜 Geplante Erweiterungen

- Rückblickende Auswertungen: Alle Stundenkonten und Dienste monatsübergreifend analysieren  
- Automatisierte Empfehlung, welche Assistenz bei Über- oder Unterdeckung eingespannt werden sollte  
- Exportfunktionen (PDF, CSV) für Dienstplan und Stundenkonten  

📂 CSV-Dateistruktur

Spalte 1 – Assistant: Zeichenkette. Enthält den Namen der Assistenzkraft. Optional in Klammern: Wunsch- und übliches Dienstpensum, z. B. Maria (3-4/3-4).

Spalte 2 … n – YYYY-MM-DD: Eine Spalte pro Kalendertag des Monats im ISO-Format. Einträge sind Verfügbarkeits-Statuswerte:

Yes – Person ist verfügbar

No – Person ist nicht verfügbar

Under reserve – Person kann als Bereitschaft einspringen

Unknown – Verfügbarkeit nicht geklärt

Letzte Spalte (optional): Leer; kann ignoriert werden.
