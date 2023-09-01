//import notifier from 'node-notifier';
//import { NFC } from 'nfc-pcsc';
//import nfcCard from 'nfccard-tool';

const notifier = require('node-notifier');
const { NFC } = require("nfc-pcsc");
const nfcCard = require("nfccard-tool");


class Card {

    async start() {

        //const notifier = require('node-notifier');
        const nc = new notifier.NotificationCenter();

        //const { NFC } = require("nfc-pcsc");

        const nfc = new NFC(); // optionally you can pass logger
        // const nfcCard = require("nfccard-tool");
        // ""

        //const Say = require("say").Say;
        // const say = new Say("darwin" || "win32" || "linux");
        //ACS ACR122U PICC Interface  device attached

        nfc.on("reader", (reader) => {
            console.log(`${reader.reader.name}  device attached`);

            reader.on("card", async (card) => {

                console.log(`Card detected`);

                let urlToWrite = `https://vcard.waptechy.com/setiamovers`;

                try {
                    await this.write({
                        reader,
                        url: urlToWrite,
                    });
                } catch (e) {
                    console.log("error", e);
                   // say.speak("CANNOT CONFIRM");
                    return;
                }
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


    }

    async delay(v) {
        new Promise((r) => {
            setTimeout(r, v);
        });
    }

    async write({
        reader,
        url = "https://agape-studio.reunite.digital/",
    }) {
        // Starts reading in block 0 for 20 bytes long
        const cardHeader = await reader.read(0, 20);

        const tag = nfcCard.parseInfo(cardHeader);
       // console.log("tag info:", JSON.stringify(tag));
       // console.log(reader.card);

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
            notifier.notify({ title: 'Writer', message: `Data successfully write to card '${reader.card.uid}'. Please remove now.` });
            console.log("Data have been written successfully. Done");

        }
    }

    async read({
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

}
module.exports = Card;
