const { NFC } = require("nfc-pcsc");

const nfc = new NFC(); // optionally you can pass logger
const nfcCard = require("nfccard-tool");
// ""

const Say = require("say").Say;
const say = new Say("darwin" || "win32" || "linux");
//ACS ACR122U PICC Interface  device attached

const delay = async (v) =>
  new Promise((r) => {
    setTimeout(r, v);
  });

  async function ensureRecord({
    reader
  }) {
    let cardHeader = await reader.read(0, 20);
    let tag = nfcCard.parseInfo(cardHeader);
    console.log("tag info:", JSON.stringify(tag));

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
    
        console.log("NDEFMessage:", NDEFMessage);
      } else {
        console.log(
          "Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable."
        );
      }
}

nfc.on("reader", (reader) => {
  console.log(`${reader.reader.name}  device attached`);

  reader.on("card", async (card) => {

    console.log(`card detected`, card);

    await ensureRecord({
        reader
      });
  });

});