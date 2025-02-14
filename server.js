const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors()); // Cho phép CORS từ mọi nguồn gốc

// Sử dụng EJS làm view engine
app.set("view engine", "ejs");
app.use(express.static("public"));



app.get("/", async (req, res) => {
    try {
        const response = await axios.get("https://api.laftel.tv/v1.0/series/discover/?limit=40&offset=0&ordering=recent_updated");
        res.render("index", { data: response.data.results });
    } catch (error) {
        res.status(500).send("Error fetching data");
    }
});
app.use(cors()); // Cho phép CORS từ mọi nguồn gốc

// Proxy API để tránh lỗi CORS
app.get("/api/seasons/", async (req, res) => {
    const { series_id } = req.query;

    if (!series_id) {
        return res.status(400).json({ error: "series_id is required" });
    }

    try {
        const response = await axios.get(`https://api.laftel.tv/v1.0/seasons/?series_id=${series_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi gọi API" });
    }
});
app.get("/api/season/", async (req, res) => {
    const { season_id } = req.query;

    if (!season_id) {
        return res.status(400).json({ error: "season_id is required" });
    }

    try {
        const response = await axios.get(`https://api.laftel.tv/v1.0/episodes/?season_id=${season_id}&limit=20&offset=0`);
        
        const episodes = response.data.results.map(episode => {
            return {
                ...episode,
                vietsub: episode.image
                    .replace(/Preview\.\d+\.jpg$/, "subtitles/vi.vtt")
                    .replace(/thumbnail.laftel.tv\/assets/, "streaming.laftel.tv")
            };
        });

        res.json({ ...response.data, results: episodes }); // Trả về dữ liệu đã chỉnh sửa
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi gọi API" });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
