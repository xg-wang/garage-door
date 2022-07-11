import * as dotenv from "dotenv";
import { myQApi } from "@hjdhjd/myq";

dotenv.config();

const myQPassword = process.env["MYQ_PASSWORD"];
const myQUsername = process.env["MYQ_USERNAME"];
const myQSerialNumber = process.env["MYQ_SERIAL_NUMBER"];

function fail(errorMessage: string) {
  throw new Error(errorMessage);
}

async function main() {
  if (!myQUsername || !myQPassword || !myQSerialNumber) {
    return fail("credentials missing!");
  }

  const api = new myQApi(myQUsername, myQPassword);
  const apiCallSuccessful = await api.refreshDevices();
  if (!apiCallSuccessful) {
    return fail("MyQ API call failed!");
  }

  const device = api.getDevice(myQSerialNumber);
  if (!device) {
    return fail("Cannot find device!");
  }

  const state = device.state.door_state;
  console.log(`Garage door state: ${state}`);
}

main();
