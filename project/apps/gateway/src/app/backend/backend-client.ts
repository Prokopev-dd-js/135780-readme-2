import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { type Method } from 'axios';

export enum BackendService {
  Account = 'ACCOUNT_URL',
  Publication = 'PUBLICATION_URL',
  File = 'FILE_URL',
  Notification = 'NOTIFICATION_URL',
}

interface BackendRequestOptions {
  body?: unknown;
  query?: object;
  userId?: string;
  responseType?: 'arraybuffer';
}

@Injectable()
export class BackendClient {
  public constructor(private readonly config: ConfigService) {}

  public async request<T>(
    service: BackendService,
    method: Method,
    path: string,
    options: BackendRequestOptions = {},
  ): Promise<T> {
    try {
      const response = await axios.request<T>({
        url: `${this.config.getOrThrow<string>(service).replace(/\/$/, '')}${path}`,
        method,
        data: options.body,
        params: options.query,
        headers: options.userId ? { 'x-user-id': options.userId } : {},
        responseType: options.responseType,
        timeout: this.config.get<number>('HTTP_TIMEOUT', 10000),
        maxRedirects: 0,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500) {
          let body = error.response?.data;
          if (Buffer.isBuffer(body)) {
            try {
              body = JSON.parse(body.toString('utf8'));
            } catch {
              body = body.toString('utf8');
            }
          }
          throw new HttpException(
            body ?? 'Backend rejected the request',
            status,
          );
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new GatewayTimeoutException('Backend request timed out');
        }
      }
      throw new BadGatewayException('Backend service is unavailable');
    }
  }
}
