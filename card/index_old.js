// without Babel in ES2015

const notifier = require('node-notifier');
const nc = new notifier.NotificationCenter();

const { NFC } = require("nfc-pcsc");
const nfc = new NFC(); // optionally you can pass logger
const nfcCard = require("nfccard-tool");

//var Popups = require('popups');
// ""

const Say = require("say").Say;
const say = new Say("darwin" || "win32" || "linux");
//ACS ACR122U PICC Interface  device attached

const delay = async (v) =>
  new Promise((r) => {
    setTimeout(r, v);
  });

nfc.on("reader", (reader) => {
  console.log(`${reader.reader.name}  device attached`);

  // enable when you want to auto-process ISO 14443-4 tags (standard=TAG_ISO_14443_4)
  // when an ISO 14443-4 is detected, SELECT FILE command with the AID is issued
  // the response is available as card.data in the card event
  // see examples/basic.js line 17 for more info
  // reader.aid = 'F222222222';

  //reader.on("card", (card) => {
    // card is object containing following data
    // [always] String type: TAG_ISO_14443_3 (standard nfc tags like MIFARE) or TAG_ISO_14443_4 (Android HCE and others)
    // [always] String standard: same as type
    // [only TAG_ISO_14443_3] String uid: tag uid
    // [only TAG_ISO_14443_4] Buffer data: raw data from select APDU response

    //console.log(`${reader.reader.name}  card detected`, card);
  //});
  //
  //https://agape-studio.reunite.digital/
  //

  reader.on("card", async (card) => {
    //console.log();
    console.log(`Card detected`);

    // // example reading 12 bytes assuming containing text in utf8
    // try {
    //   // reader.read(blockNumber, length, blockSize = 4, packetSize = 16)
    //   const data = await reader.read(4, 12); // starts reading in block 4, continues to 5 and 6 in order to read 12 bytes
    //   console.log(`data read`, data);
    //   const payload = data.toString(); // utf8 is default encoding
    //   console.log(`data converted`, payload);
    // } catch (err) {
    //   console.error(`error when reading data`, err);
    // }

    // // example write 12 bytes containing text in utf8
    // try {
    //   const data = Buffer.allocUnsafe(12);
    //   data.fill(0);
    //   const text = new Date().toTimeString();
    //   data.write(text); // if text is longer than 12 bytes, it will be cut off
    //   // reader.write(blockNumber, data, blockSize = 4)
    //   await reader.write(4, data); // starts writing in block 4, continues to 5 and 6 in order to write 12 bytes
    //   console.log(`data written ${data}`);
    // } catch (err) {
    //   console.error(`error when writing data`, err);
    // }

    // Starts reading in block 0 for 20 bytes long

    let urlToWrite = `https://vcard.waptechy.com/setiamovers`;
    // 1 - READ HEADER
    // try {
    //   say.speak("HOLD THE CARD");
    //   await delay(800);
    //   await readCard({
    //     reader,
    //   });
    // } catch (e) {
    //   console.log("cannot init read", e);

    //   try {
    //     await writeCard({
    //       reader,
    //       url: urlToWrite,
    //     });
    //     await ensureRecord({
    //       reader,
    //       url: urlToWrite,
    //     });
    //   } catch (e) {
    //     console.log("error", e);
    //     say.speak("ERROR, RELEASE AND TRY AGAIN");
    //     return;
    //   }
    //   return;
    // }

    try {
      await writeCard({
        reader,
        url: urlToWrite,
      });
    } catch (e) {
      console.log("error", e);
      say.speak("CANNOT CONFIRM");
      return;
    }

    // try {
    //   await ensureRecord({
    //     reader,
    //     url: urlToWrite,
    //   });
    // } catch (e) {
    //   console.log("error", e);
    //   say.speak("CANNOT WRITE");
    //   return;
    // }
    //
  });

  reader.on("card.off", (card) => {
    //console.log(`${reader.reader.name}  card removed`, card);
    console.log("Card removed");
  });

  reader.on("error", (err) => {
    console.log(`${reader.reader.name}  an error occurred`, err);
  });

  reader.on("end", () => {
    console.log(`${reader.reader.name}  device removed`);
  });
});

nfc.on("error", (err) => {
  console.log("an error occurred", err);
});

//
async function readCard({ reader }) {
  let cardHeader = await reader.read(0, 20);
  let tag = nfcCard.parseInfo(cardHeader);
  // console.log("tag info:", JSON.stringify(tag));

  // There might be a NDEF message and we are able to read the tag
  if (
    nfcCard.isFormatedAsNDEF() &&
    nfcCard.hasReadPermissions() &&
    nfcCard.hasNDEFMessage()
  ) {
    // Read the appropriate length to get the NDEF message as buffer
    const NDEFRawMessage = await reader.read(
      4,
      nfcCard.getNDEFMessageLengthToRead()
    ); // starts reading in block 0 until 6

    // Parse the buffer as a NDEF raw message
    const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);
    // await say.speak("READ OK");

    console.log("can read card");
    // console.log("NDEFMessage:", NDEFMessage);
  } else {
    console.log(
      "Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable."
    );
  }
}

async function ensureRecord({
  reader,
  url = "https://agape-studio.reunite.digitals/",
}) {
  let cardHeader = await reader.read(0, 20);
  let tag = nfcCard.parseInfo(cardHeader);
  //console.log("tag info:", JSON.stringify(tag));

  // There might be a NDEF message and we are able to read the tag
  if (
    nfcCard.isFormatedAsNDEF() &&
    nfcCard.hasReadPermissions() &&
    nfcCard.hasNDEFMessage()
  ) {
    // Read the appropriate length to get the NDEF message as buffer
    const NDEFRawMessage = await reader.read(
      4,
      nfcCard.getNDEFMessageLengthToRead()
    ); // starts reading in block 0 until 6

    // Parse the buffer as a NDEF raw message
    const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);

    // console.log("NDEFMessage:", NDEFMessage);

    let hasWrittenSuccessfully = NDEFMessage.some(
      (r) => r.uri === url //
    );
    if (hasWrittenSuccessfully) {
      //console.log("ok Yo");
      

      await say.speak("DATA IS WRITTEN, RELEASE CARD");
    }
  } else {
    console.log(
      "Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable."
    );
  }
}

async function writeCard({
  reader,
  url = "https://agape-studio.reunite.digital/",
}) {
  // Starts reading in block 0 for 20 bytes long
  const cardHeader = await reader.read(0, 20);

  const tag = nfcCard.parseInfo(cardHeader);
  // console.log("tag info:", JSON.stringify(tag));

  // 2 - WRITE A NDEF MESSAGE AND ITS RECORDS
  const message = [
    //
    { type: "uri", uri: url },
  ];

  // Prepare the buffer to write on the card
  const rawDataToWrite = nfcCard.prepareBytesToWrite(message);

  // Write the buffer on the card starting at block 4
  const preparationWrite = await reader.write(4, rawDataToWrite.preparedData);

  // Success !
  if (preparationWrite) {
    // await say.speak("WRITE OK");
    notifier.notify({title:'Card Info',message:'Card write successfully. Please remove now.'});
    console.log("Data have been written successfully. Done");

  }
}
