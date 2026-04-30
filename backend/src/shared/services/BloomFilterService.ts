import pkg from 'bloom-filters';
const { BloomFilter } = pkg;
import { db } from '../../infrastructure/postgres/postgres-client.js';
import { users } from '../../modules/user/user.schema.js';
import { logger } from '../../utils/logger.js';

export class BloomFilterService {
    private static instance: BloomFilterService;
    private filter: any;
    private readonly size = 10000; // Expected number of users
    private readonly errorRate = 0.01; // 1% false positive rate

    private constructor() {
        this.filter = BloomFilter.create(this.size, this.errorRate);
    }

    public static getInstance(): BloomFilterService {
        if (!BloomFilterService.instance) {
            BloomFilterService.instance = new BloomFilterService();
        }
        return BloomFilterService.instance;
    }

  // Initialize the filter with all existing user emails from DB
    public async initialize(): Promise<void> {
        try {
            const allUsers = await db.select({ email: users.email }).from(users);
            allUsers.forEach(user => {
                this.filter.add(user.email.toLowerCase());
            });
            logger.info(`Bloom Filter initialized with ${allUsers.length} users`);
        } catch (error) {
            logger.error('Failed to initialize Bloom Filter');
        }
    }

  // Add a single email to the filter
    public add(email: string): void {
        this.filter.add(email.toLowerCase());
    }

  // Check if an email might exist in the system
   
    public mightExist(email: string): boolean {
        return this.filter.has(email.toLowerCase());
    }
}
