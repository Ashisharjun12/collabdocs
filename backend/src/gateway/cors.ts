
export const corsOption = {
    origin: ["https://collabdocs-roan.vercel.app", "https://thecollabdocs.tech", "https://www.thecollabdocs.tech","http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}
