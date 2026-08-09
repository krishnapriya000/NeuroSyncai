const http = require("http");

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });

    const req = http.request({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("Testing POST /api/auth/login with krishnaak0404@gmail.com...");
  const res = await testLogin("krishnaak0404@gmail.com", "Krishna#4");
  console.log("Response Status:", res.status);
  console.log("Response Body:", res.body);
}

run();
