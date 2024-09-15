# Opis projekta

---

Projekt je zamišljen kao aplikacija koja služi kao pomoćni alat
pri poslovnom procesu vođenja kafića/café bar-a.
Aplikacija pruža intuitivan uvid u unesene podatke za kafić 
i olakšava vođenje poslovnog procesa, te omogućava analizu podataka
(na osnovu čega možemo donijeti bolje poslovne odluke)

# Funkcionalnosti

---

- Dodavanje novih proizvoda
- Uređivanje postojećih proizvoda
- Brisanje postojećih proizvoda
- Automatizirano bilježenje izvještaja o promjeni količine proizvoda na stanju
- Analiza i vizualizacija podataka

# Pokretanje aplikacije

---

## Preuzimanje projekta

Kako bismo preuzeli projekt trebamo klonirati Git repozitorij projekta, 
a to možemo učiniti na sljedeći način:

>1. Otvoriti terminal (CMD, Powershell, ...)
>2. Postaviti željenu putanju gdje ćemo preuzeti mapu projekta, npr. <br/>
`cd ~/Desktop`
>3. Pokrenuti naredbu za kloniranje Git repozitorija <br/>
`git clone https://github.com/domc00/bar_manager`

## Uspostavljanje dockera

>4. Pokrenite Docker Desktop aplikaciju koju možete preuzeti ovdje: <br/>
>[Docker Desktop](https://www.docker.com/products/docker-desktop/)
>5. Nakon preuzimanja projekta i pokretanja docker aplikacije potrebno je u terminalu ući u root direktorij projekta <br/>
>`cd bar_manager` <br/>
> *(ako nekim slučajem niste već na nivou iznad direktorija - upišite cijelu putanju, npr.)* <br/>
>`cd C:\cijela\putanja\do\projekta\bar_manager` <br/><br/>
>(*Ako koristite linux, sljedeće naredbe pokrenite sa **sudo** privilegijama*)
>6. Pokrenite naredbu za kreiranje docker image-a prema uputama iz Dockerfile-a <br/>
>`docker build --tag bar_manager:1.0 .`
>7. Pokrenite naredbu za otvaranje docker container-a u kojem će se izvoditi aplikacija <br/>
>`docker run -p 5001:8080 bar_manager:1.0`

Nakon ovih koraka bi se trebala pokrenuti aplikacija u izoliranom okruženju na port-u 5001: <br/>
[localhost:5001](http://localhost:5001/)