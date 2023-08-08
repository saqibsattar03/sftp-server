import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    // return await this.appService.download();
  }

  @Get('/get-real-path')
  async getRealPath(@Query('filename') filename) {
    // return await this.appService.getRealPath('test111.txt');
  }
}
