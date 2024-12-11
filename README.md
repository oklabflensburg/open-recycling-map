# Recyclingkarte für Flensburg

[![Lighthouse CI](https://github.com/oklabflensburg/open-recycling-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-recycling-map/actions/workflows/lighthouse.yml)
[![CodeQL](https://github.com/oklabflensburg/open-recycling-map/actions/workflows/codeql.yml/badge.svg)](https://github.com/oklabflensburg/open-recycling-map/actions/workflows/codeql.yml)


![Screenshot Recycling Karte in Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-recycling-map/main/screenshot_recyclingkarte.jpg)


## Hintergrund

Wer kennt es nicht? Man ist frisch umgezogen, hat all seine Habseligkeiten dabei, die sich über die Jahre angesammelt haben. Beim Auspacken und Einräumen tauchen plötzlich Tüten mit ungenutzter Kleidung und alte leere Gläser und Flaschen auf. Doch in der neuen Umgebung stellt sich die Frage: Wo befindet sich der nächstgelegene Recycling Container? Hier kommt unser Stadtplan mit den Standorten der Altglascontainer und Altkleidercontainer zur Hilfe. Diese Situation hat uns dazu inspiriert, eine interaktive Karte mit den Recycling-Containern für Flensburg umzusetzen.


## Datenquelle

Das [TBZ Flensburg](https://tbz-flensburg.de/de/container-altglas) stellt auf deren Seite interaktive Karten mit den Standorten der Alttextilienbehälter und Altglascontainer zur Verfügung. Allerdings fehlt dort sowohl eine Suchfunktion für den nächstgelegenen Recycling-Container. Daher haben wir die Daten in ein modernes, maschinenlesbares Format konvertiert, um eine Weiterverarbeitung zu ermöglichen. Diese Kartendarstellung wird von ehrenamtlichen Mitgliedern des OK Lab Flensburgs entwickelt.


## Mitmachen

Du kannst jederzeit ein Issue auf GitHub öffnen oder uns über oklabflensburg@grain.one schreiben


## Todos

- Fotos der einzelnen Standorte machen und hinzufügen



## Extract Altkleider Container


```sh
python3 retrieve_geometries.py --url https://tbz-flensburg.de/de/container-altglas --category 7 --target ../data/flensburg_alttextilien_container.json --verbose
```


## Extract Altglas Container

```sh
python3 retrieve_geometries.py --url https://tbz-flensburg.de/de/container-altglas --category 8 --target ../data/flensburg_altglas_container.json --verbose
```


---


## How to Contribute

Contributions are welcome! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to get involved.


---


## License

This repository is licensed under [CC0-1.0](LICENSE).
