
export const corsOption = {
    origin: ["https://collabdocs-roan.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS" ],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}
