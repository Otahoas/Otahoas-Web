/**
 * Unified seed script for OtaHoas
 *
 * Run with:
 *   pnpm seed              - Seed all content
 *   pnpm seed:clean        - Clear database and re-seed everything
 *   pnpm seed:home         - Only seed the home page
 *
 * In Docker:
 *   docker compose exec dev pnpm seed
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const shouldClean = args.includes('--clean')
const homeOnly = args.includes('--home-only')

// ============================================================================
// BAKED-IN CONTENT DATA (from old site)
// ============================================================================

// Reservation targets from listat.txt
const reservationTargets = [
  {
    emailPrefix: 'jmt10cd',
    labelFi: 'JMT10CD-kerhohuone',
    labelEn: 'JMT10CD club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'jmt10h',
    labelFi: 'JMT10H-kerhohuone',
    labelEn: 'JMT10H club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'jmt11ab',
    labelFi: 'JMT11AB-kerhohuone',
    labelEn: 'JMT11AB club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'jmt11cd',
    labelFi: 'JMT11CD-kerhohuone',
    labelEn: 'JMT11CD club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'smt3',
    labelFi: 'SMT3-kerhohuone',
    labelEn: 'SMT3 club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'sk5b',
    labelFi: 'SK5B-kerhohuone',
    labelEn: 'SK5B club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'sk6d',
    labelFi: 'SK6D-kerhohuone',
    labelEn: 'SK6D club room',
    category: 'club-room' as const,
  },
  {
    emailPrefix: 'jmt11b_mekaniikka',
    labelFi: 'JMT11B-mekaniikkapaja',
    labelEn: 'JMT11B mechanics workshop',
    category: 'workshop' as const,
  },
  {
    emailPrefix: 'sk6c_puu',
    labelFi: 'SK6-puutyöpaja',
    labelEn: 'SK6C wood workshop',
    category: 'workshop' as const,
  },
  {
    emailPrefix: 'jmt10d_soitto',
    labelFi: 'JMT10D-soittohuone',
    labelEn: 'JMT10D music room',
    category: 'music-room' as const,
  },
  {
    emailPrefix: 'jmt11cd_varasto',
    labelFi: 'Muuttolaatikot',
    labelEn: 'Moving boxes',
    category: 'storage' as const,
  },
  {
    emailPrefix: 'jmt11m_kontti',
    labelFi: 'Kajakit ja SUP-laudat',
    labelEn: 'Kayaks and SUP-boards',
    category: 'equipment' as const,
  },
]

// Finnish rules (saannot.txt)
const saannotFi = `Coming in English, in the meantime use a translator

OtaHoas säännöt ja tarkastuslista varattaviin kerhotiloihin

Käy kohdat läpi ja täytä parhaasi mukaan. Ilmoita mieluummin kuin hyvin.
Käy läpi nämä varauksen alussa ja lopussa.
Ilmoita vastaukset näihin ja puutteet ja huomiot TÄSTÄ_LINKISTÄ (tulossa)

Hiljaisuus alkaa arkipäiviä vasten klo 22 ja viikonloppua vasten klo 23.

Säännöt
1. Noudata avaimellisen, asukastoimikunnan jäsenten määräyksiä ja käskyjä ja tilan ohjeita
2. Varaus peruuntuu jos et ole paikalla varauksen alkaessa
3. Sinun on oltava paikalla koko varauksen ajan, poistua saa vain erittäin hetkellisesti pakottavasta syystä. Sinun on oltava viimeinen henkilö tilassa.
4. Tilan ollessa käytössä on siellä aina oltava OtaHoasin asukas tai tilasta vastaavan yhdistyksen henkilö.
5. Lopputarkastus on suoritettava varauksen loppuun mennessä vaikka saisitte jäädä tilaan myöhemmäksi
6. Ole huolellinen käyttäessäsi tilaa ja sen asioita
7. Älä koske tekniikkaan tai johtoihin tai asioihin ilman lupaa ja ohjeita
8. Älä sammuta tekniikkaa jos se oli päällä saapuessasi, poislukien näytöt
9. Älä siirrä hyllyjä yms. huonekaluja poislukien sohvat ja tuolit
10. Jos on kysymyksiä tai huolia tai ongelmia, ota yhteys avaimelliseen tai asukastoimikuntaan
11. Käytä järkeä äänen tuottamisessa, huomioi talon muut asukkaat, kunnioita hiljaisuutta
12. Tilat ja resurssit ovat vain asukkaiden käyttöön. Tiloja ei voi varata tai antaa muun henkilön/yhdistyksen/jne tapahtumaan tai käyttöön.

Alkutarkastus
1. Kerhotila näyttää siistiltä
2. Keittiö näyttää siistiltä
3. Vessa näyttää siistiltä ja siellä on vessapaperia
4. Roskikset eivät ole täynnä
5. Pinnat ovat siistit
6. Käy läpi tilakohtaiset asiat
7. Vahvista avaimelliselle, että asiat ovat ok tai kerro puutteista

Lopputarkastus
1. Siivoa jälkesi, kerhotila ja keittiö, tiskaa ja kuivaa astiat ja laita ne takaisin paikalleen
2. Siirrä tavarat takaisin paikoilleen
3. Sammuta näytöt ja projektorit
4. Vie kaikki tuomasi kerhotilaan kuulumattomat asiat ja ruuat pois
5. Vie kaikki roskat vaikka et olisi täyttänyt roskiksia
6. Sulje kaikki ikkunat
7. Varmista ettei mikro, uuni, hella tai muu keittiöväline jää päälle
8. Sulje kaikki hanat, varmista että vessa ei jää vetämään
9. Käy läpi tilakohtaiset asiat
10. Sammuta kaikki valot
11. Lukitse kaikki ovet
12. Kerro kehitysehdotukset
13. Jos jokin hajosi tai jokin tekstiilipinta oli jossain kohtaa likainen, ilmoita siitä
14. Ilmoita kun poistut tilasta

Tilakohtaiset (tärkeimmät asiat, asukastoimikunta päättää tilan yhdistysten ja avaimellisten mietteiden pohjalta)
1. Sohvat näyttävät siistiltä
2. Tietokoneet ja tekniikka
x. …`

// English rules (rules.txt)
const rulesEn = `OtaHoas rules and checklist for reservable clubrooms

Complete the checklists to the best of your ability. A brief report submitted always beats a perfect report imagined.
Go through the respective checklist at the beginning and at the end of the reservation.
Submit your report, issues and observations through THIS_LINK (coming).

Quiet hours begin at 22:00 on nights preceding weekdays, and at 23:00 on nights preceding weekends.

Rules
1. Adhere to the orders of keyholders, tenant committee members and space-specific instructions
2. The reservation will be canceled if you are not present when the reservation starts
3. You must remain in the space for the entire reservation. Leaving is only permitted out of absolute necessity for a very short period of time. You must be the last person to leave the space.
4. When the space is in use, there must always be an OtaHoas resident present, or a representative of the association responsible for the space.
5. The final inspection checklist must be completed by the end of the reservation, even if you've been permitted to remain in the space for longer.
6. Be mindful when using the space and its contents
7. Don't touch any tech, wires or things without instructions and permission
8. Don't turn off any tech if it was on when you arrived, with the exception of displays
9. Don't move shelves or other furniture, with the exception of chairs and sofas
10. Upon any questions, worries or issues, contact a keyholder or the tenant committee
11. Be smart about noise levels, consider neighboring tenants and respect quiet hours
12. Spaces and resources are solely for the use of tenants. Spaces cannot be reserved or made available for associations' events.

Initial inspection
1. The clubroom looks clean
2. The kitchen looks clean
3. The restroom looks clean and has toilet paper
4. The trash bins are not full
5. Surfaces are clean
6. Go through space-specific considerations
7. Confirm completion of inspection and any observed defects to the keyholder

Final inspection
1. Clean up your traces, the clubroom and the kitchen, wash, dry and put back the dishes
2. Return everything to their original places
3. Turn off displays and projectors
4. Remove all extraneous items and food that you brought to the clubroom
5. Take out all the trash, even if you didn't fill the bins
6. Close all windows
7. Ensure that the oven, stove, microwave or any kitchen appliances aren't left on
8. Close all water taps, ensure that the toilet isn't left flushing continuously
9. Go through space-specific considerations
10. Turn off all lights
11. Lock all doors
12. Share your improvement suggestions
13. If something has broken or a textile surface was soiled at some point, include it in your report
14. Report upon exiting and closing the space

Space-specific considerations (most important ones, tenant committee decides based on feedback from the responsible associations and keyholders)
1. Sofas look clean
2. Computers and tech
x. ...`

// Finnish keyholder rules (avaimellisille.txt)
const avaimellisilleFi = `OtaHoas avaimellisten säännöt ja ohjeet

Avaimelliselle
Nämä säännöt pätevät kaikille avaimellisille
Avaimet ovat vain OtaHoasin asukkaille. Jos muutat pois OtaHoasilta, ole hyvä ja palauta välittömästi avaimesi. Olet myös velvollinen palauttamaan avaimesi missä tahansa tilanteessa, jossa asukastoimikunta niin päättää. Jos et ole tavoitettavissa pitkään aikaan, palauta avain täksi ajaksi OtaHoasille.
Avaimet ovat vain ja ainoastaan henkilökohtaisia, niitä ei saa luovuttaa missään tilanteessa kenellekään muulle paitsi sen hetkisen asukastoimikunnan jäsenelle. Asukastoimikunta päättää kaikista avainten jaoista ja siirroista.
Mikäli kiellosta huolimatta luovutat avaimen kolmannelle osapuolelle, olet täysin vastuussa kaikesta siihen liittyvästä vastuusta, kuten varkauksista, ilkivallasta tai muista väärinkäytöksistä. AVAIMIA EI SAA LUOVUTTAA MUILLE HENKILÖILLE.
Tilojen käytöstä ei saa pyytää tai antaa rahaa.
Sitoudut hoitamaan varauksia asukastoimikunnan päättämällä tavalla ja avaamaan ovia varauksiin. Tällä hetkellä tämä tarkoittaa sähköpostia ja Telegrammia.
Sitoudut tarkastamaan varauksiin liittyvät tilat ja muut tavarat.
Sitoudut ilmoittamaan kaikista ongelma-, vika-, häiriö-, varkaus-, ilkivalta- ja muista väärinkäytöksistä ja -tilanteista asukastoimikunnalle heti, jollet pysty ratkaisemaan niitä itse välittömästi.

Varauksista
Avaimellisena hyväksyt tai hylkäät varauksia seuraavien sääntöjen puitteissa
OtaHoasin resurssit (kerhotilat) ovat vain OtaHoasin asukkaille. Niitä ei saa varata yhdistyksille tai yhdistysten puolesta. Poikkeuksen tähän tekevät yhdistysten perustamiskokoukset, tai jos asukastoimikunta antaa poikkeusluvan.
Pyynnön on oltava muodollisesti pätevä ja pyynnön on tultava sähköpostilistalle ennen sen hyväksymistä. Jos pyyntöä ei tule sähköpostilistalle, ei varausta ole olemassa. Jos pyyntö ei ole pätevä, ei pyyntöä ole olemassa. Avaimellisena voit toki pyytää varaajaa täydentämään pyyntöään samaan sähköpostiketjuun. Lisäksi telegrammin ja loppuajan suhteen pyynnön pätevyydestä joustetaan, mutta jälkimmäisestä pitää ilmoittaa varaajalle sähköpostiketjuun.
Käytä aina "vastaa kaikille" vastaustyyppiä, jotta keskustelu menee sähköpostilistalle ja pyytäjälle. Jos pyytäjä ei käytä tätä, ohjaa viesti tai sen vastaus jossa viestiä lainataan sähköpostilistalle.
KAIKKI VARAUSPYYNNÖT KÄSITELLÄÄN PYYTÄMISJÄRJESTYKSESSÄ.
Jos voit hoitaa varauksen, hyväksy varaus vastaamalla sähköpostiketjuun kaikille. Ilmoita samalla varaajalle mahdollisista muutoksista ja rajoitteista, kuten loppuajan siirtämisestä jne. Jos hyväksyt varauksen ja ilmoitat siitä sähköpostiketjuun, voit siirtää keskustelun halutessasi muuhun viestintävälineeseen.
Voit halutessasi ehdottaa varaajalle avausajan muutosta jos et muuten pääse avaamaan.
Kun olet hyväksynyt varauksen, merkitse se kalenteriin.
Hoida varaus loppuun. Jos jokin estää sinua hoitamasta varausta loppuun, ilmoita siitä välittömästi avaimellisten ryhmässä ja varmista, että asukastoimikunta huomaa tämän. Tärkeintä on viestittää asiat varaajalle selkeästi jos varaus joudutaan perumaan tai jos viestintäkontakti vaihtuu.
Pyri vastaamaan varauksiin heti kun voit. Jos kukaan muu ei ole hoitanut varausta, vastaa viimeistään 7-4 päivää ennen varausta. Kaikkiin pyyntöihin on vähintään 48h tuntia aikaa vastata.
Jokaiseen varaukseen pätee kaikille samat säännöt mitä varauksista on erikseen säädetty varaajalle (otahoas.fi/saannot)

Varauksen pätevyys
Varauspyyntö on pätevä, jos
Pyytäjä asuu OtaHoasilla eikä muuten ole kielletty varaamasta OtaHoasin resursseja.
Pyynnön tiedot eivät ole puuttellisia. Kaikki kentät tulee olla täytettynä hyväksyttävästi. Kaikki ajanmuodot tulee olla Suomen aikamuodossa.
Samalle ajalle ei ole muita aikaisemmin tulleita päteviä varauspyyntöjä.
Pyydetty aikaväli on järkevä, eli se osuu hiljaisuuden ulkopuolelle.
Pyyntö ei ole tarkoitettu jollekkin muulle, kuten yhdistykselle, pyyntö on tarkoitettu OtaHoasin asukkaalle. Varaukset ovat henkilökohtaisia ja henkilökohtaiseen käyttöön. Poikkeusen tähän tekevät OtaHoasin yhteistyöyhdistykset.
Varaus saapuu vähintään 24h ennen pyydettyä ajankohtaa.
Yleisesti henkilöillä voi olla kerrallaan yksi varaus tiloihin, yksi varaus kajakkeihin- ja sup-lautoihin ja yksi varaus muihin resursseihin. Jos resurssiin ei ole muita pyyntöjä 72h ennen pyydettyä ajankohtaa, voi pyytää käyttöön useamman varauksen.

Muut asiat
Avaimellisena voit käyttää tilaa täysin vapaasti silloin kun siellä ei ole varausta. Kun käytät tilaa itse ilman varausta olet vastuussa tilasta ja toiminnasta siellä kuten varauksissa. Jos olet poistumassa eikä tilassa ole ketään muuta avaimellista (riippumatta siitä onko avaimellinen siihen tilaan vai ei), sinun tulee poistaa tilasta avaimettomat henkilöt paitsi jos asukastoimikunnan jäsen antaa poiketa tästä. Tälläisessä tilanteessa voit myös pyytää jotakuta tilassa olevaa OtaHoasin asukasta ottamaan vastuun tilasta. Vastuu tilasta tarkoittaa samaa vastuuta ja sääntöjen seuraamista kuin varauksissa, mutta ilman varauksen oikeuksia päättää yksin tilan käytöstä. Vastuun ottajalla on kuitenkin oikeus kieltää muita uusia avaimettomia tulemasta tilaan.

Mikäli sinulla on kysymyksiä OtaHoasin toiminnasta tai näistä säännöistä ja ohjeista, kysy heti suoraan asukastoimikunnalta tai avaimellisten ryhmässä. Muista myös aktiivisesti jakaa ideoita ja kehitysehdotuksia niin asukastoimikunta voi budjetoida näihin rahaa ja resursseja!

Tärkeintä on, että vapaaehtoisena oleminen ei rasita, ja että kaikilla on hauskaa ja mukavaa.

Kiitos, että olet avaimellinen!

Asukastoimikunta voi muuttaa kaikkea edellä mainittua milloin tahansa ja miten tahansa.`

// English keyholder rules (avaimellisille_en.txt)
const avaimellisille_en = `OtaHoas Keyholder Rules and Instructions

For Keyholders

These rules apply to all keyholders.

Keys are only for OtaHoas residents. If you move out of OtaHoas, please return your key immediately. You are also obligated to return your key in any situation where the residents' committee decides so. If you are unreachable for a long period of time, return the key to OtaHoas for that period.

Keys are strictly personal and must not be handed over to anyone under any circumstances, except to a current member of the residents' committee. The residents' committee decides on all key distributions and transfers.

If, despite the prohibition, you give the key to a third party, you are fully responsible for everything related to it, such as theft, vandalism, or other misuse.

KEYS MUST NOT BE GIVEN TO OTHER PEOPLE.

You may not ask for or give money for the use of the facilities.

You commit to handling reservations in the way decided by the residents' committee and to opening doors for reservations. Currently this means using email and Telegram.

You commit to checking the facilities and any related equipment for reservations.

You commit to reporting any problems, faults, disturbances, theft, vandalism, or other misuse and incidents to the residents' committee immediately, unless you are able to resolve them yourself right away.

About Reservations

As a keyholder, you accept or reject reservations within the following rules:

OtaHoas resources (club rooms) are only for OtaHoas residents. They must not be reserved for associations or on behalf of associations. Exceptions are association founding meetings, or if the residents' committee grants an exception.

A request must be formally valid and must arrive to the email mailing list before it can be approved. If a request does not go to the mailing list, the reservation does not exist. If the request is not valid, the request does not exist.

As a keyholder, you may of course ask the requester to complete their request in the same email thread.

In addition, regarding Telegram and the end time, some flexibility is allowed for the request's validity, but the latter must be communicated to the requester in the email thread.

Always use "reply to all" so that the discussion goes to both the mailing list and the requester. If the requester does not do this, forward the message (or a reply that quotes the message) to the email mailing list.

ALL RESERVATION REQUESTS ARE HANDLED IN THE ORDER THEY ARE RECEIVED.

If you can take care of the reservation, approve it by replying to all in the email thread. At the same time, inform the requester about any changes and restrictions, such as changing the end time, etc.

If you approve the reservation and announce it in the email thread, you may move the discussion to another communication channel if you wish.

You may suggest a change to the opening time if you otherwise cannot be there to open the doors.

Once you have approved the reservation, mark it in the calendar.

Handle the reservation until it is fully completed. If something prevents you from taking care of it until the end, immediately inform the keyholders' group and ensure the residents' committee notices this. The most important thing is to communicate clearly to the requester if the reservation must be cancelled or if the communication contact changes.

Try to respond to reservations as soon as you can. If no one else has handled the reservation, respond at the latest 7–4 days before the reservation. All requests must be answered within at least 48 hours.

All reservations follow the same rules that are separately defined for the reserver (otahoas.fi/saannot).

Reservation Validity

A reservation request is valid if:

The requester lives at OtaHoas and is not otherwise banned from reserving OtaHoas resources.

The request information is not incomplete. All fields must be acceptably filled in.

All time formats must be in Finnish time format.

There are no other earlier valid reservation requests for the same time.

The requested time range is reasonable, meaning it falls outside quiet hours.

The request is not intended for someone else, such as an association; it is intended for an OtaHoas resident.

Reservations are personal and for personal use. An exception is made for OtaHoas partner associations.

The reservation request arrives at least 24 hours before the requested time.

Generally, a person can have one reservation at a time for the facilities, one reservation for kayaks and SUP boards, and one reservation for other resources. If there are no other requests for the resource 72 hours before the requested time, it is possible to request multiple reservations for use.

Other Matters

As a keyholder, you may use the space freely whenever there is no reservation.

When you use the space yourself without a reservation, you are responsible for the space and activities there just like during reservations.

If you are leaving and there are no other keyholders present in the space (regardless of whether they are assigned to that space or not), you must remove non-keyholders from the space unless a member of the residents' committee allows an exception.

In such a situation, you may also ask an OtaHoas resident who is present to take responsibility for the space. Taking responsibility means the same responsibility and following the same rules as during reservations, but without the reservation rights to decide alone how the space is used. However, the responsible person has the right to forbid additional new non-keyholders from entering.

If you have questions about OtaHoas operations or these rules and instructions, ask immediately directly from the residents' committee or in the keyholders' group.

Also remember to actively share ideas and development suggestions so the residents' committee can budget money and resources for them!

The most important thing is that being a volunteer is not burdensome, and that everyone has fun and feels comfortable.

Thank you for being a keyholder!

The residents' committee can change anything stated above at any time and in any manner.`

// Spaces content (tilat.txt)
const tilatFi = `OtaHoasin tilat

Miestentie 2 - MT2
	Kuntosali ja kuntosalivarusteita
	Maksimissaan 6 henkilöä
		Seisten 6
	Ei varattavissa, vapaasti käytettävä

Servinmaijantie 3 - SMT3
	Tilassa kovia pöytiä, penkkejä ja baaripöytä
	Ei kunnollista keittiötä
	Vessa käytävällä

Servinkuja 6 D - SK6D
	Pelitila
	Maksimissaan 20 henkilöä
		Seisten 20
	Vessa käytävällä
	Sisustus kesken
	Kehityksen alla
	Biljardi
	Ilmakiekko

Servinkuja 6 Puupaja - SK6PUU
	Puun työstämiseen ja puun kanssa työskentelyyn
	Maksimissaan 2 henkilöä
		Seisten 2

Servinkuja 5 B - SK5B
	Yksinkertainen hengailutila
	Maksimissaan 10 henkilöä
		Istuen 6
	Vessa
	Pieni keittiö

Jämeräntaival 10 B - JMT10B
	Tulossa

Jämeräntaival 10 CD - JMT10CD
	Mukava hengailutila leffan katsomiseen, pieniin juhliin, animeen ja mangaan, konsolipelailuun
	Yhdistyksen Otakut
	Maksimissaan 10 henkilöä
		Istuen 8
		Näyttöä kohti 6
	Pieni keittiö ja ruokailuvälineitä
	Vessa
	Ei ruokapöytää
	Konsoleita ja pelejä
	Videotykki

Jämeräntaival 10 D Soittohuone - JMT01DSOITTO
	Pieni ääniä vaimentava huone lauluun ja soittoob
	Maksimissaan 4 henkilöä
		Seisten 4

Jämeräntaival 10 H - JMT10H
	Yksinkertainen hengailutila, pieniin juhliin
	Yhdistyksenä Fyysikkospeksi
	Maksimissaan 15 henkilöä
		Istuen 10
	Pieni keittiö ja ruokailuvälineitä
	Ruokapöytä

Jämeräntaival 11 AB - JMT11AB
	Avara hengailutila leffan katsomiseen, juhliin
	Yhdistyksenä BEST
	Maksimissaan 20 henkilöä
		Istuen näytön edessä 6
		Pöydän ympärillä 8
	Keittiö ja ruokailuvälineitä
	Pöytä
	Vessa
	Videotykki

Jämerätanvaila 11 B Mekaniikkapaja - JMT11BMEKANIIKKA
	Metallin kanssa työskentelyyn ja metallin työstämiseen, pyörien huoltoon
	Maksimissaan 3 henkilöä
		Seisten 3

Jämeräntavaila 11 CD - JMT11CD
	Tietokonepelitila
	Yhdistyksenä Polygame
	Maksimissaan 15 henkilöä
		Istuen näyttöä kohti 9
		Pelikoneita 6
	Ei pöytää
	Keittiö
	Vessa
	Videotykki

Jämeräntaival 11 M Kontti - JMT11M Kontti
	Kajakit
	SUP-laudat`

// Committee members - replace with actual data
const committeeMembers = [
  { name: 'Member 1', title: 'Puheenjohtaja', telegram: null },
  { name: 'Member 2', title: 'ASY', telegram: null },
  { name: 'Member 3', title: null, telegram: null },
  { name: 'Member 4', title: null, telegram: null },
  { name: 'Member 5', title: null, telegram: null },
  { name: 'Member 6', title: null, telegram: '@username' },
]

// Telegram channels - replace with actual invite links
const telegramChannels = [
  { name: 'Otahoas', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'Otahoas tiedotus / announcements', url: 'https://t.me/REPLACE_WITH_CHANNEL' },
  { name: 'JMT9', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'JMT10', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'JMT11', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'SMT3', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'SK56', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'MT2A', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
  { name: 'Urheiluvälineet / Sports stuff', url: 'https://t.me/+REPLACE_WITH_INVITE_LINK' },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Convert plain text to Lexical rich text format
const textToLexical = (text: string) => {
  const paragraphs = text.split('\n\n')

  return {
    root: {
      type: 'root',
      children: paragraphs
        .map((para) => {
          const lines = para.split('\n')

          // Check if it's a numbered list
          const isNumberedList = lines.every(
            (line) => /^\d+\./.test(line.trim()) || line.trim() === '',
          )

          if (isNumberedList && lines.some((line) => /^\d+\./.test(line.trim()))) {
            return {
              type: 'list',
              listType: 'number',
              children: lines
                .filter((line) => /^\d+\./.test(line.trim()))
                .map((line) => ({
                  type: 'listitem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          text: line.replace(/^\d+\.\s*/, '').trim(),
                        },
                      ],
                    },
                  ],
                })),
            }
          }

          // Check if it's a heading (short line, no punctuation at end)
          const isHeading = para.length < 80 && !para.endsWith('.') && !para.includes('\n')

          if (isHeading) {
            return {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: para.trim(),
                },
              ],
            }
          }

          // Regular paragraph
          return {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: para.replace(/\n/g, ' ').trim(),
              },
            ],
          }
        })
        .filter((node) => {
          // Filter out empty paragraphs
          if (node.type === 'paragraph') {
            const first = node.children?.[0]
            const text =
              first &&
              typeof first === 'object' &&
              'text' in first &&
              typeof (first as any).text === 'string'
                ? (first as any).text
                : ''

            return text.trim().length > 0
          }
          return true
        }),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

// Upload logo and return media doc
const uploadLogo = async (payload: any) => {
  // Check if logo already exists
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'otahoas.png' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return existing.docs[0]
  }

  // Read logo file
  const logoPath = path.resolve(process.cwd(), 'public/otahoas.png')
  if (!fs.existsSync(logoPath)) {
    payload.logger.warn('Logo file not found at public/otahoas.png')
    return null
  }

  const logoData = fs.readFileSync(logoPath)

  const logoDoc = await payload.create({
    collection: 'media',
    data: {
      alt: 'OtaHoas logo',
    },
    file: {
      name: 'otahoas.png',
      data: Buffer.from(logoData),
      mimetype: 'image/png',
      size: logoData.byteLength,
    },
  })

  payload.logger.info('Uploaded OtaHoas logo')
  return logoDoc
}

// Seed reservation targets
const seedReservationTargets = async (payload: any) => {
  payload.logger.info('Seeding reservation targets...')

  // Delete existing targets
  try {
    await payload.delete({
      collection: 'reservation-targets',
      where: {},
    })
  } catch (e) {
    // Collection might be empty
  }

  let sortOrder = 1
  for (const target of reservationTargets) {
    await payload.create({
      collection: 'reservation-targets',
      data: {
        emailPrefix: target.emailPrefix,
        labelFi: target.labelFi,
        labelEn: target.labelEn,
        category: target.category,
        active: true,
        sortOrder: sortOrder++,
        telegramTopicId: '1',
      },
    })
    payload.logger.info(`Created target: ${target.emailPrefix}`)
  }

  payload.logger.info(`Seeded ${reservationTargets.length} reservation targets`)
}

// Seed content pages
const seedContentPages = async (payload: any) => {
  payload.logger.info('Seeding content pages...')

  const pages = [
    {
      slug: 'saannot',
      fi: { title: 'Säännöt', content: saannotFi },
      en: { title: 'Rules', content: rulesEn },
    },
    {
      slug: 'avaimellisille',
      fi: { title: 'Avaimellisille', content: avaimellisilleFi },
      en: { title: 'For Key Holders', content: avaimellisille_en },
    },
    {
      slug: 'tilat',
      fi: { title: 'Tilat', content: tilatFi },
      en: { title: 'Spaces', content: tilatFi },
    },
    {
      slug: 'kayttopyynto',
      fi: {
        title: 'Käyttöpyyntö',
        blocks: [
          {
            blockType: 'accessRequestForm',
            language: 'fi',
            rulesPageLink: '/saannot',
            calendarLink: '/kalenteri',
          },
        ],
      },
      en: {
        title: 'Access Request',
        blocks: [
          {
            blockType: 'accessRequestForm',
            language: 'en',
            rulesPageLink: '/saannot',
            calendarLink: '/kalenteri',
          },
        ],
      },
    },
    {
      slug: 'kalenteri',
      fi: {
        title: 'Kalenteri',
        blocks: [
          {
            blockType: 'calendarEmbed',
            title: 'OtaHoas Kalenteri',
            language: 'fi',
            height: 600,
            calendarUrl: 'https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID',
          },
        ],
      },
      en: {
        title: 'Calendar',
        blocks: [
          {
            blockType: 'calendarEmbed',
            title: 'OtaHoas Calendar',
            language: 'en',
            height: 600,
            calendarUrl: 'https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID',
          },
        ],
      },
    },
  ]

  for (const pageData of pages) {
    // Check if page already exists
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageData.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`Page ${pageData.slug} already exists, skipping...`)
      continue
    }

    // Build Finnish layout
    const layoutFi: any[] = []
    if ((pageData.fi as any).content) {
      layoutFi.push({
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: textToLexical((pageData.fi as any).content),
          },
        ],
      })
    }
    if ((pageData.fi as any).blocks) {
      layoutFi.push(...(pageData.fi as any).blocks)
    }

    // Create page with Finnish content first
    const createdPage = await payload.create({
      collection: 'pages',
      locale: 'fi',
      draft: false,
      data: {
        title: pageData.fi.title,
        slug: pageData.slug,
        layout: layoutFi,
        _status: 'published',
      } as any,
      context: { disableRevalidate: true },
    })

    // Build English layout
    const layoutEn: any[] = []
    if ((pageData.en as any).content) {
      layoutEn.push({
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: textToLexical((pageData.en as any).content),
          },
        ],
      })
    }
    if ((pageData.en as any).blocks) {
      layoutEn.push(...(pageData.en as any).blocks)
    }

    // Update with English content
    await payload.update({
      collection: 'pages',
      id: createdPage.id,
      locale: 'en',
      data: {
        title: pageData.en.title,
        layout: layoutEn,
      },
      context: { disableRevalidate: true },
    })

    payload.logger.info(`Created page: ${pageData.slug}`)
  }
}

// Home page content for OtaHoas
const createHomePage = async (payload: any) => {
  // Upload logo first
  const logoDoc = await uploadLogo(payload)

  // Check if home page already exists
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    payload.logger.info('Home page already exists, skipping...')
    return existing.docs[0]
  }

  // Finnish content
  const layoutFi = [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h1',
                  children: [{ type: 'text', text: 'Tervetuloa OtaHoasille!' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'OtaHoas on Otaniemen asukastoimikunta, joka hallinnoi kerhohuoneita ja muita asukkaiden yhteisiä tiloja.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'half',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'Tilojen varaaminen' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Voit varata tiloja täyttämällä käyttöpyyntölomakkeen. Muista lukea säännöt ennen varauksen tekemistä.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          size: 'half',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'Avaimellisille' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Jos sinulla on jo avain, tutustu avaimellisten ohjeisiin ja sääntöihin.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    {
      blockType: 'committee',
      title: 'Toimikunta',
      description:
        'OtaHoas-toimikunnan jäsenet valitaan vuosittain asukkaiden kokouksessa. Toimikunnan jäsenet 2026 ovat:',
      members: committeeMembers.map((m) => ({
        name: m.name,
        title: m.title,
        telegram: m.telegram,
        image: null,
      })),
    },
    {
      blockType: 'contactInfo',
      title: 'Yhteystiedot',
      email: 'contact@example.com',
      telegramChannels: telegramChannels,
    },
  ]

  // English content
  const layoutEn = [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h1',
                  children: [{ type: 'text', text: 'Welcome to OtaHoas!' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'OtaHoas is the Otaniemi resident committee that manages club rooms and other shared spaces for residents.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'half',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'Booking Spaces' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'You can book spaces by filling out the access request form. Remember to read the rules before making a reservation.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          size: 'half',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'For Key Holders' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'If you already have a key, check out the instructions and rules for key holders.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    {
      blockType: 'committee',
      title: 'Committee',
      description:
        "OtaHoas committee members are elected annually at the residents' meeting. The committee members for 2026 are:",
      members: committeeMembers.map((m) => ({
        name: m.name,
        title: m.title,
        telegram: m.telegram,
        image: null,
      })),
    },
    {
      blockType: 'contactInfo',
      title: 'Contact Information',
      email: 'contact@example.com',
      telegramChannels: telegramChannels,
    },
  ]

  // Create Finnish version first
  const homePage = await payload.create({
    collection: 'pages',
    locale: 'fi',
    data: {
      title: 'OtaHoas',
      slug: 'home',
      _status: 'published',
      layout: layoutFi,
    },
    context: {
      disableRevalidate: true,
    },
  })

  // Add English version
  await payload.update({
    collection: 'pages',
    id: homePage.id,
    locale: 'en',
    data: {
      title: 'OtaHoas',
      layout: layoutEn,
    },
    context: {
      disableRevalidate: true,
    },
  })

  payload.logger.info('Created home page with Finnish and English content')
  return homePage
}

// Clear all content
const clearDatabase = async (payload: any) => {
  payload.logger.info('Clearing database...')

  const collections = [
    'pages',
    'posts',
    'media',
    'forms',
    'form-submissions',
    'categories',
    'search',
    'reservation-targets',
    'meeting-documents',
  ]

  for (const collection of collections) {
    try {
      await payload.delete({
        collection,
        where: {},
      })
      payload.logger.info(`Cleared collection: ${collection}`)
    } catch (e) {
      // Collection might not exist, that's ok
    }
  }

  // Clear globals
  const globals = ['header', 'footer']
  for (const global of globals) {
    try {
      await payload.updateGlobal({
        slug: global,
        data: { navItems: [] },
        context: { disableRevalidate: true },
      })
    } catch (e) {
      // Global might not exist or revalidation error
    }
  }

  payload.logger.info('Database cleared')
}

// Setup navigation with localized labels using page references
const setupNavigation = async (payload: any) => {
  payload.logger.info('Setting up navigation...')

  // Find pages by slug to get their IDs for references
  const pageSlugs = ['tilat', 'saannot', 'kayttopyynto', 'avaimellisille']
  const pageMap: Record<string, number> = {}

  for (const slug of pageSlugs) {
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (result.docs.length > 0) {
      pageMap[slug] = result.docs[0].id
    }
  }

  // Helper to create reference link
  const createRefLink = (pageSlug: string, labelFi: string, labelEn: string) => ({
    fi: {
      link: {
        type: 'reference',
        reference: { relationTo: 'pages', value: pageMap[pageSlug] },
        label: labelFi,
        newTab: false,
      },
    },
    en: {
      link: {
        type: 'reference',
        reference: { relationTo: 'pages', value: pageMap[pageSlug] },
        label: labelEn,
        newTab: false,
      },
    },
  })

  const navLinks = [
    createRefLink('tilat', 'Tilat', 'Spaces'),
    createRefLink('saannot', 'Säännöt', 'Rules'),
    createRefLink('kayttopyynto', 'Käyttöpyyntö', 'Access Request'),
    createRefLink('avaimellisille', 'Avaimellisille', 'For Key Holders'),
  ]

  const navItemsFi = navLinks.map((link) => link.fi)
  const navItemsEn = navLinks.map((link) => link.en)

  try {
    // Set Finnish header
    await payload.updateGlobal({
      slug: 'header',
      locale: 'fi',
      data: { navItems: navItemsFi },
      context: { disableRevalidate: true },
    })

    // Set English header
    await payload.updateGlobal({
      slug: 'header',
      locale: 'en',
      data: { navItems: navItemsEn },
      context: { disableRevalidate: true },
    })

    payload.logger.info('Header updated with Finnish and English nav items')
  } catch (e) {
    payload.logger.info('Header update error (may be revalidation related)')
  }

  try {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
              newTab: false,
            },
          },
        ],
      },
      context: { disableRevalidate: true },
    })
  } catch (e) {
    payload.logger.info('Footer update error (may be revalidation related)')
  }

  payload.logger.info('Navigation setup complete')
}

async function main() {
  console.log('🌱 Starting OtaHoas seed...')
  console.log(`   Clean mode: ${shouldClean}`)
  console.log(`   Home only: ${homeOnly}`)

  const payload = await getPayload({ config })

  try {
    if (shouldClean) {
      await clearDatabase(payload)
    }

    // Always create home page
    await createHomePage(payload)

    if (!homeOnly) {
      // Seed reservation targets
      await seedReservationTargets(payload)

      // Seed content pages
      await seedContentPages(payload)

      // Setup navigation
      await setupNavigation(payload)
    }

    console.log('✅ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
