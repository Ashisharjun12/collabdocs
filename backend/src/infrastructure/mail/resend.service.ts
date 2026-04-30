import { Resend } from "resend";
import { _config } from "../../config/config.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../../utils/logger.js";
import { CircuitBreakerFactory } from "../circuitBreaker/CircuitBreaker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ResendService {
    private resend: Resend;
    private breaker;

    constructor() {
        this.resend = new Resend(_config.RESEND_API);
        this.breaker = CircuitBreakerFactory.create(
            async (options: { from: string, to: string, subject: string, html: string }) => {
                return this.resend.emails.send(options);
            },
            'ResendEmailService',
            {
                timeout: 10000, // Email can be slow, wait 10s
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
            }
        );
    }

    // send email using ejs templates
    async sendEmail(to: string, subject: string, templateName: string, data: any) {
        try {
            const templatePath = path.join(__dirname, `${templateName}.ejs`);
            const html = await ejs.renderFile(templatePath, data);

            const result = await this.breaker.fire({
                from: `collabdocs <no-reply@${_config.VERIFIED_DOMAIN}>`,
                to,
                subject,
                html,
            });

            if (result.error) {
                logger.error(result.error, "Failed to send email via Resend");
                throw new Error(result.error.message);
            }

            return result.data;
        } catch (error: any) {
            logger.error(error, `Error rendering or sending email: ${error.message}`);
            throw error;
        }
    }
}

export const resendService = new ResendService();
