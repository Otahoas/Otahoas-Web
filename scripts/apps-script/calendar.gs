// Adapted from http://www.shekhargovindarajan.com/google/google-apps-script-automatically-create-calendar-events-from-google-form/
//
// This file is in version control only so the code living in the Apps Script
// editor is not the sole copy. The copy that actually runs is the script bound
// to the reservation spreadsheet. Once calendar handling moves into the otahoas
// repo, this file goes away.
//
// Time-driven trigger: syncCalendar(), every 5 minutes.
// Do NOT add an onEdit trigger: the bot owns these rows.
//
// Columns (header text is Finnish because the sheet is read by the committee):
//    1 Timestamp
//    2 Varauksen status             <- the bot writes it, this script reads it
//    3 Varattava tila
//    4 Tilan käyttäjän nimi
//    5 Tilan käyttäjän yhdistys
//    6 Varaus alkaa
//    7 Varaus päättyy
//    8 Yleinen tilaisuus
//    9 Hyväksyjä
//   10 Käsitelty
//   11 Varaus-ID
//   12 Google Calendar Event ID         <- this script writes it
//   13 Google Calendar General Event ID <- this script writes it
//   14 Kalenterin tila                  <- this script writes it
//
// Column 14 holds the status last pushed to the calendar. A row is synced when
// it differs from column 2. Without it the script could not tell that a status
// changed, because an event id already exists while the booking is pending.
//
// A consequence worth knowing: changing the text this script writes does not
// reach events that are already synced, because their status has not changed.
// To rewrite them, clear column 14 for those rows -- the next pass then finds
// the row unsynced, picks the event up by the id in column 12 and updates it in
// place. Clearing the whole column re-applies the current wording everywhere.

/*
Google Calendar ids per space.
NOTE: the key must match the Payload sheetVenueKey value exactly, or no calendar
is found and no event is created.
*/
var calendarIDs = {
  "JMT 10 CD" : "8095f5b170a29b10110e4da8dc0923d02aa0b3043f6e055786d71c82788d2cf5@group.calendar.google.com",
  "JMT 10 D Soittohuone" : "16035e34c19efa67fa66f1f8884457af8add5ccb39f2714790e3ad391af802ea@group.calendar.google.com",
  "JMT 10 H" : "58aa14fe6d96db437e4c0d8a9050f26faeef53c3875396b43ce44daeddc6888b@group.calendar.google.com",
  "JMT 11 AB" : "e7bd9fdf8ab8e451c98dba79cce0b64fad2a0998cc5a91503ac57bfb7330de07@group.calendar.google.com",
  "JMT 11 B Mekaniikkapaja" : "9720bf94e9c4fd46cf3e927fe49876dbdb12ac56fd60d354030d186c66addd87@group.calendar.google.com",
  "JMT 11 CD" : "71a710d34bdb5be283dd54189a4a8ebfea106992589cafa5b955b8fd2496a554@group.calendar.google.com",
  "SK 5 B" : "3c4bdc034f79728603ad2359acb86e0b66512c550bad7dbe527cd16e2e23bfbd@group.calendar.google.com",
  "SK 6 C Puutyöpaja" : "ee0ce4353c65e96a6603a6446dc2eaebfe0c61930db71252c52e5b0ea9e6f773@group.calendar.google.com",
  "SK 6 D" : "ca1e85eeec45b11b2e17e409f2b9b84dfe475df17e398c466b60cbba3660a199@group.calendar.google.com",
  "SMT 3 A" : "763e63af541e702dbe1c48a1ed71375f6dfe3987a9de4e9e4696e63fb3f88a83@group.calendar.google.com",
  "Kajakit ja SUP-laudat" : "9d5d291ba6dd712c48ff159c4510e2328582ec6f2fc87001716a4579b126e59e@group.calendar.google.com",
  "Lainatavarat" : "51d54f97eff81607487d003994c22d657a509373ae194fb3008e3a7696614c35@group.calendar.google.com",
  "Yleinen" : "96d592b54ada72c9d288a4e8baa98aff6334eec151858557ffb2c14db4793de7@group.calendar.google.com"
};

/*
Sheet values, kept in Finnish because they are compared literally against what
the bot writes and against the sheet's own dropdown.
*/
var bookerIsNotAssociationText = "Ei ole yhdistys";
var eventIsNotGeneralEventText = "Ei ole yleinen tilaisuus";
var pendingStatusText = "Odottaa";
var acceptedStatusText = "Hyväksytty";

/*
Calendar text is English: these calendars are embedded on the public site, which
serves both locales, so an English reader should not meet Finnish labels.

A pending booking has to stand out from a confirmed one at a glance. The title
prefix is what actually carries that: Google Calendar's own "tentative" state
shows up very unreliably for viewers, and CalendarApp cannot set it at all.
*/
var pendingTitlePrefix = "⏳ NOT CONFIRMED: ";
var pendingNoticeText = "This booking is still awaiting approval.";
var userLabel = "User: ";
var approvedByLabel = "Approved by: ";
var locationLabel = "Location: ";

//index (starting from 1) of each column in the sheet
var statusIndex = 2;
var venueIndex = 3;
var bookerIndex = 4;
var associationIndex = 5;
var startDateIndex = 6;
var endDateIndex = 7;
var generalEventIndex = 8;
var approverIndex = 9;
var googleCalendarIndex = 12;
var googleCalendarGeneralEventIndex = 13;
var calendarStateIndex = 14;

/*
Walk the rows and push to the calendar the ones whose status changed since the
calendar was last updated.

Row 1 is the header, hence i starts at 1. A single row's failure must not break
the whole pass, otherwise one broken row would permanently block every row after
it.
*/
function syncCalendar() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    var row = i + 1;
    var status = String(values[i][statusIndex-1]).trim();
    var syncedStatus = String(values[i][calendarStateIndex-1]).trim();

    if (status == "")
      continue;

    if (status == syncedStatus)
      continue;

    try {
      if (!syncRow(sheet, row, status))
        Logger.log("Row " + row + " not synced, will be retried next pass");
    } catch (err) {
      Logger.log("Row " + row + " failed: " + err);
    }
  }
};

/*
Bring one row's calendar events in line with its status.

Odottaa    -> event in the space's calendar, title marked
Hyväksytty -> the same event unmarked, plus a general event if this is a public
              event
anything   -> events removed (Hylätty, Peruttu)
*/
function syncRow(sheet, row, status) {
  var data = getSheetData(sheet, row);
  var done = true;

  if (status == pendingStatusText || status == acceptedStatusText) {
    done = upsertVenueEvent(sheet, row, data, status) && done;

    if (status == acceptedStatusText)
      done = upsertGeneralEvent(sheet, row, data) && done;
    else
      // An unapproved event is not advertised in the shared calendar.
      done = deleteEvent(sheet, row, googleCalendarGeneralEventIndex, 'Yleinen') && done;
  }
  else {
    done = deleteEvent(sheet, row, googleCalendarIndex, data.venue) && done;
    done = deleteEvent(sheet, row, googleCalendarGeneralEventIndex, 'Yleinen') && done;
  }

  // Only claim the row as synced if the calendar really was changed. Marking it
  // regardless would freeze the row forever: a missing calendar id or a bad date
  // would be recorded as success and the event never updated again.
  if (done)
    sheet.getRange(row, calendarStateIndex, 1, 1).setValue(status);

  return done;
};

/*
Look the calendar up by the space name. An unknown or unfilled space is skipped
quietly, so an event never lands in the wrong calendar.
*/
function getCalendar(venue) {
  var calendarId = calendarIDs[venue];

  if (calendarId == null || calendarId == "") {
    Logger.log("No calendar id for space '" + venue + "'");
    return null;
  }

  var cal = CalendarApp.getCalendarById(calendarId);

  if (cal == null)
    Logger.log("Calendar " + calendarId + " not found, or no access to it");

  return cal;
};

/* An event may have been deleted by hand, leaving its id behind. */
function tryGetEvent(cal, eventId) {
  if (eventId == null || eventId == "")
    return null;

  try {
    return cal.getEventById(eventId);
  } catch (err) {
    Logger.log("Event " + eventId + " not found: " + err);
    return null;
  }
};

/*
Create or update the space's own event.

An existing event is updated in place rather than deleted and recreated, so the
event id stays the same and an approval does not look to a calendar viewer like
the booking vanishing and reappearing.
*/
function upsertVenueEvent(sheet, row, data, status) {
  var cal = getCalendar(data.venue);
  if (cal == null)
    return false;

  if (data.title == "" || data.startDate == "" || data.startDate == null) {
    Logger.log("Row " + row + " has no title or start date");
    return false;
  }

  var start = new Date(data.startDate);
  var end = new Date(data.endDate);
  if (start > end) {
    Logger.log("Row " + row + " ends before it starts");
    return false;
  }

  var title = data.title;
  var description = data.description;

  if (status == pendingStatusText) {
    title = pendingTitlePrefix.concat(title);
    description = pendingNoticeText.concat("\n\n", description);
  }

  var eventIdCell = sheet.getRange(row, googleCalendarIndex, 1, 1);
  var event = tryGetEvent(cal, eventIdCell.getValue());

  if (event != null) {
    event.setTitle(title);
    event.setDescription(description);
    event.setTime(start, end);
    return true;
  }

  event = cal.createEvent(title, start, end, {description : description, });
  eventIdCell.setValue(event.getId());

  return true;
};

/* The public event's entry in the shared calendar. */
function upsertGeneralEvent(sheet, row, data) {
  // Not a public event, so there is nothing to do and nothing to retry.
  if (data.generalEventTitle.localeCompare(eventIsNotGeneralEventText) == 0)
    return true;

  var cal = getCalendar('Yleinen');
  if (cal == null)
    return false;

  var start = new Date(data.startDate);
  var end = new Date(data.endDate);
  if (start > end)
    return false;

  var eventIdCell = sheet.getRange(row, googleCalendarGeneralEventIndex, 1, 1);
  var event = tryGetEvent(cal, eventIdCell.getValue());

  if (event != null) {
    event.setTitle(data.generalEventTitle);
    event.setDescription(data.generalEventDescription);
    event.setTime(start, end);
    return true;
  }

  event = cal.createEvent(data.generalEventTitle, start, end, {
    description : data.generalEventDescription,
  });
  eventIdCell.setValue(event.getId());

  return true;
};

/* Delete the event and clear its id, so the row is not left pointing at nothing. */
function deleteEvent(sheet, row, columnIndex, venue) {
  var eventIdCell = sheet.getRange(row, columnIndex, 1, 1);
  var eventId = eventIdCell.getValue();

  // No event recorded, so nothing to remove.
  if (eventId == null || eventId == "")
    return true;

  var cal = getCalendar(venue);

  // Without the calendar the event cannot be removed. Keep the id so a later
  // pass can still delete it once the calendar is configured.
  if (cal == null)
    return false;

  var event = tryGetEvent(cal, eventId);

  if (event != null)
    event.deleteEvent();

  eventIdCell.setValue("");

  return true;
};

/* 
Store the data of a row in an Array
*/
function getSheetData(sheet,row)
{
  var data = new Array();
  
  data.venue = sheet.getRange(row,venueIndex,1,1).getValue();
  data.title = data.venue;
  data.startDate = sheet.getRange(row,startDateIndex,1,1).getValue();
  data.endDate = sheet.getRange(row,endDateIndex,1,1).getValue();
  
  data.booker = nameToInitials(sheet.getRange(row,bookerIndex,1,1).getValue()); // initials only
  data.association = sheet.getRange(row,associationIndex,1,1).getValue();
  data.approver = nameToInitials(sheet.getRange(row,approverIndex,1,1).getValue()); // initials only
  
  data.description = "";
  
  if (data.association.localeCompare(bookerIsNotAssociationText) == 0) {
    data.title = data.title.concat(" (", data.booker, ")");
    data.description = data.description.concat(userLabel, data.booker);
  }
  else {
    data.title = data.title.concat(" (", data.association, ")");
    data.description = data.description.concat(userLabel, data.association, " (", data.booker, ")");
  }

  // The approver is empty for as long as the booking is pending.
  if (data.approver != "")
    data.description = data.description.concat("\n", approvedByLabel, data.approver);
  
  data.generalEventTitle = sheet.getRange(row,generalEventIndex,1,1).getValue();
  data.generalEventDescription = locationLabel.concat(data.venue);
  
  return data; 
};

/*
Shorten names to N.N.

An empty cell returns an empty string. Without that, match() returns null and
join() throws, which would break the whole row.
*/
function nameToInitials(wholeName)
{
  if (wholeName == null || String(wholeName).trim() == "")
    return "";

  var initials = String(wholeName).match(/(^\S)|((\s|-)\S)/g); // beginning of string as well as all whitespaces or dashes followed by any character
  if (initials == null)
    return "";

  initials = initials.join(''); // it was array before this
  initials = initials.replace(/\s/g, "."); // replace whitespaces from previous with dots
  initials = initials.concat("."); // add dot to the end
  initials = initials.toUpperCase();
  return initials;
};
