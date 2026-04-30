
import{_config} from "./src/config/config"
import { defineConfig } from 'drizzle-kit';

const isTest = _config.NODE_ENV === 'test';

export default defineConfig({
  schema: "./src/infrastructure/postgres/schema.ts",  
  out: "./src/infrastructure/postgres/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:isTest ? _config.POSTGRES_DATABASE_URL! : _config.POSTGRES_DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  }

} )
