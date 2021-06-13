import { IncomingMessage } from "http";

export const collectData = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body: any[] = [];
    request
      .on("error", (err) => {
        console.error(err);
        reject(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(body).toString());
      });
  });
