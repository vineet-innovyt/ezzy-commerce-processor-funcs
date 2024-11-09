import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() { }

  @Get('ver')
  getVer() {
    return {
      version: '0.1, init',
      env: process.env.ENV,
      host: process.env.EZZY_COMM_HOST,
      VERSION: process.env.VERSION,
    };
  }
}
