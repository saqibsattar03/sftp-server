import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as Client from 'ssh2-sftp-client';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as crypto from 'crypto-js';
import * as AdmZip from 'adm-zip';
import * as archiver from 'archiver';
import * as JSZip from 'jszip';

@Injectable()
export class ServerService {
  private sftp: Client;

  constructor() {
    this.sftp = new Client();
  }

  //*** connection to sftp server ***//
  async onModuleInit(): Promise<void> {
    try {
      const config = {
        host: process.env.SFTP_SERVER,
        username: process.env.SFTP_USER,
        password: process.env.SFTP_PASSWORD,

        //*** uncomment line below to use ssh private key to connect to server ***//
        // privateKey: fs.readFileSync('C:/Users/ranas/.ssh/id_rsa'),

        port: process.env.SFTP_PORT || 22,
      };

      this.sftp = new Client();
      await this.sftp.connect(config);
      console.log('Connected to SFTP server');
    } catch (error) {
      console.error('Error connecting to SFTP server:', error);
      throw error;
    }
  }

  async downloadFile(fileName: string, searchPath = '/'): Promise<any> {
    const entries = await this.sftp.list(searchPath);

    for (const entry of entries) {
      if (entry.name === fileName) {
        const p =
          searchPath === '/' ? `/${fileName}` : `${searchPath}/${fileName}`;
        console.log('path :: ', p);

        // fs.access('Home01', fs.constants.F_OK, (err) => {
        //   if (err) {
        //     // fs.mkdir('Home01');
        //   }
        // });

        const fileWtr = await fs.createWriteStream(
          path.join('d:/server-files', p),
        );
        console.log('fileWtr :: ', fileWtr);
        return fileWtr.path;
      }

      if (entry.type === 'd') {
        const subPath =
          searchPath === '/' ? `/${entry.name}` : `${searchPath}/${entry.name}`;
        const result = await this.downloadFile(fileName, subPath);

        if (result) {
          return result;
        }
      }
    }
  }

  async downloadDirectory(
    directoryName: string,
    searchPath = '/',
  ): Promise<any> {
    const entries = await this.sftp.list(searchPath);

    for (const entry of entries) {
      if (entry.name === directoryName) {
        const p =
          searchPath === '/'
            ? `/${directoryName}`
            : `${searchPath}/${directoryName}`;
        console.log('path :: ', p);

        // const fileWtr = await fs.createWriteStream(path.join('d:', p));
        // console.log('fileWtr :: ', fileWtr);

        await this.sftp.downloadDir(p, 'd:');
        // console.log('d :: ', await d);
      }

      if (entry.type === 'd') {
        const subPath =
          searchPath === '/' ? `/${entry.name}` : `${searchPath}/${entry.name}`;
        const result = await this.downloadDirectory(directoryName, subPath);

        if (result) {
          return result;
        }
      }
    }
  }

  async uploadFile(src, destination): Promise<any> {
    const src1 = path.join(__dirname, '..', '..', 'test');
    const result = await this.sftp.uploadDir(
      src1,
      '/kunden/homepages/4/d951299133/htdocs',
    );
    if (!result)
      throw new HttpException(
        'could not upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return 'file uploaded successfully';
  }

  async createDirectory(): Promise<any> {
    const remoteDir = '/destination1';
    await this.sftp.mkdir(remoteDir, true);
  }

  async readFileData(source: string): Promise<any> {
    const hashedFiles = [];
    const remoteDir = '/destination/text.txt';
    const data = await this.sftp.get(remoteDir);
    const originalData = data.toString('utf8');
    hashedFiles[0] = crypto.SHA256(originalData).toString();
    console.log('SHA-256 hash for text.txt:', hashedFiles[0]);

    const remoteDir1 = '/destination/test.txt';
    const data1 = await this.sftp.get(remoteDir1);
    const originalData1 = data1.toString('utf8');
    hashedFiles[1] = crypto.SHA256(originalData1).toString();
    console.log('SHA-256 hash for test.txt:', hashedFiles[1]);

    if (hashedFiles[0] === hashedFiles[1]) {
      return 'Data matched';
    } else {
      return 'Data is  different';
    }
  }

  //*** rename a file or directory ***//
  async rename(oldName: string, newName: string): Promise<any> {
    // const from = '/destination/text.txt';
    // const to = '/destination/test1.txt';

    await this.sftp
      .rename(oldName, newName)
      .then(() => {
        return this.sftp.end();
      })
      .catch((err) => {
        return err;
      });
  }
  async zipSingleFile(): Promise<any> {
    const zip = new JSZip();
    zip.file('hello.txt', 'Hello, world!');

    // Add more files or data to the zip here...

    const zipData = await zip.generateAsync({ type: 'nodebuffer' });

    const outputPath = path.join('D:', '/', 'output.zip');

    fs.writeFile(outputPath, zipData, (err) => {
      if (err) {
        console.error('Error saving zip file:', err);
      } else {
        console.log('Zip file saved successfully.');
      }
    });
  }

  async zipDirectory(directoryPath: string): Promise<any> {
    directoryPath = 'd:/Scan';
    const zip = new JSZip();
    const files = await this.readFilesFromDirectory(directoryPath, '');

    for (const file of files) {
      const filePath = path.join(directoryPath, file.relativePath);
      const fileData = fs.readFileSync(filePath);
      zip.file(file.relativePath, fileData);
    }

    const zipData = await zip.generateAsync({ type: 'nodebuffer' });

    const outputPath = path.join('D:', '/', 'upwork.zip');

    fs.writeFile(outputPath, zipData, (err) => {
      if (err) {
        console.error('Error saving zip file:', err);
      } else {
        console.log('Zip file saved successfully.');
      }
    });
  }
  private async readFilesFromDirectory(
    directoryPath: string,
    relativePath: string,
  ): Promise<{ relativePath: string }[]> {
    const files = await fs.promises.readdir(directoryPath);
    const result: { relativePath: string }[] = [];

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isFile()) {
        result.push({ relativePath: path.join(relativePath, file) });
      } else if (stat.isDirectory()) {
        const subFiles = await this.readFilesFromDirectory(
          filePath,
          path.join(relativePath, file),
        );
        result.push(...subFiles);
      }
    }

    return result;
  }
}
