import { Controller, Get, Inject, Patch, Post, Query } from '@nestjs/common';
import { ServerService } from './server.service';

@Controller('server')
export class ServerController {
  constructor(
    @Inject(ServerService) private readonly sftpService: ServerService,
  ) {}

  @Get('download-file')
  async downloadFile() {
    return this.sftpService.downloadFile('New file5.txt');
  }
  @Get('download-directory')
  async downloadDirectory() {
    return this.sftpService.downloadDirectory('/destination');
  }
  @Post('upload-file')
  uploadFile(@Query('src') src, @Query('destination') destination) {
    return this.sftpService.uploadFile(src, destination);
  }
  @Post('create-directory')
  createDirectory() {
    return this.sftpService.createDirectory();
  }

  @Get('read-file')
  readFileData(@Query('source') source) {
    return this.sftpService.readFileData(source);
  }

  @Patch('rename')
  rename(@Query('oldName') oldName, @Query('newName') newName) {
    return this.sftpService.rename(oldName, newName);
  }

  @Get('zip-single-file')
  zipSingleFile() {
    return this.sftpService.zipSingleFile();
  }
  @Get('zip-Directory')
  zipDirectory(@Query('directoryPath') directoryPath) {
    return this.sftpService.zipDirectory(directoryPath);
  }
}
