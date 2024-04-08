import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AIService {

    constructor(private httpService: HttpService) {}
    
    async predict(seed: number, prompt: string) {
        const url = 'https://ai-backend-v2-rewr2tq56a-ey.a.run.app/predict';
        const body = { seed, prompt };
    
        try {
          const response$ = this.httpService.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 1200000, // Timeout in milliseconds
          });
          const response = await lastValueFrom(response$); // Convert Observable to Promise
          return response.data;
        } catch (error) {
          throw new Error(`Failed to call AI backend: ${error.message}`);
        }
    }
}