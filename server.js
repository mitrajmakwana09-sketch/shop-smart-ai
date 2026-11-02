
/* =========================================================
   SHOP SMART AI - BACKEND SERVER
   File: server.js

   Features:
   - Express Server
   - Product API
   - Product Categories
   - AI Shopping Assistant
   - CORS Security
   - Rate Limiting
   - Error Handling
========================================================= */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = process.env.PORT || 5000;

// ---------- BASIC CONFIGURATION ----------

app.disable("x-powered-by");

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5500",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "20kb" }));

// ---------- RATE LIMITING ----------

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

// ---------- API CONFIGURATION ----------

const PRODUCT_API = "https://fakestoreapi.com";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ---------- HELPER FUNCTIONS ----------

async function fetchAPI(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json"
        },
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
    }

    return response.json();
}

// ---------- HEALTH CHECK ----------

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Shop Smart AI Backend",
        status: "Server Running",
        version: "1.0.0"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// ---------- GET ALL PRODUCTS ----------

app.get("/api/products", async (req, res, next) => {
    try {
        const products = await fetchAPI(
            `${PRODUCT_API}/products`
        );

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
});

// ---------- GET SINGLE PRODUCT ----------

app.get("/api/products/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const product = await fetchAPI(
            `${PRODUCT_API}/products/${id}`
        );

        res.json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
});

// ---------- GET PRODUCT CATEGORIES ----------

app.get("/api/categories", async (req, res, next) => {
    try {
        const categories = await fetchAPI(
            `${PRODUCT_API}/products/categories`
        );

        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        next(error);
    }
});

// ---------- GET PRODUCTS BY CATEGORY ----------

app.get(
    "/api/products/category/:category",
    async (req, res, next) => {
        try {
            const category = req.params.category;

            if (!category || category.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category."
                });
            }

            const products = await fetchAPI(
                `${PRODUCT_API}/products/category/${encodeURIComponent(category)}`
            );

            res.json({
                success: true,
                count: products.length,
                products
            });
        } catch (error) {
            next(error);
        }
    }
);

// ---------- AI SHOPPING ASSISTANT ----------

app.post("/api/assistant", async (req, res, next) => {
    try {
        const { message, history = [] } = req.body;

        if (
            typeof message !== "string" ||
            message.trim().length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Message is too long."
            });
        }

        if (!Array.isArray(history) || history.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat history."
            });
        }

        if (!GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: "AI Assistant is not configured. Add GEMINI_API_KEY to your .env file."
            });
        }

        // Fetch products for shopping context
        const products = await fetchAPI(
            `${PRODUCT_API}/products`
        );

        const productContext = products.map(product => ({
            id: product.id,
            title: product.title,
            category: product.category,
            price: product.price,
            rating: product.rating,
            description: product.description
        }));

        // Validate and format conversation history
        const validHistory = history
            .filter(item =>
                item &&
                ["user", "model"].includes(item.role) &&
                typeof item.text === "string"
            )
            .slice(-10)
            .map(item => ({
                role: item.role,
                parts: [{ text: item.text.slice(0, 2000) }]
            }));

        const contents = [
            ...validHistory,
            {
                role: "user",
                parts: [
                    {
                        text: message.trim()
                    }
                ]
            }
        ];

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: `
You are Shop Smart AI, a friendly shopping assistant.

Your responsibilities:
1. Help users find products.
2. Recommend products based on user preferences.
3. Explain product features.
4. Compare products.
5. Answer shopping-related questions.
6. Be concise and helpful.
7. Never invent product availability or prices.
8. Only recommend products from the supplied product list.
9. Product prices are provided in the source API currency.
10. Do not request passwords, PINs, or payment credentials.

Available Products:
${JSON.stringify(productContext)}
                                `
                            }
                        ]
                    },
                    contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                }),
                signal: AbortSignal.timeout(30000)
            }
        );

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json()
                .catch(() => ({}));

            console.error(
                "Gemini API Error:",
                errorData.error?.message || geminiResponse.status
            );

            return res.status(502).json({
                success: false,
                message: "AI Assistant is temporarily unavailable."
            });
        }

        const aiData = await geminiResponse.json();

        const reply =
            aiData.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

        if (!reply) {
            return res.status(502).json({
                success: false,
                message: "AI did not generate a response."
            });
        }

        res.json({
            success: true,
            reply
        });

    } catch (error) {
        next(error);
    }
});

// ---------- 404 HANDLER ----------

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// ---------- GLOBAL ERROR HANDLER ----------

app.use((error, req, res, next) => {
    console.error("Server Error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: "Something went wrong on the server."
    });
});

// ---------- START SERVER ----------

app.listen(PORT, () => {
    console.log("--------------------------------------");
    console.log(" SHOP SMART AI BACKEND");
    console.log("--------------------------------------");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Products: http://localhost:${PORT}/api/products`);
    console.log(`Categories: http://localhost:${PORT}/api/categories`);
    console.log(`AI Assistant: http://localhost:${PORT}/api/assistant`);
    console.log("--------------------------------------");
});
