import * as https from "node:https";
import * as dotenv from "dotenv";
import { myQApi } from "@hjdhjd/myq";

dotenv.config();

const myQPassword = process.env["MYQ_PASSWORD"];
const myQUsername = process.env["MYQ_USERNAME"];
const myQSerialNumber = process.env["MYQ_SERIAL_NUMBER"];
const telegramBotToken = process.env["TG_BOT_TOKEN"];
const telegramChatId = process.env["TG_CHAT_ID"];

function fail(errorMessage: string) {
  throw new Error(errorMessage);
}

async function main() {
  if (!myQUsername || !myQPassword || !myQSerialNumber) {
    return fail("credentials missing!");
  }

  console.log("Refreshing MyQ Devices...");
  const api = new myQApi(myQUsername, myQPassword);
  const apiCallSuccessful = await api.refreshDevices();
  if (!apiCallSuccessful) {
    return fail("MyQ API call failed!");
  }

  console.log("Getting MyQ Garage Door state...");
  const device = api.getDevice(myQSerialNumber);
  if (!device) {
    return fail("Cannot find device!");
  }

  const state = device.state.door_state;
  console.log(`Garage door state: ${state}`);

  if (state !== "closed") {
    await postMessage(state);
  }
}

function postMessage(state: string) {
  console.log(`Messaging Telegram Group...`);
  const postData = JSON.stringify({
    chat_id: telegramChatId,
    text: `${state}`,
  });
  const options = {
    hostname: "api.telegram.org",
    path: `/bot${telegramBotToken}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log("statusCode:", res.statusCode);

      res.on("end", () => {
        resolve("ok");
      });
    });

    req.on("error", (e) => {
      console.error(e);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

main();
